const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;
const FILES = "ABCDEFGH";
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

const PIECE_DEFS = {
  laser: {
    name: "Лучезар",
    glyph: "☼",
    canRotate: true,
    description: "Излучает луч. Не двигается, но может поворачивать направление луча.",
    movement: () => []
  },
  volhv: {
    name: "Волхв",
    glyph: "✧",
    canRotate: false,
    description: "Главная фигура. Двигается по прямым на одну клетку. Потеря ведёт к поражению.",
    movement: (board, x, y, piece) => orthogonalMoves(board, x, y, piece)
  },
  pyramid: {
    name: "Зеркало",
    glyph: "◒",
    canRotate: true,
    description: "Один отражающий фас. Поворачивайте, чтобы направлять луч под прямым углом.",
    movement: (board, x, y, piece) => diagonalMoves(board, x, y, piece)
  },
  scarab: {
    name: "Оберег",
    glyph: "⛬",
    canRotate: true,
    description: "Двойное зеркало. Может меняться местами с соседями или отражать с двух сторон.",
    movement: (board, x, y, piece) => scarabMoves(board, x, y, piece)
  },
  anubis: {
    name: "Щитоносец",
    glyph: "⛨",
    canRotate: true,
    description: "Щит отражает луч с одной стороны. Защищайте волхва и зеркала.",
    movement: (board, x, y, piece) => orthogonalMoves(board, x, y, piece)
  },
  obelisk: {
    name: "Тотем",
    glyph: "▲",
    canRotate: false,
    description: "Прочно стоит, блокирует луч. Может шагать по прямым.",
    movement: (board, x, y, piece) => orthogonalMoves(board, x, y, piece)
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

// Стартовая расстановка «Око Перуна» повторяет классическую схему Laser Chess/Khet,
// адаптированную под квадратное поле 8×8. Ориентации отражают исходные углы зеркал.
const INITIAL_LIGHT_SETUP = [
  { x: 0, y: 7, type: "laser", orientation: 1 },
  { x: 1, y: 7, type: "pyramid", orientation: 1 },
  { x: 2, y: 7, type: "scarab", orientation: 0 },
  { x: 3, y: 7, type: "anubis", orientation: 0 },
  { x: 4, y: 7, type: "volhv", orientation: 0 },
  { x: 5, y: 7, type: "anubis", orientation: 0 },
  { x: 6, y: 7, type: "scarab", orientation: 2 },
  { x: 7, y: 7, type: "pyramid", orientation: 2 },
  { x: 0, y: 6, type: "pyramid", orientation: 0 },
  { x: 1, y: 6, type: "obelisk", orientation: 0 },
  { x: 2, y: 6, type: "pyramid", orientation: 1 },
  { x: 3, y: 6, type: "pyramid", orientation: 3 },
  { x: 4, y: 6, type: "pyramid", orientation: 1 },
  { x: 5, y: 6, type: "pyramid", orientation: 3 },
  { x: 6, y: 6, type: "obelisk", orientation: 0 },
  { x: 7, y: 6, type: "pyramid", orientation: 2 },
  { x: 2, y: 5, type: "pyramid", orientation: 0 },
  { x: 5, y: 5, type: "pyramid", orientation: 2 }
];

let board = createEmptyBoard();
let currentPlayer = "light";
let selectedCell = null;
let currentOptions = [];
let turnCounter = 1;
let currentTheme = "dark";

const elements = {
  board: document.getElementById("board"),
  status: document.getElementById("status"),
  turn: document.getElementById("turn-indicator"),
  rotateLeft: document.getElementById("rotate-left"),
  rotateRight: document.getElementById("rotate-right"),
  hint: document.getElementById("action-hint"),
  endgame: document.getElementById("endgame"),
  endgameTitle: document.getElementById("endgame-title"),
  endgameSubtitle: document.getElementById("endgame-subtitle"),
  playAgain: document.getElementById("play-again"),
  themeToggle: document.getElementById("theme-toggle"),
  laserOverlay: document.getElementById("laser-overlay"),
  pieceName: document.getElementById("piece-name"),
  pieceDetails: document.getElementById("piece-details")
};

const cells = [];

initialiseBoardGrid();
attachEventListeners();
initialiseTheme();
startNewGame();

function startNewGame() {
  board = createEmptyBoard();
  placeInitialPieces();
  currentPlayer = "light";
  selectedCell = null;
  currentOptions = [];
  turnCounter = 1;
  clearLaserPath();
  updateTurnIndicator();
  renderBoard();
  setStatus("Выберите фигуру и передвиньте её либо поверните зеркало.");
  elements.hint.textContent = "Выберите свою фигуру, чтобы увидеть доступные ходы.";
  elements.endgame.hidden = true;
  elements.endgame.setAttribute("aria-hidden", "true");
  updateRotateControls(false);
  updatePiecePanel();
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

function placeInitialPieces() {
  for (const spec of INITIAL_LIGHT_SETUP) {
    placePiece(spec, "light");
    placePiece(mirrorSpec(spec), "shadow");
  }
}

function placePiece(spec, player) {
  const piece = {
    type: spec.type,
    player,
    orientation: spec.orientation % 4
  };
  board[spec.y][spec.x] = piece;
}

function mirrorSpec(spec) {
  return {
    x: BOARD_WIDTH - 1 - spec.x,
    y: BOARD_HEIGHT - 1 - spec.y,
    type: spec.type,
    orientation: (spec.orientation + 2) % 4
  };
}

function initialiseBoardGrid() {
  elements.board.innerHTML = "";
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
}

function renderBoard() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = cells[y][x];
      const piece = board[y][x];
      cell.classList.toggle("cell--light", (x + y) % 2 === 0);
      cell.classList.toggle("cell--selected", selectedCell && selectedCell.x === x && selectedCell.y === y);
      cell.classList.remove("cell--option", "cell--capture");
      if (piece) {
        const def = PIECE_DEFS[piece.type];
        const wrapper = document.createElement("div");
        wrapper.className = `piece piece--${piece.player}`;
        const glyph = document.createElement("span");
        glyph.textContent = def.glyph;
        glyph.className = "piece__glyph";
        glyph.style.transform = `rotate(${piece.orientation * 90}deg)`;
        wrapper.appendChild(glyph);
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
    if (option.capture || option.swap) {
      cell.classList.add("cell--capture");
    }
  }
}

function handleCellInteraction(x, y) {
  if (elements.endgame.hidden === false) return;

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
    ? `Доступно ходов: ${currentOptions.map((opt) => toNotation(opt.x, opt.y)).join(", ")}`
    : def.canRotate
      ? "Можно только повернуть выбранную фигуру."
      : "Для этой фигуры доступных действий нет.";
  elements.hint.textContent = `${def.name}: ${movesText}`;
  setStatus(`${PLAYERS[currentPlayer].name}: выбрана фигура ${def.name} на ${toNotation(x, y)}.`);
  updatePiecePanel(piece, toNotation(x, y));
}

function clearSelection() {
  selectedCell = null;
  currentOptions = [];
  renderBoard();
  updateRotateControls(false);
  elements.hint.textContent = "Выберите свою фигуру, чтобы увидеть доступные ходы.";
  updatePiecePanel();
}

function updateRotateControls(enabled) {
  const piece = selectedCell ? board[selectedCell.y][selectedCell.x] : null;
  const canRotate = Boolean(enabled && piece && piece.player === currentPlayer);
  elements.rotateLeft.disabled = !canRotate;
  elements.rotateRight.disabled = !canRotate;
}

function executeMove(option, piece, from) {
  const targetPiece = board[option.y][option.x];

  if (option.swap && targetPiece) {
    board[from.y][from.x] = targetPiece;
    board[option.y][option.x] = piece;
    setStatus(`${PLAYERS[currentPlayer].name}: ${PIECE_DEFS[piece.type].name} меняется местами с ${PIECE_DEFS[targetPiece.type].name} на ${toNotation(option.x, option.y)}.`);
  } else {
    board[from.y][from.x] = null;
    board[option.y][option.x] = piece;
    if (targetPiece) {
      setStatus(`${PLAYERS[currentPlayer].name}: ${PIECE_DEFS[piece.type].name} захватывает ${PIECE_DEFS[targetPiece.type].name}.`);
    } else {
      setStatus(`${PLAYERS[currentPlayer].name}: ${PIECE_DEFS[piece.type].name} перемещён на ${toNotation(option.x, option.y)}.`);
    }
  }

  endTurn();
}

function rotateSelected(delta) {
  if (!selectedCell) return;
  const piece = board[selectedCell.y][selectedCell.x];
  const def = PIECE_DEFS[piece.type];
  if (!def.canRotate || piece.player !== currentPlayer) return;

  piece.orientation = mod4(piece.orientation + delta);
  renderBoard();
  const dirSymbol = delta > 0 ? "↻" : "↺";
  setStatus(`${PLAYERS[currentPlayer].name}: ${def.name} на ${toNotation(selectedCell.x, selectedCell.y)} повёрнут ${delta > 0 ? "по" : "против"} часовой стрелки.`);
  endTurn();
}

function endTurn() {
  clearSelection();
  const laserResult = fireLaser(currentPlayer);
  renderBoard();
  highlightLaserPath(laserResult);
  if (laserResult.hit) {
    const hitPiece = laserResult.hit.piece;
    const owner = PLAYERS[hitPiece.player].name;
    const pieceName = PIECE_DEFS[hitPiece.type].name;
    const cell = toNotation(laserResult.hit.x, laserResult.hit.y);
    setStatus(`${laserResult.firer} испепеляет ${pieceName} (${owner}) на ${cell}.`);
    if (hitPiece.type === "volhv") {
      finishGame(currentPlayer);
      return;
    }
  } else if (laserResult.blocked) {
    const blockPiece = laserResult.blocked.piece;
    const owner = PLAYERS[blockPiece.player].name;
    const cell = toNotation(laserResult.blocked.x, laserResult.blocked.y);
    setStatus(`${laserResult.firer} не проходит через ${PIECE_DEFS[blockPiece.type].name} на ${cell}.`);
  }
  currentPlayer = currentPlayer === "light" ? "shadow" : "light";
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
    case "pyramid":
      return pyramidInteraction(piece.orientation, face);
    case "scarab":
      return scarabInteraction(piece.orientation, face);
    case "anubis":
      return anubisInteraction(piece.orientation, face);
    case "laser":
      return { destroy: true, stop: true };
    case "obelisk":
    case "volhv":
      return { destroy: true, stop: true };
    default:
      return { destroy: true, stop: true };
  }
}

function pyramidInteraction(orientation, face) {
  const baseMap = {
    0: 1,
    1: 0
  };
  const rotatedMap = rotateFaceMap(baseMap, orientation);
  if (face in rotatedMap) {
    return { destroy: false, stop: false, nextDirection: rotatedMap[face] };
  }
  return { destroy: true, stop: true };
}

function scarabInteraction(orientation, face) {
  const baseMap = {
    0: 1,
    1: 0,
    2: 3,
    3: 2
  };
  const rotatedMap = rotateFaceMap(baseMap, orientation);
  if (face in rotatedMap) {
    return { destroy: false, stop: false, nextDirection: rotatedMap[face] };
  }
  return { destroy: true, stop: true };
}

function anubisInteraction(orientation, face) {
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
  clearLaserPath();
  if (!result || !result.origin) {
    return;
  }

  drawLaserBeam(result);
}

function clearLaserPath() {
  if (elements.laserOverlay) {
    elements.laserOverlay.replaceChildren();
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

function orthogonalMoves(boardState, x, y, piece) {
  const moves = [];
  for (const dir of DIRECTIONS) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (!inBounds(nx, ny)) continue;
    const target = boardState[ny][nx];
    if (!target) {
      moves.push({ x: nx, y: ny });
    } else if (target.player !== piece.player) {
      moves.push({ x: nx, y: ny, capture: true });
    }
  }
  return moves;
}

function diagonalMoves(boardState, x, y, piece) {
  const moves = [];
  for (const dir of DIAGONALS) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (!inBounds(nx, ny)) continue;
    const target = boardState[ny][nx];
    if (!target) {
      moves.push({ x: nx, y: ny });
    } else if (target.player !== piece.player) {
      moves.push({ x: nx, y: ny, capture: true });
    }
  }
  return moves;
}

function scarabMoves(boardState, x, y, piece) {
  const moves = [];
  for (const dir of DIRECTIONS) {
    const nx = x + dir.dx;
    const ny = y + dir.dy;
    if (!inBounds(nx, ny)) continue;
    const target = boardState[ny][nx];
    if (!target) {
      moves.push({ x: nx, y: ny });
    } else {
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
  elements.turn.textContent = `${turnCounter}. ${PLAYERS[currentPlayer].name}`;
}

function setStatus(message) {
  elements.status.textContent = message;
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
