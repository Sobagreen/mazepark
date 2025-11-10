const http = require("http");
const { WebSocketServer } = require("ws");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);

const DATA_DIR = path.join(__dirname, "data");
const MATCHES_PATH = path.join(DATA_DIR, "match-history.json");
const RATINGS_PATH = path.join(DATA_DIR, "ratings.json");
const DEFAULT_RATING = 1200;
const HISTORY_THRESHOLD = 6;
const MAX_HISTORY_LENGTH = 256;
const K_FACTOR = 32;

const rooms = new Map();
ensureDataStorage();

let matchHistory = loadJson(MATCHES_PATH, []);
let globalRatings = loadJson(RATINGS_PATH, {});

const server = http.createServer(handleHttpRequest);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket) => {
  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  let membership = null;

  socket.on("message", (data) => {
    let payload;
    try {
      payload = JSON.parse(data.toString());
    } catch (err) {
      return;
    }

    if (!payload || typeof payload.type !== "string") {
      return;
    }

    if (payload.type === "join") {
      handleJoin(socket, payload);
      return;
    }

    if (!membership) {
      send(socket, { type: "error", message: "Сначала выберите комнату и сторону." });
      return;
    }

    if (payload.type === "state") {
      handleStateUpdate(membership, payload);
      return;
    }

    if (payload.type === "history") {
      handleHistoryMessage(membership, payload);
      return;
    }
  });

  socket.on("close", () => {
    if (!membership) return;
    const room = rooms.get(membership.roomId);
    if (!room) return;
    const current = room.clients.get(membership.role);
    if (current === socket) {
      room.clients.delete(membership.role);
      if (room.playerIds && membership.role) {
        room.playerIds[membership.role] = null;
      }
      broadcastPlayers(membership.roomId);
      if (room.clients.size === 0) {
        rooms.delete(membership.roomId);
      }
    }
  });

  socket.on("error", () => {
    // ошибки соединения игнорируются, закрытие обработает onclose
  });

  function handleJoin(ws, payload) {
    if (membership) {
      send(ws, { type: "error", message: "Повторное подключение запрещено." });
      return;
    }
    const roomId = normaliseRoomId(payload.roomId);
    const role = typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "";
    if (!roomId) {
      send(ws, { type: "error", message: "Некорректное название комнаты." });
      return;
    }
    if (role !== "light" && role !== "shadow") {
      send(ws, { type: "error", message: "Выберите сторону: light или shadow." });
      return;
    }

    const room = getRoom(roomId);
    if (room.clients.has(role)) {
      send(ws, { type: "error", message: "Эта сторона уже занята." });
      return;
    }

    room.clients.set(role, ws);
    const playerId = sanitisePlayerId(payload.playerId);
    if (!room.playerIds) {
      room.playerIds = { light: null, shadow: null };
    }
    room.playerIds[role] = playerId;
    membership = { roomId, role, playerId };

    const desiredSkin = sanitiseSkinEntry({ skin: payload.skin, type: payload.skinType });
    room.skins = mergeSkins(room.skins, { [role]: desiredSkin });
    if (room.state) {
      const mergedSkins = mergeSkins(room.state.skins || {}, room.skins);
      room.state = { ...room.state, skins: mergedSkins };
    }

    send(ws, {
      type: "joined",
      roomId,
      role,
      players: getPlayersSnapshot(roomId),
      state: room.state,
      laser: room.lastLaser,
      matchId: room.historyMatchId || null,
      exportedLength: Array.isArray(room.history) ? room.history.length : 0,
      ratings: buildRatingsPayload(room, playerId),
      message: `Подключено к комнате ${roomId}.`
    });

    broadcastPlayers(roomId);
    for (const [otherRole, clientSocket] of room.clients.entries()) {
      if (!clientSocket || clientSocket === ws) continue;
      const ratingsPayload = buildRatingsPayload(room, room.playerIds ? room.playerIds[otherRole] : null);
      send(clientSocket, { type: "ratings", ratings: ratingsPayload });
    }
    if (room.state && room.clients.size > 1) {
      const mergedSkins = mergeSkins(room.state.skins || {}, room.skins);
      room.state = { ...room.state, skins: mergedSkins };
      broadcast(roomId, {
        type: "state",
        state: room.state,
        players: getPlayersSnapshot(roomId),
        author: role,
        reason: "skin-sync",
        laser: room.lastLaser
      });
    }
  }

  function handleStateUpdate(member, payload) {
    const room = rooms.get(member.roomId);
    if (!room || room.clients.get(member.role) !== socket) {
      return;
    }
    if (!payload.state || typeof payload.state !== "object") {
      return;
    }
    room.state = payload.state;
    const mergedSkins = mergeSkins(room.skins, payload.state && payload.state.skins ? payload.state.skins : {});
    room.skins = mergedSkins;
    if (room.state) {
      room.state.skins = mergedSkins;
    }
    let laserSnapshot;
    if (Object.prototype.hasOwnProperty.call(payload, "laser")) {
      laserSnapshot = payload.laser;
    } else if (payload.state && Object.prototype.hasOwnProperty.call(payload.state, "laser")) {
      laserSnapshot = payload.state.laser;
    }
    if (laserSnapshot !== undefined) {
      room.lastLaser = laserSnapshot;
    }
    const message = {
      type: "state",
      state: room.state,
      players: getPlayersSnapshot(member.roomId),
      author: member.role,
      laser: room.lastLaser
    };
    if (typeof payload.reason === "string" && payload.reason) {
      message.reason = payload.reason;
    }
    broadcast(member.roomId, message);
  }

  function handleHistoryMessage(member, payload) {
    if (!member) return;
    const room = rooms.get(member.roomId);
    if (!room || room.clients.get(member.role) !== socket) {
      return;
    }
    const moves = Array.isArray(payload.history) ? payload.history.slice(0, MAX_HISTORY_LENGTH) : [];
    if (!moves.length) {
      return;
    }
    const sanitisedMoves = moves.map(sanitiseHistoryEntry).filter(Boolean).slice(-MAX_HISTORY_LENGTH);
    if (!sanitisedMoves.length) {
      return;
    }
    const incomingMatchId = sanitiseMatchId(payload.matchId);
    const matchId = incomingMatchId || room.historyMatchId || generateMatchId();
    room.history = sanitisedMoves;
    room.historyMatchId = matchId;

    const destroyedHero = sanitiseRole(payload.destroyedHero);
    const winnerRole = sanitiseRole(payload.winner);
    const metadata = {
      final: Boolean(payload.final),
      destroyedHero,
      winner: winnerRole,
      layout: sanitiseLayoutKey(payload.layout),
      skins: sanitiseSkins(payload.skins)
    };

    if (metadata.final && winnerRole && destroyedHero) {
      applyMatchResultRatings(room, winnerRole);
      saveRatings();
    }

    if (metadata.final || sanitisedMoves.length > HISTORY_THRESHOLD) {
      persistMatchRecord(member.roomId, matchId, room, sanitisedMoves, metadata);
    }

    const ackRatings = buildRatingsPayload(room, room.playerIds[member.role]);
    send(socket, {
      type: "history-ack",
      matchId,
      exportedLength: sanitisedMoves.length,
      ratings: ackRatings
    });

    if (metadata.final && winnerRole && destroyedHero) {
      for (const [role, clientSocket] of room.clients.entries()) {
        if (!clientSocket || clientSocket === socket) continue;
        const ratingsPayload = buildRatingsPayload(room, room.playerIds[role]);
        send(clientSocket, { type: "ratings", ratings: ratingsPayload });
      }
    }
  }
});

const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (socket.isAlive === false) {
      socket.terminate();
      continue;
    }
    socket.isAlive = false;
    socket.ping();
  }
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeat);
});

server.listen(PORT, () => {
  console.log(`Laser duel server running on port ${PORT}`);
});

function sanitisePlayerId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 64);
}

function sanitiseRole(value) {
  return value === "light" || value === "shadow" ? value : null;
}

function sanitiseMatchId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 48);
}

function generateMatchId() {
  return `match-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitiseLayoutKey(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.slice(0, 32);
}

function sanitiseNotation(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null;
  return trimmed.slice(0, 4);
}

const ALLOWED_DIRECTIONS = new Set(["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"]);

function sanitiseDirection(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ALLOWED_DIRECTIONS.has(trimmed) ? trimmed : null;
}

function sanitisePieceType(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 24);
}

function sanitiseAction(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.slice(0, 24);
}

function sanitiseRotation(value) {
  if (!value || typeof value !== "object") return null;
  const direction = typeof value.direction === "string" ? value.direction.trim() : null;
  const delta = Number(value.degrees);
  const before = typeof value.before === "string" ? value.before.trim() : null;
  const after = typeof value.after === "string" ? value.after.trim() : null;
  return {
    direction: direction && direction.length <= 2 ? direction : null,
    degrees: Number.isFinite(delta) ? delta : null,
    before: before && before.length <= 2 ? before : null,
    after: after && after.length <= 2 ? after : null
  };
}

function sanitiseCapture(value) {
  if (!value || typeof value !== "object") return null;
  return {
    pieceType: sanitisePieceType(value.pieceType),
    player: sanitiseRole(value.player),
    at: sanitiseNotation(value.at)
  };
}

function sanitiseHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const order = Number(entry.order);
  const turn = Number(entry.turn);
  return {
    order: Number.isFinite(order) ? order : null,
    turn: Number.isFinite(turn) ? turn : null,
    player: sanitiseRole(entry.player),
    pieceType: sanitisePieceType(entry.pieceType),
    action: sanitiseAction(entry.action),
    from: sanitiseNotation(entry.from),
    to: sanitiseNotation(entry.to),
    direction: sanitiseDirection(entry.direction),
    rotation: sanitiseRotation(entry.rotation),
    capture: sanitiseCapture(entry.capture),
    destroyedHero: sanitiseRole(entry.destroyedHero),
    swapWith: sanitisePieceType(entry.swapWith),
    swapWithPlayer: sanitiseRole(entry.swapWithPlayer)
  };
}

function sanitiseSkins(value) {
  const result = { light: null, shadow: null };
  if (!value || typeof value !== "object") {
    return result;
  }
  for (const role of ["light", "shadow"]) {
    result[role] = sanitiseSkinEntry(value[role]);
  }
  return result;
}

function persistMatchRecord(roomId, matchId, room, moves, metadata = {}) {
  if (!matchId) return;
  const timestamp = new Date().toISOString();
  let record = matchHistory.find((item) => item.matchId === matchId);
  if (!record) {
    record = { matchId, createdAt: timestamp };
    matchHistory.push(record);
  }
  record.roomId = roomId;
  record.updatedAt = timestamp;
  record.status = metadata.final ? "completed" : "in-progress";
  record.moves = moves;
  record.layout = metadata.layout || null;
  record.skins = metadata.skins || { light: null, shadow: null };
  record.players = {
    light: room.playerIds && room.playerIds.light ? { id: room.playerIds.light, rating: getRating(room.playerIds.light) } : null,
    shadow: room.playerIds && room.playerIds.shadow ? { id: room.playerIds.shadow, rating: getRating(room.playerIds.shadow) } : null
  };
  if (metadata.final) {
    record.outcome = {
      winner: metadata.winner,
      destroyedHero: metadata.destroyedHero
    };
    record.completedAt = record.completedAt || timestamp;
  }
  if (matchHistory.length > 500) {
    matchHistory = matchHistory.slice(matchHistory.length - 500);
  }
  saveMatchHistory();
}

function applyMatchResultRatings(room, winnerRole) {
  const winnerId = room.playerIds ? room.playerIds[winnerRole] : null;
  const loserRole = winnerRole === "light" ? "shadow" : "light";
  const loserId = room.playerIds ? room.playerIds[loserRole] : null;
  if (!winnerId || !loserId) {
    return;
  }
  const winnerEntry = getRatingEntry(winnerId);
  const loserEntry = getRatingEntry(loserId);
  const expectedWinner = 1 / (1 + Math.pow(10, (loserEntry.rating - winnerEntry.rating) / 400));
  const expectedLoser = 1 - expectedWinner;
  winnerEntry.rating = Math.round(winnerEntry.rating + K_FACTOR * (1 - expectedWinner));
  loserEntry.rating = Math.round(loserEntry.rating + K_FACTOR * (0 - expectedLoser));
  winnerEntry.games += 1;
  loserEntry.games += 1;
  globalRatings[winnerId] = winnerEntry;
  globalRatings[loserId] = loserEntry;
}

function getRatingEntry(id) {
  if (!id) {
    return { rating: DEFAULT_RATING, games: 0 };
  }
  const existing = globalRatings[id];
  if (existing && Number.isFinite(existing.rating)) {
    return { rating: Number(existing.rating), games: Number(existing.games) || 0 };
  }
  return { rating: DEFAULT_RATING, games: 0 };
}

function getRating(id) {
  return getRatingEntry(id).rating;
}

function getLeaderboard(limit = 10) {
  return Object.entries(globalRatings)
    .filter(([, entry]) => entry && Number.isFinite(entry.rating))
    .map(([id, entry]) => ({ id, rating: Math.round(entry.rating) }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

function buildRatingsPayload(room, playerId) {
  const payload = {
    leaderboard: getLeaderboard(10),
    players: {
      light: room.playerIds && room.playerIds.light ? { id: room.playerIds.light, rating: getRating(room.playerIds.light) } : null,
      shadow: room.playerIds && room.playerIds.shadow ? { id: room.playerIds.shadow, rating: getRating(room.playerIds.shadow) } : null
    }
  };
  if (playerId) {
    payload.player = { id: playerId, rating: getRating(playerId) };
  } else {
    payload.player = null;
  }
  return payload;
}

function saveRatings() {
  saveJson(RATINGS_PATH, globalRatings);
}

function saveMatchHistory() {
  saveJson(MATCHES_PATH, matchHistory);
}

function ensureDataStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MATCHES_PATH)) {
      fs.writeFileSync(MATCHES_PATH, "[]", "utf8");
    }
    if (!fs.existsSync(RATINGS_PATH)) {
      fs.writeFileSync(RATINGS_PATH, "{}", "utf8");
    }
  } catch (err) {
    console.error("Failed to initialise data storage", err);
  }
}

function loadJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function saveJson(filePath, value) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write", filePath, err);
  }
}

function handleHttpRequest(req, res) {
  try {
    if (req.method === "OPTIONS") {
      setCorsHeaders(res);
      res.writeHead(204).end();
      return;
    }
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (url.pathname === "/ratings") {
        setCorsHeaders(res);
        const playerId = sanitisePlayerId(url.searchParams.get("playerId"));
        const payload = {
          player: playerId ? { id: playerId, rating: getRating(playerId) } : null,
          leaderboard: getLeaderboard(20)
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(payload));
        return;
      }
      if (url.pathname === "/matches") {
        setCorsHeaders(res);
        const limitParam = Number(url.searchParams.get("limit"));
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 100) : 20;
        const matches = matchHistory.slice(-limit);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ matches }));
        return;
      }
    }
    setCorsHeaders(res);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    setCorsHeaders(res);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      clients: new Map(),
      state: null,
      lastLaser: null,
      skins: { light: null, shadow: null },
      history: [],
      historyMatchId: null,
      playerIds: { light: null, shadow: null }
    };
    rooms.set(roomId, room);
  }
  return room;
}

function broadcast(roomId, payload) {
  const room = rooms.get(roomId);
  if (!room) return;
  const message = JSON.stringify(payload);
  for (const client of room.clients.values()) {
    safeSend(client, message);
  }
}

function broadcastPlayers(roomId) {
  broadcast(roomId, {
    type: "players",
    players: getPlayersSnapshot(roomId)
  });
}

function getPlayersSnapshot(roomId) {
  const room = rooms.get(roomId);
  if (!room) {
    return { light: false, shadow: false };
  }
  return {
    light: room.clients.has("light"),
    shadow: room.clients.has("shadow")
  };
}

function sanitiseSkinValue(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 48);
}

function sanitiseSkinEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const skin = sanitiseSkinValue(entry.skin);
  const type = sanitiseSkinValue(entry.type);
  if (!skin && !type) {
    return null;
  }
  return { skin: skin || null, type: type || null };
}

function mergeSkins(current = {}, incoming = {}) {
  const roles = ["light", "shadow"];
  const result = {};
  for (const role of roles) {
    const incomingEntry = sanitiseSkinEntry(incoming[role]);
    if (incomingEntry) {
      result[role] = incomingEntry;
    } else if (current && current[role]) {
      result[role] = sanitiseSkinEntry(current[role]) || null;
    } else {
      result[role] = null;
    }
  }
  return result;
}

function normaliseRoomId(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/[^a-z0-9-_]/gi, "").slice(0, 32);
}

function send(socket, payload) {
  safeSend(socket, JSON.stringify(payload));
}

function safeSend(socket, message) {
  try {
    if (socket.readyState === 1) {
      socket.send(message);
    }
  } catch (err) {
    // игнорируем ошибки отправки
  }
}
