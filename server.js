const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 8787);

const rooms = new Map();

const server = http.createServer();
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
    }
  });

  socket.on("close", () => {
    if (!membership) return;
    const room = rooms.get(membership.roomId);
    if (!room) return;
    const current = room.clients.get(membership.role);
    if (current === socket) {
      room.clients.delete(membership.role);
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
    membership = { roomId, role };

    send(ws, {
      type: "joined",
      roomId,
      role,
      players: getPlayersSnapshot(roomId),
      state: room.state,
      laser: room.lastLaser,
      message: `Подключено к комнате ${roomId}.`
    });

    broadcastPlayers(roomId);
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

function getRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = { clients: new Map(), state: null, lastLaser: null };
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
