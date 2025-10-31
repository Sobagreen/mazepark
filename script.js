const INITIAL_LAYOUT = [
  ["Л1", "П", "П", "П", "1Щ1", "В1", "2Щ1", "1З1", "П", "П"],
  ["П", "П", "2З1", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "7З2", "П", "П", "П", "П", "П", "П"],
  ["3З1", "П", "5З2", "П", "1Т1", "2Т1", "П", "4З1", "П", "6З2"],
  ["5З1", "П", "3З2", "П", "1Т2", "2Т2", "П", "6З1", "П", "4З2"],
  ["П", "П", "П", "П", "П", "П", "7З1", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "2З2", "П", "П"],
  ["П", "П", "1З2", "1Щ2", "В2", "2Щ2", "П", "П", "П", "Л2"]
];

const TOKEN_MAP = {
  П: null,
  "Л1": { type: "laser", player: "light", orientation: 2 },
  "Л2": { type: "laser", player: "shadow", orientation: 0 },
  "В1": { type: "volhv", player: "light", orientation: 0 },
  "В2": { type: "volhv", player: "shadow", orientation: 0 },
  "1З1": { type: "mirror", player: "light", orientation: 2 },
  "2З1": { type: "mirror", player: "light", orientation: 3 },
  "3З1": { type: "mirror", player: "light", orientation: 1 },
  "4З1": { type: "mirror", player: "light", orientation: 2 },
  "5З1": { type: "mirror", player: "light", orientation: 2 },
  "6З1": { type: "mirror", player: "light", orientation: 1 },
  "7З1": { type: "mirror", player: "light", orientation: 2 },
  "1З2": { type: "mirror", player: "shadow", orientation: 0 },
  "2З2": { type: "mirror", player: "shadow", orientation: 1 },
  "3З2": { type: "mirror", player: "shadow", orientation: 0 },
  "4З2": { type: "mirror", player: "shadow", orientation: 3 },
  "5З2": { type: "mirror", player: "shadow", orientation: 3 },
  "6З2": { type: "mirror", player: "shadow", orientation: 0 },
  "7З2": { type: "mirror", player: "shadow", orientation: 0 },
  "1Щ1": { type: "shield", player: "light", orientation: 2 },
  "1Щ2": { type: "shield", player: "shadow", orientation: 0 },
  "2Щ1": { type: "shield", player: "light", orientation: 2 },
  "2Щ2": { type: "shield", player: "shadow", orientation: 0 },
  "1Т1": { type: "totem", player: "light", orientation: 1 },
  "2Т2": { type: "totem", player: "shadow", orientation: 1 },
  "2Т1": { type: "totem", player: "light", orientation: 2 },
  "1Т2": { type: "totem", player: "shadow", orientation: 2 }
};

const BOARD_HEIGHT = INITIAL_LAYOUT.length;
const BOARD_WIDTH = INITIAL_LAYOUT[0].length;
const FILES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, BOARD_WIDTH);
const THEME_STORAGE_KEY = "laser-theme";

const PLAYERS = {
  light: {
    name: "Дружина Перуна",
    glyph: "☼",
    laserName: "Лучезар Перуна"
  },
  shadow: {
    name: "Полк Чернобога",
    glyph: "☽",
    laserName: "Луч Чернобога"
  }
};

// Поместите файлы PNG для каждой фракции в подпапки "pieces/light" и "pieces/shadow"
// рядом со script.js. Например: pieces/light/laser.png, pieces/shadow/laser.png и т.д.
const PIECE_DEFS = {
  laser: {
    name: "Лучезар",
    images: {
      light: "pieces/light/laser.png",
      shadow: "pieces/shadow/laser.png"
    },
    canRotate: true,
    description: "Излучает луч. Не двигается и неуязвим, можно лишь поворачивать направление луча.",
    movement: () => []
  },
  volhv: {
    name: "Волхв",
    images: {
      light: "pieces/light/volhv.png",
      shadow: "pieces/shadow/volhv.png"
    },
    canRotate: false,
    description: "Главная фигура. Ходит на одну клетку в любом направлении. Попадание луча заканчивает партию.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  mirror: {
    name: "Зерцало",
    images: {
      light: "pieces/light/mirror.png",
      shadow: "pieces/shadow/mirror.png"
    },
    canRotate: true,
    description: "Один зеркальный фас. Отражает луч под прямым углом, уязвимо с открытых сторон.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  shield: {
    name: "Щитоносец",
    images: {
      light: "pieces/light/shield.png",
      shadow: "pieces/shadow/shield.png"
    },
    canRotate: true,
    description: "Щит гасит луч лицевой стороной. С боков и тыла может быть уничтожен.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  totem: {
    name: "Тотем",
    images: {
      light: "pieces/light/totem.png",
      shadow: "pieces/shadow/totem.png"
    },
    canRotate: true,
    description: "Двуликое зеркало. Отражает с двух сторон и может сменяться местами с зерцалом или щитом поблизости, включая диагональ.",
    movement: (board, x, y, piece) => totemMoves(board, x, y, piece)
  }
};

const DIRECTIONS = [
  { dx: 0, dy: -1 }, // вверх
  { dx: 1, dy: 0 },  // вправо
  { dx: 0, dy: 1 },  // вниз
  { dx: -1, dy: 0 }  // влево
];

const DIAGONALS = [
  { dx: 1, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 1 }
];

const ADJACENT = [...DIRECTIONS, ...DIAGONALS];

let board = createEmptyBoard();
let currentPlayer = "light";
let selectedCell = null;
let currentOptions = [];
let turnCounter = 1;
let currentTheme = "dark";
let lastStatusMessage = "";
let lastLaserResult = null;

const elements = {
  board: document.getElementById("board"),
  status: document.getElementById("status"),
  turn: document.getElementById("turn-indicator"),
  rotateLeft: document.getElementById("rotate-left"),
  rotateRight: document.getElementById("rotate-right"),
  endgame: document.getElementById("endgame"),
  endgameTitle: document.getElementById("endgame-title"),
  endgameSubtitle: document.getElementById("endgame-subtitle"),
  playAgain: document.getElementById("play-again"),
  themeToggle: document.getElementById("theme-toggle"),
  openConnection: document.getElementById("open-connection"),
  laserOverlay: document.getElementById("laser-overlay"),
  pieceName: document.getElementById("piece-name"),
  pieceDetails: document.getElementById("piece-details"),
  connectionOverlay: document.getElementById("connection-overlay"),
  connectionForm: document.getElementById("connection-form"),
  connectionStatus: document.getElementById("connection-status"),
  connectionPlayers: document.getElementById("connection-players"),
  connectButton: document.getElementById("connect-button"),
  offlineButton: document.getElementById("offline-button"),
  serverInput: document.getElementById("server-url"),
  serverPortInput: document.getElementById("server-port"),
  roomInput: document.getElementById("room-id")
};

const cells = [];
const multiplayer = createMultiplayerController();

initialiseBoardGrid();
attachEventListeners();
initialiseTheme();
multiplayer.init();
startNewGame();

function startNewGame() {
  board = createEmptyBoard();
  placeInitialPieces();
  currentPlayer = "light";
  turnCounter = 1;
  clearLaserPath();
  updateTurnIndicator();
  clearSelection({ silent: true });
  setStatus("Дружина Перуна начинает дуэль: выберите фигуру или поверните зеркало.");
  elements.endgame.hidden = true;
  elements.endgame.setAttribute("aria-hidden", "true");
  broadcastGameState("new-game");
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

function placeInitialPieces() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const token = INITIAL_LAYOUT[y][x];
      const spec = TOKEN_MAP[token];
      if (spec) {
        board[y][x] = {
          type: spec.type,
          player: spec.player,
          orientation: spec.orientation % 4
        };
      }
    }
  }
}

function initialiseBoardGrid() {
  elements.board.innerHTML = "";
  elements.board.style.setProperty("--board-columns", BOARD_WIDTH);
  elements.board.style.setProperty("--board-rows", BOARD_HEIGHT);
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    cells[y] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `${FILES[x]}${BOARD_HEIGHT - y}`);
      elements.board.appendChild(cell);
      cell.addEventListener("click", () => handleCellInteraction(x, y));
      cells[y][x] = cell;
    }
  }
}

function attachEventListeners() {
  document.getElementById("new-game").addEventListener("click", startNewGame);
  elements.rotateLeft.addEventListener("click", () => rotateSelected(-1));
  elements.rotateRight.addEventListener("click", () => rotateSelected(1));
  elements.playAgain.addEventListener("click", startNewGame);
  if (elements.themeToggle) {
    elements.themeToggle.addEventListener("click", toggleTheme);
  }
  if (elements.connectionForm) {
    elements.connectionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      multiplayer.handleConnectSubmission();
    });
  }
  if (elements.offlineButton) {
    elements.offlineButton.addEventListener("click", () => {
      multiplayer.handleOfflineSelection();
    });
  }
  if (elements.openConnection) {
    elements.openConnection.addEventListener("click", () => {
      multiplayer.openOverlay();
    });
  }
}

function renderBoard() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = cells[y][x];
      const piece = board[y][x];
      cell.classList.toggle("cell--light", (x + y) % 2 === 0);
      cell.classList.toggle("cell--selected", selectedCell && selectedCell.x === x && selectedCell.y === y);
      cell.classList.remove("cell--option", "cell--swap");
      if (piece) {
        const def = PIECE_DEFS[piece.type];
        const wrapper = document.createElement("div");
        wrapper.className = `piece piece--${piece.player}`;
        const image = document.createElement("img");
        image.src = def.images[piece.player];
        image.alt = "";
        image.className = "piece__image";
        image.style.transform = `rotate(${piece.orientation * 90}deg)`;
        wrapper.appendChild(image);
        wrapper.setAttribute("aria-label", `${def.name} (${PLAYERS[piece.player].name})`);
        cell.replaceChildren(wrapper);
      } else {
        cell.replaceChildren();
      }
    }
  }
  for (const option of currentOptions) {
    const cell = cells[option.y][option.x];
    cell.classList.add("cell--option");
    if (option.swap) {
      cell.classList.add("cell--swap");
    }
  }
}

function handleCellInteraction(x, y) {
  if (elements.endgame.hidden === false) return;
  if (!multiplayer.canAct()) {
    if (multiplayer.isWaitingForOpponent()) {
      setStatus("Ожидаем подключения второго игрока.");
    } else if (multiplayer.isActive()) {
      setStatus(`${PLAYERS[currentPlayer].name}: сейчас ход соперника.`);
    }
    return;
  }

  const piece = board[y][x];
  const current = selectedCell ? board[selectedCell.y][selectedCell.x] : null;
  const option = currentOptions.find((opt) => opt.x === x && opt.y === y);

  if (option && current) {
    executeMove(option, current, selectedCell);
    return;
  }

  if (piece && piece.player === currentPlayer) {
    selectCell(x, y);
  } else if (piece && piece.player !== currentPlayer) {
    setStatus(`${PLAYERS[currentPlayer].name}: нельзя управлять фигурой соперника.`);
  } else {
    clearSelection();
  }
}

function selectCell(x, y) {
  selectedCell = { x, y };
  const piece = board[y][x];
  const def = PIECE_DEFS[piece.type];
  currentOptions = def.movement(board, x, y, piece);
  renderBoard();
  updateRotateControls(def.canRotate);
  const movesText = currentOptions.length
    ? `Доступно ходов: ${currentOptions
        .map((opt) => `${toNotation(opt.x, opt.y)}${opt.swap ? "⇄" : ""}`)
        .join(", ")}.`
    : def.canRotate
      ? "Можно только повернуть выбранную фигуру."
      : "Для этой фигуры доступных действий нет.";
  setStatus(`${PLAYERS[currentPlayer].name}: ${def.name} на ${toNotation(x, y)}. ${movesText}`);
  updatePiecePanel(piece, toNotation(x, y));
}

function clearSelection({ silent = false } = {}) {
  selectedCell = null;
  currentOptions = [];
  renderBoard();
  updateRotateControls(false);
  updatePiecePanel();
  if (!silent) {
    setStatus(`${PLAYERS[currentPlayer].name}: выберите фигуру.`);
  }
}

function updateRotateControls(enabled) {
  const piece = selectedCell ? board[selectedCell.y][selectedCell.x] : null;
  const canRotate = Boolean(
    enabled &&
    piece &&
    piece.player === currentPlayer &&
    multiplayer.canAct()
  );
  elements.rotateLeft.disabled = !canRotate;
  elements.rotateRight.disabled = !canRotate;
}

function executeMove(option, piece, from) {
  const targetPiece = board[option.y][option.x];

  if (option.swap) {
    if (!targetPiece) {
      return;
    }
    board[from.y][from.x] = targetPiece;
    board[option.y][option.x] = piece;
    setStatus(`${PLAYERS[currentPlayer].name}: ${PIECE_DEFS[piece.type].name} меняется местами с ${PIECE_DEFS[targetPiece.type].name} на ${toNotation(option.x, option.y)}.`);
    endTurn();
    broadcastGameState("swap");
    return;
  }

  if (targetPiece) {
    setStatus(`${PLAYERS[currentPlayer].name}: клетка ${toNotation(option.x, option.y)} уже занята.`);
    renderBoard();
    return;
  }

  board[from.y][from.x] = null;
  board[option.y][option.x] = piece;
  setStatus(`${PLAYERS[currentPlayer].name}: ${PIECE_DEFS[piece.type].name} перемещён на ${toNotation(option.x, option.y)}.`);

  endTurn();
  broadcastGameState(option.swap ? "swap" : "move");
}

function rotateSelected(delta) {
  if (!selectedCell) return;
  const piece = board[selectedCell.y][selectedCell.x];
  const def = PIECE_DEFS[piece.type];
  if (!def.canRotate || piece.player !== currentPlayer) return;
  if (!multiplayer.canAct()) {
    if (multiplayer.isActive()) {
      setStatus(`${PLAYERS[currentPlayer].name}: сейчас ход соперника.`);
    }
    return;
  }

  piece.orientation = mod4(piece.orientation + delta);
  renderBoard();
  const dirSymbol = delta > 0 ? "↻" : "↺";
  setStatus(`${PLAYERS[currentPlayer].name}: ${def.name} на ${toNotation(selectedCell.x, selectedCell.y)} повёрнут ${delta > 0 ? "по" : "против"} часовой стрелки.`);
  endTurn();
  broadcastGameState(delta > 0 ? "rotate-cw" : "rotate-ccw");
}

function endTurn() {
  clearSelection({ silent: true });
  const activePlayer = currentPlayer;
  const laserResult = normaliseLaserResult(fireLaser(activePlayer));
  lastLaserResult = laserResult;
  renderBoard();
  highlightLaserPath(laserResult);
  if (laserResult.hit) {
    const hitPiece = laserResult.hit.piece;
    const owner = PLAYERS[hitPiece.player].name;
    const pieceName = PIECE_DEFS[hitPiece.type].name;
    const cell = toNotation(laserResult.hit.x, laserResult.hit.y);
    setStatus(`${laserResult.firer} испепеляет ${pieceName} (${owner}) на ${cell}.`);
    if (hitPiece.type === "volhv") {
      finishGame(activePlayer);
      return;
    }
  } else if (laserResult.blocked) {
    const blockPiece = laserResult.blocked.piece;
    const owner = PLAYERS[blockPiece.player].name;
    const cell = toNotation(laserResult.blocked.x, laserResult.blocked.y);
    setStatus(`${laserResult.firer} не проходит через ${PIECE_DEFS[blockPiece.type].name} на ${cell}.`);
  }
  currentPlayer = activePlayer === "light" ? "shadow" : "light";
  turnCounter += 1;
  updateTurnIndicator();
  if (!laserResult.hit) {
    setStatus(`${PLAYERS[currentPlayer].name} готовит ход.`);
  }
}

function finishGame(winner) {
  const loser = winner === "light" ? "shadow" : "light";
  elements.endgame.hidden = false;
  elements.endgame.setAttribute("aria-hidden", "false");
  elements.endgameTitle.textContent = `${PLAYERS[winner].name} побеждает!`;
  elements.endgameSubtitle.textContent = `Волхв ${PLAYERS[loser].name} уничтожен лучом.`;
  setStatus(`${PLAYERS[winner].name} добились победы.`);
  updateRotateControls(false);
}

function fireLaser(player) {
  const emitterPos = findEmitter(player);
  if (!emitterPos) {
    return { path: [], firer: PLAYERS[player].laserName, origin: null };
  }

  let { x, y } = emitterPos;
  let direction = board[y][x].orientation % 4;
  const path = [];
  let previous = { x, y };

  while (true) {
    const nextX = x + DIRECTIONS[direction].dx;
    const nextY = y + DIRECTIONS[direction].dy;
    if (!inBounds(nextX, nextY)) {
      return {
        path,
        hit: null,
        firer: PLAYERS[player].laserName,
        origin: emitterPos,
        termination: computeExitPoint(previous, direction)
      };
    }

    x = nextX;
    y = nextY;
    path.push({ x, y });
    const target = board[y][x];
    if (!target) {
      previous = { x, y };
      continue;
    }
    const interaction = resolveLaserInteraction(target, direction);
    if (interaction.destroy) {
      board[y][x] = null;
    }
    if (interaction.stop) {
      const result = {
        path,
        hit: interaction.destroy ? { piece: target, x, y } : null,
        firer: PLAYERS[player].laserName,
        origin: emitterPos,
        termination: { x: x + 0.5, y: y + 0.5 }
      };
      if (!interaction.destroy) {
        result.blocked = { piece: target, x, y };
      }
      return result;
    }
    previous = { x, y };
    direction = interaction.nextDirection;
  }
}

function resolveLaserInteraction(piece, incomingDirection) {
  const face = mod4(incomingDirection + 2);
  switch (piece.type) {
    case "mirror":
      return mirrorInteraction(piece.orientation, face);
    case "totem":
      return totemInteraction(piece.orientation, face);
    case "shield":
      return shieldInteraction(piece.orientation, face);
    case "laser":
      return { destroy: false, stop: true };
    case "volhv":
      return { destroy: true, stop: true };
    default:
      return { destroy: true, stop: true };
  }
}

function mirrorInteraction(orientation, face) {
  const baseMap = {
    0: 3,
    3: 0
  };
  const rotatedMap = rotateFaceMap(baseMap, orientation);
  if (face in rotatedMap) {
    return { destroy: false, stop: false, nextDirection: rotatedMap[face] };
  }
  return { destroy: true, stop: true };
}

function totemInteraction(orientation, face) {
  const baseMap = {
    0: 3,
    3: 0,
    1: 2,
    2: 1
  };
  const rotatedMap = rotateFaceMap(baseMap, orientation);
  if (face in rotatedMap) {
    return { destroy: false, stop: false, nextDirection: rotatedMap[face] };
  }
  return { destroy: true, stop: true };
}

function shieldInteraction(orientation, face) {
  const shieldFace = orientation % 4;
  if (face === shieldFace) {
    return { destroy: false, stop: true };
  }
  return { destroy: true, stop: true };
}

function rotateFaceMap(map, orientation) {
  const rotated = {};
  for (const [face, outDir] of Object.entries(map)) {
    const newFace = mod4(Number(face) + orientation);
    const newOut = mod4(outDir + orientation);
    rotated[newFace] = newOut;
  }
  return rotated;
}

function findEmitter(player) {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const piece = board[y][x];
      if (piece && piece.player === player && piece.type === "laser") {
        return { x, y };
      }
    }
  }
  return null;
}

function highlightLaserPath(result) {
  clearLaserPath({ preserveState: true });
  if (!result || !result.origin) {
    return;
  }

  drawLaserBeam(result);
}

function clearLaserPath({ preserveState = false } = {}) {
  if (elements.laserOverlay) {
    elements.laserOverlay.replaceChildren();
  }
  if (!preserveState) {
    lastLaserResult = null;
  }
}

function drawLaserBeam(result) {
  if (!elements.laserOverlay) return;

  const points = [];
  points.push(toCellCenter(result.origin.x, result.origin.y));
  for (const step of result.path) {
    points.push(toCellCenter(step.x, step.y));
  }
  if (result.termination) {
    const lastPoint = points[points.length - 1];
    if (!lastPoint || Math.abs(lastPoint.x - result.termination.x) > 0.001 || Math.abs(lastPoint.y - result.termination.y) > 0.001) {
      points.push(result.termination);
    }
  }

  if (points.length < 2) {
    return;
  }

  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segment = document.createElement("div");
    segment.className = "laser-overlay__beam";
    segment.style.left = `${(start.x / BOARD_WIDTH) * 100}%`;
    segment.style.top = `${(start.y / BOARD_HEIGHT) * 100}%`;
    segment.style.width = `${(Math.hypot(dx, dy) / BOARD_WIDTH) * 100}%`;
    segment.style.transform = `translate(0, -50%) rotate(${Math.atan2(dy, dx)}rad)`;
    elements.laserOverlay.appendChild(segment);
  }

  if (result.hit || result.blocked) {
    const impact = result.hit || result.blocked;
    const marker = document.createElement("div");
    marker.className = "laser-overlay__impact";
    const center = toCellCenter(impact.x, impact.y);
    marker.style.left = `${(center.x / BOARD_WIDTH) * 100}%`;
    marker.style.top = `${(center.y / BOARD_HEIGHT) * 100}%`;
    elements.laserOverlay.appendChild(marker);
  }
}

function toCellCenter(x, y) {
  return { x: x + 0.5, y: y + 0.5 };
}

function computeExitPoint(previous, direction) {
  switch (direction % 4) {
    case 0:
      return { x: previous.x + 0.5, y: 0 };
    case 1:
      return { x: BOARD_WIDTH, y: previous.y + 0.5 };
    case 2:
      return { x: previous.x + 0.5, y: BOARD_HEIGHT };
    case 3:
    default:
      return { x: 0, y: previous.y + 0.5 };
  }
}

function adjacentMoves(boardState, x, y, piece) {
  const moves = [];
  for (const dir of ADJACENT) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (!inBounds(nx, ny)) continue;
    const target = boardState[ny][nx];
    if (!target) {
      moves.push({ x: nx, y: ny });
    }
  }
  return moves;
}

function totemMoves(boardState, x, y, piece) {
  const moves = adjacentMoves(boardState, x, y, piece);
  for (const dir of ADJACENT) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (!inBounds(nx, ny)) continue;
    const target = boardState[ny][nx];
    if (
      target &&
      target.player === piece.player &&
      (target.type === "mirror" || target.type === "shield")
    ) {
      moves.push({ x: nx, y: ny, swap: true });
    }
  }
  return moves;
}

function inBounds(x, y) {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

function mod4(value) {
  return (value % 4 + 4) % 4;
}

function toNotation(x, y) {
  return `${FILES[x]}${BOARD_HEIGHT - y}`;
}

function updateTurnIndicator() {
  if (!elements.turn) return;
  elements.turn.textContent = `${turnCounter}. ${PLAYERS[currentPlayer].name}`;
}

function setStatus(message) {
  lastStatusMessage = message;
  if (elements.status) {
    elements.status.textContent = message;
  }
}

function initialiseTheme() {
  let theme = null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      theme = stored;
    }
  } catch (err) {
    theme = null;
  }
  if (!theme && window.matchMedia) {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  setTheme(theme || "dark");
}

function toggleTheme() {
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme);
}

function setTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  document.body.classList.toggle("theme-light", currentTheme === "light");
  document.body.classList.toggle("theme-dark", currentTheme === "dark");
  document.documentElement.style.colorScheme = currentTheme === "light" ? "light" : "dark";
  if (elements.themeToggle) {
    const icon = currentTheme === "light" ? "☀️" : "🌙";
    elements.themeToggle.innerHTML = `<span aria-hidden="true">${icon}</span>`;
    elements.themeToggle.setAttribute("aria-pressed", currentTheme === "light" ? "true" : "false");
    elements.themeToggle.setAttribute("aria-label", `Переключить тему. Текущая тема: ${currentTheme === "light" ? "светлая" : "тёмная"}.`);
    elements.themeToggle.setAttribute("title", currentTheme === "light" ? "Включить тёмную тему" : "Включить светлую тему");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  } catch (err) {
    // игнорируем, если локальное хранилище недоступно
  }
}

function updatePiecePanel(piece = null, position = null) {
  if (!elements.pieceName || !elements.pieceDetails) return;
  if (!piece) {
    elements.pieceName.textContent = "—";
    elements.pieceDetails.textContent = "Коснитесь своей фигуры, чтобы узнать её свойства.";
    return;
  }
  const def = PIECE_DEFS[piece.type];
  const owner = PLAYERS[piece.player].name;
  const facing = orientationToText(piece.orientation);
  elements.pieceName.textContent = `${def.name} • ${owner}`;
  const positionText = position ? `Позиция ${position}. ` : "";
  elements.pieceDetails.textContent = `${positionText}${def.description} Повернут ${facing}.`;
}

function orientationToText(orientation) {
  switch (mod4(orientation)) {
    case 0:
      return "к северу";
    case 1:
      return "к востоку";
    case 2:
      return "к югу";
    case 3:
    default:
      return "к западу";
  }
}

function normaliseLaserResult(result) {
  if (!result) {
    return null;
  }
  const copy = {
    firer: result.firer,
    origin: result.origin ? { x: result.origin.x, y: result.origin.y } : null,
    path: Array.isArray(result.path)
      ? result.path.map(({ x, y }) => ({ x, y }))
      : [],
    termination: result.termination
      ? { x: result.termination.x, y: result.termination.y }
      : null
  };
  if (result.hit) {
    copy.hit = {
      x: result.hit.x,
      y: result.hit.y,
      piece: result.hit.piece ? clonePiece(result.hit.piece) : null
    };
  }
  if (result.blocked) {
    copy.blocked = {
      x: result.blocked.x,
      y: result.blocked.y,
      piece: result.blocked.piece ? clonePiece(result.blocked.piece) : null
    };
  }
  return copy;
}

function clonePiece(piece) {
  if (!piece) {
    return null;
  }
  return {
    type: piece.type,
    player: piece.player,
    orientation: mod4(piece.orientation || 0)
  };
}

function cloneBoardState(boardState) {
  const next = createEmptyBoard();
  if (!Array.isArray(boardState)) {
    return next;
  }
  for (let y = 0; y < Math.min(boardState.length, BOARD_HEIGHT); y += 1) {
    const row = boardState[y];
    if (!Array.isArray(row)) continue;
    for (let x = 0; x < Math.min(row.length, BOARD_WIDTH); x += 1) {
      const piece = row[x];
      next[y][x] = piece ? clonePiece(piece) : null;
    }
  }
  return next;
}

function serialiseGameState() {
  return {
    board: cloneBoardState(board),
    currentPlayer,
    turnCounter,
    status: lastStatusMessage,
    endgame: {
      visible: elements.endgame ? elements.endgame.hidden === false : false,
      title: elements.endgameTitle ? elements.endgameTitle.textContent : "",
      subtitle: elements.endgameSubtitle ? elements.endgameSubtitle.textContent : ""
    },
    laser: lastLaserResult ? normaliseLaserResult(lastLaserResult) : null
  };
}

function applyRemoteState(state) {
  if (!state) return;
  multiplayer.suppress(() => {
    board = cloneBoardState(state.board);
    currentPlayer = state.currentPlayer === "shadow" ? "shadow" : "light";
    if (typeof state.turnCounter === "number" && Number.isFinite(state.turnCounter)) {
      turnCounter = state.turnCounter;
    }
    clearSelection({ silent: true });
    updateTurnIndicator();
    if (state.endgame && state.endgame.visible) {
      elements.endgame.hidden = false;
      elements.endgame.setAttribute("aria-hidden", "false");
      if (elements.endgameTitle) {
        elements.endgameTitle.textContent = state.endgame.title || "";
      }
      if (elements.endgameSubtitle) {
        elements.endgameSubtitle.textContent = state.endgame.subtitle || "";
      }
    } else {
      elements.endgame.hidden = true;
      elements.endgame.setAttribute("aria-hidden", "true");
    }
    if (typeof state.status === "string") {
      setStatus(state.status);
    } else if (multiplayer.canAct()) {
      setStatus(`${PLAYERS[currentPlayer].name}: выберите фигуру.`);
    }
    lastLaserResult = state.laser ? normaliseLaserResult(state.laser) : null;
    if (lastLaserResult) {
      highlightLaserPath(lastLaserResult);
    } else {
      clearLaserPath();
    }
  });
}

function broadcastGameState(reason) {
  if (!multiplayer.canBroadcast()) {
    return;
  }
  multiplayer.sendState(reason, serialiseGameState());
}

function createMultiplayerController() {
  const state = {
    ws: null,
    connected: false,
    role: null,
    roomId: null,
    serverUrl: null,
    players: { light: false, shadow: false },
    suppressDepth: 0
  };

  function init() {
    if (!elements.connectionOverlay) {
      return;
    }
    showOverlay();
    updatePlayersUI();
    const defaults = deriveDefaultServerAddress();
    if (elements.serverInput && !elements.serverInput.value) {
      elements.serverInput.value = defaults.url;
    }
    if (elements.serverPortInput && !elements.serverPortInput.value && defaults.port) {
      elements.serverPortInput.value = defaults.port;
    }
    setOverlayStatus("Подключитесь к комнате или продолжите офлайн.");
    window.addEventListener("beforeunload", () => {
      cleanupSocket(true);
    });
  }

  function handleConnectSubmission() {
    if (!elements.connectionForm) return;
    const formData = new FormData(elements.connectionForm);
    const server = (formData.get("server") || "").toString().trim();
    const portRaw = (formData.get("port") || "").toString().trim();
    const room = (formData.get("room") || "").toString().trim().toLowerCase();
    const role = (formData.get("role") || "").toString();
    if (!server) {
      setOverlayStatus("Укажите адрес сервера.");
      return;
    }
    let port = "";
    if (portRaw) {
      if (!/^\d{1,5}$/.test(portRaw)) {
        setOverlayStatus("Порт должен быть числом от 1 до 65535.");
        return;
      }
      const numericPort = Number(portRaw);
      if (numericPort < 1 || numericPort > 65535) {
        setOverlayStatus("Порт должен быть числом от 1 до 65535.");
        return;
      }
      port = String(numericPort);
    }
    if (!room || room.length < 2) {
      setOverlayStatus("Название комнаты должно содержать минимум 2 символа.");
      return;
    }
    if (role !== "light" && role !== "shadow") {
      setOverlayStatus("Выберите сторону для игры.");
      return;
    }
    state.role = role;
    updatePlayersUI();
    connectToServer(server, port, room, role);
  }

  function handleOfflineSelection() {
    cleanupSocket(true);
    resetConnectionState();
    hideOverlay();
    setOverlayStatus("");
  }

  function connectToServer(serverUrl, portOverride, roomId, role) {
    const fallbackScheme = window.location.protocol === "https:" ? "wss" : "ws";
    const rawUrl = /^[a-z]+:\/\//i.test(serverUrl) ? serverUrl : `${fallbackScheme}://${serverUrl}`;
    let parsedUrl;
    try {
      parsedUrl = new URL(rawUrl);
    } catch (err) {
      setOverlayStatus("Некорректный адрес сервера.");
      return;
    }
    if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
      setOverlayStatus("Используйте протокол ws:// или wss://.");
      return;
    }
    if (portOverride) {
      parsedUrl.port = portOverride;
    }

    cleanupSocket(true);
    setFormDisabled(true);
    setOverlayStatus("Подключение...");

    state.serverUrl = parsedUrl.toString();
    state.roomId = roomId;

    const ws = new WebSocket(state.serverUrl);
    state.ws = ws;

    if (elements.serverInput) {
      const displayUrl = state.serverUrl.replace(/\/$/, "");
      elements.serverInput.value = displayUrl;
    }
    if (elements.serverPortInput) {
      elements.serverPortInput.value = parsedUrl.port;
    }

    ws.onopen = () => {
      setOverlayStatus("Соединение установлено. Ожидаем подтверждения...");
      send({ type: "join", roomId, role });
    };
    ws.onmessage = (event) => {
      handleMessage(event);
    };
    ws.onerror = () => {
      setOverlayStatus("Не удалось установить соединение.");
    };
    ws.onclose = (event) => {
      const reason = event.wasClean ? "Соединение закрыто." : "Соединение потеряно.";
      handleSocketClosure(reason);
    };
  }

  function handleMessage(event) {
    let payload;
    try {
      payload = JSON.parse(event.data);
    } catch (err) {
      return;
    }

    switch (payload.type) {
      case "joined":
        state.connected = true;
        setFormDisabled(false);
        hideOverlay();
        updatePlayers(payload.players);
        if (payload.state) {
          applyRemoteState(payload.state);
        } else {
          broadcastGameState("sync");
        }
        if (typeof payload.message === "string" && payload.message) {
          setStatus(payload.message);
        }
        break;
      case "players":
        updatePlayers(payload.players);
        break;
      case "state":
        if (payload.state) {
          applyRemoteState(payload.state);
        }
        if (payload.players) {
          updatePlayers(payload.players);
        }
        break;
      case "error":
        setOverlayStatus(payload.message || "Сервер отклонил подключение.");
        handleSocketClosure("Соединение закрыто.");
        break;
      default:
        break;
    }
  }

  function handleSocketClosure(message) {
    const wasConnected = state.connected;
    cleanupSocket(true);
    resetConnectionState();
    showOverlay();
    setFormDisabled(false);
    if (message) {
      setOverlayStatus(message);
    }
    if (wasConnected) {
      setStatus("Соединение с сервером потеряно. Игра продолжается локально.");
    }
  }

  function updatePlayers(players) {
    state.players = {
      light: Boolean(players && players.light),
      shadow: Boolean(players && players.shadow)
    };
    if (state.connected && state.role) {
      state.players[state.role] = true;
    }
    updatePlayersUI();
  }

  function updatePlayersUI() {
    if (!elements.connectionPlayers) return;
    const items = elements.connectionPlayers.querySelectorAll("[data-role]");
    items.forEach((item) => {
      const role = item.dataset.role;
      const occupied = Boolean(state.players[role]);
      item.classList.toggle("connection-players__item--occupied", occupied);
      item.classList.toggle("connection-players__item--self", state.role === role && state.connected);
      const statusEl = item.querySelector(".connection-players__status");
      if (statusEl) {
        if (occupied) {
          statusEl.textContent = state.role === role && state.connected ? "вы" : "занято";
        } else {
          statusEl.textContent = "свободно";
        }
      }
    });
  }

  function setOverlayStatus(message) {
    if (elements.connectionStatus) {
      elements.connectionStatus.textContent = message;
    }
  }

  function showOverlay() {
    if (!elements.connectionOverlay) return;
    elements.connectionOverlay.hidden = false;
    elements.connectionOverlay.setAttribute("aria-hidden", "false");
  }

  function hideOverlay() {
    if (!elements.connectionOverlay) return;
    elements.connectionOverlay.hidden = true;
    elements.connectionOverlay.setAttribute("aria-hidden", "true");
  }

  function setFormDisabled(disabled) {
    if (!elements.connectionForm) return;
    const controls = elements.connectionForm.querySelectorAll("input, button");
    controls.forEach((control) => {
      if (control.id === "offline-button") return;
      control.disabled = disabled;
    });
  }

  function openOverlay() {
    showOverlay();
    updatePlayersUI();
    if (elements.serverInput) {
      if (state.serverUrl) {
        elements.serverInput.value = state.serverUrl.replace(/\/$/, "");
      } else {
        const defaults = deriveDefaultServerAddress();
        if (!elements.serverInput.value) {
          elements.serverInput.value = defaults.url;
        }
      }
    }
    if (elements.serverPortInput) {
      if (state.serverUrl) {
        try {
          const currentUrl = new URL(state.serverUrl);
          elements.serverPortInput.value = currentUrl.port;
        } catch (err) {
          // если разбор не удался, оставляем текущее значение
        }
      } else {
        const defaults = deriveDefaultServerAddress();
        if (!elements.serverPortInput.value && defaults.port) {
          elements.serverPortInput.value = defaults.port;
        }
      }
    }
    const roleName = state.role && PLAYERS[state.role] ? PLAYERS[state.role].name : null;
    const message = state.connected
      ? `Соединение активно${roleName ? `: вы играете за «${roleName}».` : "."}`
      : "Подключитесь к комнате или продолжите офлайн.";
    setOverlayStatus(message);
    setFormDisabled(false);
  }

  function cleanupSocket(silent = false) {
    if (!state.ws) return;
    const ws = state.ws;
    state.ws = null;
    if (silent) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    }
    try {
      ws.close();
    } catch (err) {
      // игнорируем ошибки закрытия
    }
  }

  function resetConnectionState() {
    state.connected = false;
    state.roomId = null;
    state.players = { light: false, shadow: false };
    updatePlayersUI();
  }

  function send(payload) {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    state.ws.send(JSON.stringify(payload));
  }

  function deriveDefaultServerAddress() {
    const { protocol, hostname, port } = window.location;
    if (protocol === "http:" || protocol === "https:") {
      const scheme = protocol === "https:" ? "wss" : "ws";
      const host = hostname || "localhost";
      const derivedPort = port || (scheme === "ws" ? "8787" : "");
      return {
        url: `${scheme}://${host}`,
        port: derivedPort
      };
    }
    return { url: "ws://localhost", port: "8787" };
  }

  return {
    init,
    handleConnectSubmission,
    handleOfflineSelection,
    openOverlay,
    sendState(reason, statePayload) {
      send({ type: "state", roomId: state.roomId, role: state.role, reason, state: statePayload });
    },
    canBroadcast() {
      return Boolean(state.connected && state.ws && state.ws.readyState === WebSocket.OPEN && state.suppressDepth === 0);
    },
    suppress(callback) {
      state.suppressDepth += 1;
      try {
        callback();
      } finally {
        state.suppressDepth = Math.max(0, state.suppressDepth - 1);
      }
    },
    canAct() {
      return !state.connected || state.role === currentPlayer;
    },
    isActive() {
      return state.connected;
    },
    isWaitingForOpponent() {
      return state.connected && !(state.players.light && state.players.shadow);
    }
  };
}
