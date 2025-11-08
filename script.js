function duplicateLayout(layout) {
  return layout.map((row) => row.slice());
}

const BASE_LAYOUT = [
  ["Л1ВН", "П", "П", "П", "1Щ1ВН", "В1ВВ", "2Щ1ВН", "1З1ВН", "П", "П"],
  ["П", "П", "2З1Л", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "7З2ВВ", "П", "П", "П", "П", "П", "П"],
  ["3З1П", "П", "5З2Л", "П", "1Т1П", "2Т1ВН", "П", "4З1ВН", "П", "6З2ВВ"],
  ["5З1ВН", "П", "3З2ВВ", "П", "1Т2ВН", "2Т2П", "П", "6З1П", "П", "4З2Л"],
  ["П", "П", "П", "П", "П", "П", "7З1ВН", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "2З2П", "П", "П"],
  ["П", "П", "1З2ВВ", "1Щ2ВВ", "В2ВВ", "2Щ2ВВ", "П", "П", "П", "Л2ВВ"]
];

const MODERN_LAYOUT = [
  ["1З1ВВ", "1З1П", "1З1ВН", "1З1Л", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "П", "П", "П", "П", "П"],
  ["1З2ВВ", "1З2П", "1З2ВН", "1З2Л", "П", "П", "П", "П", "П", "П"]
];

const LEGACY_LAYOUT = [
  ["Л1ВН", "П", "П", "П", "1З1Л", "1Щ1ВН", "2З1ВН", "П", "П", "П"],
  ["П", "П", "П", "П", "П", "В1ВН", "П", "П", "П", "П"],
  ["3З1П", "П", "П", "П", "4З1Л", "2Щ1ВН", "1Т1ВН", "П", "П", "П"],
  ["5З1ВН", "П", "2Т1П", "П", "1З2ВВ", "П", "2З2ВН", "П", "П", "П"],
  ["П", "П", "П", "6З1ВВ", "П", "7З1ВН", "П", "1Т2Л", "П", "3З2ВВ"],
  ["П", "П", "П", "2Т2ВН", "1Щ2ВВ", "4З2П", "П", "П", "П", "5З2Л"],
  ["П", "П", "П", "П", "В2ВВ", "П", "П", "П", "П", "П"],
  ["П", "П", "П", "6З2ВВ", "2Щ2ВВ", "7З2П", "П", "П", "П", "Л2ВВ"]
];

const STARTING_LAYOUT_ORDER = ["basic", "modern", "legacy"];

const STARTING_LAYOUTS = {
  basic: { label: "Базовая", tokens: BASE_LAYOUT },
  modern: { label: "Модерн", tokens: MODERN_LAYOUT },
  legacy: { label: "Легаси", tokens: LEGACY_LAYOUT }
};

const DEFAULT_LAYOUT_KEY = "basic";

const TOKEN_MAP = {
  П: null,

  // === Лазеры ===
  "Л1ВВ": { type: "laser", player: "light", orientation: 0 },
  "Л1П":  { type: "laser", player: "light", orientation: 1 },
  "Л1ВН": { type: "laser", player: "light", orientation: 2 },
  "Л1Л":  { type: "laser", player: "light", orientation: 3 },

  "Л2ВВ": { type: "laser", player: "shadow", orientation: 0 },
  "Л2П":  { type: "laser", player: "shadow", orientation: 1 },
  "Л2ВН": { type: "laser", player: "shadow", orientation: 2 },
  "Л2Л":  { type: "laser", player: "shadow", orientation: 3 },

  // === Волхвы ===
  "В1ВВ": { type: "volhv", player: "light", orientation: 0 },
  "В1П":  { type: "volhv", player: "light", orientation: 1 },
  "В1ВН": { type: "volhv", player: "light", orientation: 2 },
  "В1Л":  { type: "volhv", player: "light", orientation: 3 },

  "В2ВВ": { type: "volhv", player: "shadow", orientation: 0 },
  "В2П":  { type: "volhv", player: "shadow", orientation: 1 },
  "В2ВН": { type: "volhv", player: "shadow", orientation: 2 },
  "В2Л":  { type: "volhv", player: "shadow", orientation: 3 },

  // === Зеркала Light (З1) ===
  "1З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "1З1П":  { type: "mirror", player: "light", orientation: 1 },
  "1З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "1З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "2З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "2З1П":  { type: "mirror", player: "light", orientation: 1 },
  "2З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "2З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "3З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "3З1П":  { type: "mirror", player: "light", orientation: 1 },
  "3З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "3З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "4З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "4З1П":  { type: "mirror", player: "light", orientation: 1 },
  "4З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "4З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "5З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "5З1П":  { type: "mirror", player: "light", orientation: 1 },
  "5З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "5З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "6З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "6З1П":  { type: "mirror", player: "light", orientation: 1 },
  "6З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "6З1Л":  { type: "mirror", player: "light", orientation: 3 },

  "7З1ВВ": { type: "mirror", player: "light", orientation: 0 },
  "7З1П":  { type: "mirror", player: "light", orientation: 1 },
  "7З1ВН": { type: "mirror", player: "light", orientation: 2 },
  "7З1Л":  { type: "mirror", player: "light", orientation: 3 },

  // === Зеркала Shadow (З2) ===
  "1З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "1З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "1З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "1З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "2З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "2З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "2З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "2З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "3З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "3З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "3З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "3З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "4З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "4З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "4З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "4З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "5З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "5З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "5З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "5З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "6З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "6З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "6З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "6З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  "7З2ВВ": { type: "mirror", player: "shadow", orientation: 0 },
  "7З2П":  { type: "mirror", player: "shadow", orientation: 1 },
  "7З2ВН": { type: "mirror", player: "shadow", orientation: 2 },
  "7З2Л":  { type: "mirror", player: "shadow", orientation: 3 },

  // === Щиты ===
  "1Щ1ВВ": { type: "shield", player: "light", orientation: 0 },
  "1Щ1П":  { type: "shield", player: "light", orientation: 1 },
  "1Щ1ВН": { type: "shield", player: "light", orientation: 2 },
  "1Щ1Л":  { type: "shield", player: "light", orientation: 3 },

  "1Щ2ВВ": { type: "shield", player: "shadow", orientation: 0 },
  "1Щ2П":  { type: "shield", player: "shadow", orientation: 1 },
  "1Щ2ВН": { type: "shield", player: "shadow", orientation: 2 },
  "1Щ2Л":  { type: "shield", player: "shadow", orientation: 3 },

  "2Щ1ВВ": { type: "shield", player: "light", orientation: 0 },
  "2Щ1П":  { type: "shield", player: "light", orientation: 1 },
  "2Щ1ВН": { type: "shield", player: "light", orientation: 2 },
  "2Щ1Л":  { type: "shield", player: "light", orientation: 3 },

  "2Щ2ВВ": { type: "shield", player: "shadow", orientation: 0 },
  "2Щ2П":  { type: "shield", player: "shadow", orientation: 1 },
  "2Щ2ВН": { type: "shield", player: "shadow", orientation: 2 },
  "2Щ2Л":  { type: "shield", player: "shadow", orientation: 3 },

  // === Тотемы ===
  "1Т1ВВ": { type: "totem", player: "light", orientation: 0 },
  "1Т1П":  { type: "totem", player: "light", orientation: 1 },
  "1Т1ВН": { type: "totem", player: "light", orientation: 2 },
  "1Т1Л":  { type: "totem", player: "light", orientation: 3 },

  "1Т2ВВ": { type: "totem", player: "shadow", orientation: 0 },
  "1Т2П":  { type: "totem", player: "shadow", orientation: 1 },
  "1Т2ВН": { type: "totem", player: "shadow", orientation: 2 },
  "1Т2Л":  { type: "totem", player: "shadow", orientation: 3 },

  "2Т1ВВ": { type: "totem", player: "light", orientation: 0 },
  "2Т1П":  { type: "totem", player: "light", orientation: 1 },
  "2Т1ВН": { type: "totem", player: "light", orientation: 2 },
  "2Т1Л":  { type: "totem", player: "light", orientation: 3 },

  "2Т2ВВ": { type: "totem", player: "shadow", orientation: 0 },
  "2Т2П":  { type: "totem", player: "shadow", orientation: 1 },
  "2Т2ВН": { type: "totem", player: "shadow", orientation: 2 },
  "2Т2Л":  { type: "totem", player: "shadow", orientation: 3 }
};

const BOARD_HEIGHT = STARTING_LAYOUTS[DEFAULT_LAYOUT_KEY].tokens.length;
const BOARD_WIDTH = STARTING_LAYOUTS[DEFAULT_LAYOUT_KEY].tokens[0].length;
const FILES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, BOARD_WIDTH);
const THEME_STORAGE_KEY = "laser-theme";
const DEFAULT_SERVER_URL = "wss://mazepark-1.onrender.com";

const PLAYERS = {
  light: {
    name: "Первый игрок",
    glyph: "☼",
    laserName: "Луч первого Игрока"
  },
  shadow: {
    name: "Второй Игрок",
    glyph: "☽",
    laserName: "Луч второго игрока"
  }
};

const PIECE_DEFS = {
  laser: {
    name: "Луч",
    canRotate: true,
    description: "После действия активного игрока излучает свет. Не двигается и неуязвим, можно лишь поворачивать направление луча.",
    movement: () => []
  },
  volhv: {
    name: "Герой",
    canRotate: false,
    description: "Главная фигура. Ходит на одну клетку в любом направлении. Попадание луча в Героя заканчивает партию.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  mirror: {
    name: "Зеркало",
    canRotate: true,
    description: "Вещь с отражательным эффектом. Одна зеркальная сторона. Отражает луч под прямым углом,уязвимо с открытых сторон.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  shield: {
    name: "Щит",
    canRotate: true,
    description: "Вещь с защитным эффектом, может гасить луч,но только лицевой стороной. С боков и тыла может быть уничтожена.",
    movement: (board, x, y, piece) => adjacentMoves(board, x, y, piece)
  },
  totem: {
    name: "Тотем",
    canRotate: true,
    description: "Двустороннее зеркало. Отражает луч на 90 градусов с двух сторон. МОЖЕТ МЕНЯТЬСЯ МЕСТАМИ С ЗЕРКАЛОМ ИЛИ ЩИТОМ ПОБЛИЗОСТИ.",
    movement: (board, x, y, piece) => totemMoves(board, x, y, piece)
  }
};

const SKINS = {
  Slavic: {
    label: "Славянский орден",
    preview: "pieces/skins/Slavic/Type1/volhv.png",
    types: {
      Type1: { label: "Перун", preview: "pieces/skins/Slavic/Type1/volhv.png" },
      Type2: { label: "Чернобог", preview: "pieces/skins/Slavic/Type2/volhv.png" }
    }
  },
  Japan: {
    label: "Япония",
    preview: "pieces/skins/Japan/Type1/preview.png",
    types: {
      Type1: { label: "Гейша", preview: "pieces/skins/Japan/Type1/volhv.png" },
      Type2: { label: "Сëгун", preview: "pieces/skins/Japan/Type2/volhv.png" }
    }
  },
  Greece: {
    label: "Греция",
    preview: "pieces/skins/Greece/Type1/preview.png",
    types: {
      Type1: { label: "Легионер", preview: "pieces/skins/Greece/Type1/volhv.png" },
      Type2: { label: "Амазонка", preview: "pieces/skins/Greece/Type2/volhv.png" }
    }
  },  
  Lavcraft: {
    label: "Говард Лавкрафт",
    preview: "pieces/skins/Lavcraft/Type1/preview.png",
    types: {
      Type1: { label: "Ктулху", preview: "pieces/skins/Lavcraft/Type1/volhv.png" },
      Type2: { label: "Жрец Ордена", preview: "pieces/skins/Lavcraft/Type2/volhv.png" }
    }
  },
  Egypt: {
    label: "Египет",
    preview: "pieces/skins/Egypt/Type1/preview.png",
    types: {
      Type1: { label: "Наложница", preview: "pieces/skins/Egypt/Type1/volhv.png" },
      Type2: { label: "Фараон", preview: "pieces/skins/Egypt/Type2/volhv.png" }
    }
  },
};

const DEFAULT_SKIN_SELECTION = {
  light: { skin: "Slavic", type: "Type1" },
  shadow: { skin: "Slavic", type: "Type2" }
};

const AVAILABLE_SKINS = SKINS;
const DEFAULT_PLAYER_SKINS = DEFAULT_SKIN_SELECTION;
let playerSkins = cloneSkinSelection(DEFAULT_SKIN_SELECTION);

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

let currentLayoutKey = DEFAULT_LAYOUT_KEY;
let board = createEmptyBoard();
let currentPlayer = "light";
let selectedCell = null;
let currentOptions = [];
let turnCounter = 1;
let currentTheme = "dark";
let lastStatusMessage = "";
let lastLaserResult = null;
let lastMove = null;
let skinSelection = cloneSkinSelection(DEFAULT_SKIN_SELECTION);
let pendingSkins = cloneSkinSelection(DEFAULT_SKIN_SELECTION);
let onlineSelectedRole = null;

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
  startOverlay: document.getElementById("start-overlay"),
  startOnline: document.getElementById("start-online"),
  startOffline: document.getElementById("start-offline"),
  startTraining: document.getElementById("start-training"),
  trainingOverlay: document.getElementById("training-overlay"),
  trainingBack: document.getElementById("training-back"),
  offlineOverlay: document.getElementById("offline-overlay"),
  offlineForm: document.getElementById("offline-form"),
  offlineBack: document.getElementById("offline-back"),
  offlineStart: document.getElementById("offline-start"),
  connectionOverlay: document.getElementById("connection-overlay"),
  connectionForm: document.getElementById("connection-form"),
  connectionStatus: document.getElementById("connection-status"),
  connectionPlayers: document.getElementById("connection-players"),
  connectButton: document.getElementById("connect-button"),
  serverInput: document.getElementById("server-url"),
  roomInput: document.getElementById("room-id"),
  onlineTypeSelect: document.getElementById("online-type"),
  onlineSkinSelect: document.getElementById("online-skin"),
  onlineLayoutSelect: document.getElementById("online-layout"),
  onlinePreviewImage: document.getElementById("online-preview-image"),
  onlinePreviewLabel: document.getElementById("online-preview-label"),
  onlineTypeWarning: document.getElementById("online-type-warning"),
  onlineBack: document.getElementById("online-back"),
  startScreen: document.getElementById("start-screen"),
  startOnline: document.getElementById("start-online"),
  startOffline: document.getElementById("start-offline"),
  startTraining: document.getElementById("start-training"),
  trainingOverlay: document.getElementById("training-overlay"),
  trainingBack: document.getElementById("training-back"),
  offlineOverlay: document.getElementById("offline-setup"),
  offlineStart: document.getElementById("offline-start"),
  offlineCancel: document.getElementById("offline-cancel"),
  offlineConflict: document.getElementById("offline-conflict"),
  offlineLayoutSelect: document.getElementById("offline-layout"),
  offlineFields: {
    light: {
      skin: document.getElementById("offline-light-skin"),
      type: document.getElementById("offline-light-type"),
      preview: document.getElementById("offline-light-preview"),
      label: document.getElementById("offline-light-preview-label")
    },
    shadow: {
      skin: document.getElementById("offline-shadow-skin"),
      type: document.getElementById("offline-shadow-type"),
      preview: document.getElementById("offline-shadow-preview"),
      label: document.getElementById("offline-shadow-preview-label")
    }
  },
  legendImages: Array.from(document.querySelectorAll("[data-piece-image]"))
};

const cells = [];
const multiplayer = createMultiplayerController();

initialiseBoardGrid();
setupSkinSelectionUI();
initialiseLayoutControls();
attachEventListeners();
initialiseTheme();
multiplayer.init();
startNewGame();
showStartScreen();

function startNewGame() {
  applySelectedLayoutFromControls();
  lastMove = null;
  board = createEmptyBoard();
  placeInitialPieces();
  currentPlayer = "light";
  turnCounter = 1;
  clearLaserPath();
  updateTurnIndicator();
  clearSelection({ silent: true });
  setStatus("Первый игрок начинает ход. Переместите фигуру или поверните лазер.");
  elements.endgame.hidden = true;
  elements.endgame.setAttribute("aria-hidden", "true");
  updateLayoutSelectors();
  broadcastGameState("new-game");
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

function normaliseLayoutKey(key) {
  return STARTING_LAYOUTS[key] ? key : DEFAULT_LAYOUT_KEY;
}

function getLayoutTokens(layoutKey) {
  const key = normaliseLayoutKey(layoutKey);
  return STARTING_LAYOUTS[key].tokens;
}

function placeInitialPieces() {
  const layout = getLayoutTokens(currentLayoutKey);
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const row = layout[y] || [];
      const token = row[x];
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

function initialiseSkinControls() {
  if (elements.onlineSkin) {
    populateSkinSelect(elements.onlineSkin);
  }
  if (elements.onlineType) {
    populateTypeSelect(elements.onlineType, getPlayerSkin("light").skin);
  }

  if (elements.offlineLightSkin) {
    populateSkinSelect(elements.offlineLightSkin);
  }
  if (elements.offlineShadowSkin) {
    populateSkinSelect(elements.offlineShadowSkin);
  }
  if (elements.offlineLightType) {
    populateTypeSelect(elements.offlineLightType, getPlayerSkin("light").skin);
  }
  if (elements.offlineShadowType) {
    populateTypeSelect(elements.offlineShadowType, getPlayerSkin("shadow").skin);
  }

  updateSkinControls();
  refreshPieceArt({ silent: true });
}

function populateSkinSelect(select) {
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = "";
  Object.entries(AVAILABLE_SKINS).forEach(([key, meta]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = meta.label;
    select.appendChild(option);
  });
  if (currentValue && AVAILABLE_SKINS[currentValue]) {
    select.value = currentValue;
  }
}

function populateTypeSelect(select, skinKey) {
  if (!select) return;
  const skin = AVAILABLE_SKINS[skinKey] || AVAILABLE_SKINS.Slavic;
  const currentValue = select.value;
  select.innerHTML = "";
  Object.entries(skin.types).forEach(([typeKey, meta]) => {
    const option = document.createElement("option");
    option.value = typeKey;
    option.textContent = meta.label;
    select.appendChild(option);
  });
  if (currentValue && skin.types[currentValue]) {
    select.value = currentValue;
  }
}

function updateSkinControls() {
  updateOfflineSkinControls();
  updateOnlineSkinControls();
  updateSkinPreviews();
}

function updateOfflineSkinControls() {
  const players = ["light", "shadow"];
  for (const player of players) {
    const skinSelect = player === "light" ? elements.offlineLightSkin : elements.offlineShadowSkin;
    const typeSelect = player === "light" ? elements.offlineLightType : elements.offlineShadowType;
    const selection = getPlayerSkin(player);
    const other = player === "light" ? "shadow" : "light";
    const otherSelection = getPlayerSkin(other);

    if (skinSelect) {
      populateSkinSelect(skinSelect);
      skinSelect.value = selection.skin;
    }
    if (typeSelect) {
      populateTypeSelect(typeSelect, selection.skin);
      Array.from(typeSelect.options).forEach((option) => {
        option.disabled = otherSelection.skin === selection.skin && otherSelection.type === option.value;
      });
      typeSelect.value = selection.type;
    }
  }
}

function updateOnlineSkinControls() {
  if (!elements.onlineSkin || !elements.onlineType) return;
  populateSkinSelect(elements.onlineSkin);

  const checkedRole = getCheckedRole();
  if (checkedRole) {
    selectedOnlineRole = checkedRole;
  }

  const role = selectedOnlineRole;
  elements.onlineSkin.disabled = !role;
  elements.onlineType.disabled = !role;

  if (!role) {
    elements.onlineType.innerHTML = "";
    updateSkinPreviews();
    return;
  }

  const selection = getPlayerSkin(role);
  const other = role === "light" ? "shadow" : "light";
  const otherSelection = getPlayerSkin(other);

  elements.onlineSkin.value = selection.skin;
  populateTypeSelect(elements.onlineType, selection.skin);
  Array.from(elements.onlineType.options).forEach((option) => {
    option.disabled = otherSelection.skin === selection.skin && otherSelection.type === option.value;
  });
  elements.onlineType.value = selection.type;
}

function updateSkinPreviews() {
  document.querySelectorAll("[data-preview-player]").forEach((container) => {
    const player = container.getAttribute("data-preview-player");
    updatePreviewContainer(container, getPlayerSkin(player));
  });

  const onlineContainer = document.querySelector("[data-preview-context='online']");
  if (onlineContainer) {
    const role = selectedOnlineRole || "light";
    updatePreviewContainer(onlineContainer, getPlayerSkin(role));
  }

  document.querySelectorAll("img[data-legend-player]").forEach((img) => {
    const player = img.getAttribute("data-legend-player");
    const piece = img.getAttribute("data-piece");
    img.src = getPieceAssetPath(piece, player);
  });
}

function updatePreviewContainer(container, selection) {
  if (!container) return;
  container.querySelectorAll("img[data-piece]").forEach((img) => {
    const piece = img.getAttribute("data-piece");
    img.src = getSkinAssetPath(selection, piece);
  });
}

function getPlayerSkin(player) {
  const base = playerSkins[player] || DEFAULT_PLAYER_SKINS[player] || DEFAULT_PLAYER_SKINS.light;
  const normalised = normaliseSkinChoice(player, base.skin, base.type);
  playerSkins[player] = normalised;
  return normalised;
}

function normaliseSkinChoice(player, skinKey, typeKey) {
  const fallback = DEFAULT_PLAYER_SKINS[player] || DEFAULT_PLAYER_SKINS.light;
  const skinId = AVAILABLE_SKINS[skinKey] ? skinKey : fallback.skin;
  const skinMeta = AVAILABLE_SKINS[skinId];
  let typeId = skinMeta.types[typeKey] ? typeKey : fallback.type;
  if (!skinMeta.types[typeId]) {
    const firstType = Object.keys(skinMeta.types)[0];
    typeId = firstType || "Type1";
  }
  return { skin: skinId, type: typeId };
}

function findAlternativeType(skinKey, excludeType) {
  const skinMeta = AVAILABLE_SKINS[skinKey];
  if (!skinMeta) return null;
  return Object.keys(skinMeta.types).find((type) => type !== excludeType) || null;
}

function assignPlayerSkin(player, skinKey, typeKey, options = {}) {
  const requested = normaliseSkinChoice(player, skinKey, typeKey);
  const other = player === "light" ? "shadow" : "light";
  const otherSelection = getPlayerSkin(other);
  const conflict = otherSelection.skin === requested.skin && otherSelection.type === requested.type;

  if (conflict && !options.ignoreConflict) {
    if (options.autoResolveConflict) {
      const alternative = findAlternativeType(requested.skin, requested.type);
      if (alternative) {
        requested.type = alternative;
      } else {
        return { success: false, reason: "conflict", selection: getPlayerSkin(player) };
      }
    } else {
      return { success: false, reason: "conflict", selection: getPlayerSkin(player) };
    }
  }

  playerSkins[player] = requested;
  refreshPieceArt({ silent: options.silent });
  updateSkinControls();
  if (!options.silent && !options.suppressBroadcast) {
    broadcastGameState("skin-update");
  }
  return { success: true, selection: requested };
}

function refreshPieceArt({ silent = false } = {}) {
  renderBoard();
  updateSkinPreviews();
  if (!silent) {
    updatePiecePanel();
  }
}

function getSkinAssetPath(selection, pieceType) {
  return `pieces/skins/${selection.skin}/${selection.type}/${pieceType}.png`;
}

function getPieceAssetPath(pieceType, player) {
  const selection = getPlayerSkin(player);
  return getSkinAssetPath(selection, pieceType);
}

function getCheckedRole() {
  if (!elements.connectionForm) return null;
  const checked = elements.connectionForm.querySelector('input[name="role"]:checked');
  if (!checked) return null;
  const value = checked.value;
  return value === "light" || value === "shadow" ? value : null;
}

function clonePlayerSkinsState() {
  return {
    light: { ...getPlayerSkin("light") },
    shadow: { ...getPlayerSkin("shadow") }
  };
}

function applyRemoteSkins(remoteSkins) {
  if (!remoteSkins) return;
  const current = {
    light: getPlayerSkin("light"),
    shadow: getPlayerSkin("shadow")
  };
  const next = {
    light: current.light,
    shadow: current.shadow
  };
  if (remoteSkins.light) {
    next.light = normaliseSkinChoice("light", remoteSkins.light.skin, remoteSkins.light.type);
  }
  if (remoteSkins.shadow) {
    next.shadow = normaliseSkinChoice("shadow", remoteSkins.shadow.skin, remoteSkins.shadow.type);
  }
  playerSkins = next;
  refreshPieceArt({ silent: true });
  updateSkinControls();
}

function hideStartOverlay() {
  if (elements.startOverlay) {
    elements.startOverlay.hidden = true;
    elements.startOverlay.setAttribute("aria-hidden", "true");
  }
}

function showStartOverlay() {
  closeOfflineMenu();
  closeTrainingMenu();
  hideConnectionOverlay();
  if (elements.startOverlay) {
    elements.startOverlay.hidden = false;
    elements.startOverlay.setAttribute("aria-hidden", "false");
  }
}

function hideConnectionOverlay() {
  if (multiplayer && typeof multiplayer.closeOverlay === "function") {
    multiplayer.closeOverlay();
  }
  if (elements.connectionOverlay) {
    elements.connectionOverlay.hidden = true;
    elements.connectionOverlay.setAttribute("aria-hidden", "true");
  }
  selectedOnlineRole = null;
  updateOnlineSkinControls();
}

function openOnlineMenu() {
  closeOfflineMenu();
  closeTrainingMenu();
  hideStartOverlay();
  multiplayer.openOverlay();
  updateLayoutSelectors();
  updateOnlineSkinControls();
  updateSkinPreviews();
}

function openOfflineMenu() {
  closeTrainingMenu();
  hideConnectionOverlay();
  hideStartOverlay();
  if (elements.offlineOverlay) {
    elements.offlineOverlay.hidden = false;
    elements.offlineOverlay.setAttribute("aria-hidden", "false");
  }
  updateLayoutSelectors();
  updateSkinControls();
}

function closeOfflineMenu() {
  if (elements.offlineOverlay) {
    elements.offlineOverlay.hidden = true;
    elements.offlineOverlay.setAttribute("aria-hidden", "true");
  }
}

function openTrainingMenu() {
  closeOfflineMenu();
  hideConnectionOverlay();
  if (elements.trainingOverlay) {
    elements.trainingOverlay.hidden = false;
    elements.trainingOverlay.setAttribute("aria-hidden", "false");
  }
}

function closeTrainingMenu() {
  if (elements.trainingOverlay) {
    elements.trainingOverlay.hidden = true;
    elements.trainingOverlay.setAttribute("aria-hidden", "true");
  }
}

function handleOfflineFormSubmit() {
  applySelectedLayoutFromControls();
  const lightSelection = {
    skin: elements.offlineLightSkin ? elements.offlineLightSkin.value : getPlayerSkin("light").skin,
    type: elements.offlineLightType ? elements.offlineLightType.value : getPlayerSkin("light").type
  };
  const shadowSelection = {
    skin: elements.offlineShadowSkin ? elements.offlineShadowSkin.value : getPlayerSkin("shadow").skin,
    type: elements.offlineShadowType ? elements.offlineShadowType.value : getPlayerSkin("shadow").type
  };

  assignPlayerSkin("light", lightSelection.skin, lightSelection.type, {
    autoResolveConflict: true,
    suppressBroadcast: true,
    silent: true
  });
  assignPlayerSkin("shadow", shadowSelection.skin, shadowSelection.type, {
    autoResolveConflict: true,
    suppressBroadcast: true,
    silent: true
  });
  updateSkinControls();
  multiplayer.handleOfflineSelection();
  closeOfflineMenu();
  hideConnectionOverlay();
  hideStartOverlay();
  startNewGame();
}

function setOverlayStatus(message) {
  if (elements.connectionStatus) {
    elements.connectionStatus.textContent = message || "";
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
  if (elements.startOnline) {
    elements.startOnline.addEventListener("click", () => {
      hideStartOverlay();
      openOnlineMenu();
    });
  }
  if (elements.startOffline) {
    elements.startOffline.addEventListener("click", () => {
      hideStartOverlay();
      openOfflineMenu();
    });
  }
  if (elements.startTraining) {
    elements.startTraining.addEventListener("click", () => {
      hideStartOverlay();
      openTrainingMenu();
    });
  }
  if (elements.trainingBack) {
    elements.trainingBack.addEventListener("click", () => {
      closeTrainingMenu();
      showStartOverlay();
    });
  }
  if (elements.offlineBack) {
    elements.offlineBack.addEventListener("click", () => {
      closeOfflineMenu();
      showStartOverlay();
    });
  }
  if (elements.offlineForm) {
    elements.offlineForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleOfflineFormSubmit();
    });
  }
  if (elements.offlineLightSkin) {
    elements.offlineLightSkin.addEventListener("change", (event) => {
      assignPlayerSkin("light", event.target.value, getPlayerSkin("light").type, { autoResolveConflict: true, silent: true });
    });
  }
  if (elements.offlineLightType) {
    elements.offlineLightType.addEventListener("change", (event) => {
      const result = assignPlayerSkin("light", getPlayerSkin("light").skin, event.target.value, { autoResolveConflict: true, silent: true });
      if (!result.success) {
        elements.offlineLightType.value = getPlayerSkin("light").type;
      }
    });
  }
  if (elements.offlineShadowSkin) {
    elements.offlineShadowSkin.addEventListener("change", (event) => {
      assignPlayerSkin("shadow", event.target.value, getPlayerSkin("shadow").type, { autoResolveConflict: true, silent: true });
    });
  }
  if (elements.offlineShadowType) {
    elements.offlineShadowType.addEventListener("change", (event) => {
      const result = assignPlayerSkin("shadow", getPlayerSkin("shadow").skin, event.target.value, { autoResolveConflict: true, silent: true });
      if (!result.success) {
        elements.offlineShadowType.value = getPlayerSkin("shadow").type;
      }
    });
  }
  if (elements.connectionForm) {
    elements.connectionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      multiplayer.handleConnectSubmission();
    });
    const roleInputs = elements.connectionForm.querySelectorAll('input[name="role"]');
    roleInputs.forEach((input) => {
      input.addEventListener("change", () => {
        selectedOnlineRole = input.value === "shadow" ? "shadow" : "light";
        updateOnlineSkinControls();
        updateSkinPreviews();
      });
    });
  }
  if (elements.openConnection) {
    elements.openConnection.addEventListener("click", () => {
      openOnlineMenu();
    });
  }
  if (elements.connectionBack) {
    elements.connectionBack.addEventListener("click", () => {
      multiplayer.handleOfflineSelection();
      hideConnectionOverlay();
      showStartOverlay();
    });
  }
  if (elements.onlineBack) {
    elements.onlineBack.addEventListener("click", () => {
      multiplayer.closeOverlay();
      showStartScreen();
    });
  }
  if (elements.startOnline) {
    elements.startOnline.addEventListener("click", () => {
      hideStartScreen();
      multiplayer.openOverlay();
    });
  }
  if (elements.startOffline) {
    elements.startOffline.addEventListener("click", () => {
      hideStartScreen();
      openOfflineSetup();
    });
  }
  if (elements.startTraining) {
    elements.startTraining.addEventListener("click", () => {
      hideStartScreen();
      openTraining();
    });
  }
  if (elements.trainingBack) {
    elements.trainingBack.addEventListener("click", () => {
      closeTraining();
      showStartScreen();
    });
  }
  if (elements.offlineCancel) {
    elements.offlineCancel.addEventListener("click", () => {
      closeOfflineSetup();
      showStartScreen();
    });
  }
  if (elements.offlineStart) {
    elements.offlineStart.addEventListener("click", () => {
      if (applyOfflineSelection()) {
        closeOfflineSetup();
        startNewGame();
      }
    });
  }
}

function setupSkinSelectionUI() {
  if (elements.onlineSkinSelect) {
    populateSkinSelect(elements.onlineSkinSelect);
    elements.onlineSkinSelect.addEventListener("change", () => handleOnlineSkinChange());
    elements.onlineSkinSelect.disabled = true;
  }
  if (elements.onlineTypeSelect) {
    populateTypeSelect(elements.onlineTypeSelect, null, { player: null, mode: "actual" });
    elements.onlineTypeSelect.addEventListener("change", () => handleOnlineTypeChange());
    elements.onlineTypeSelect.disabled = true;
  }
  if (elements.connectionForm) {
    const roleInputs = elements.connectionForm.querySelectorAll("input[name=\"role\"]");
    roleInputs.forEach((input) => {
      input.addEventListener("change", () => handleOnlineRoleChange(input.value));
      if (input.checked) {
        onlineSelectedRole = input.value;
      }
    });
  }

  for (const player of Object.keys(elements.offlineFields)) {
    const fieldset = elements.offlineFields[player];
    if (!fieldset) continue;
    if (fieldset.skin) {
      populateSkinSelect(fieldset.skin);
      fieldset.skin.addEventListener("change", () => handleOfflineSkinChange(player));
    }
    if (fieldset.type) {
      populateTypeSelect(fieldset.type, pendingSkins[player].skin, { player, mode: "pending" });
      fieldset.type.addEventListener("change", () => handleOfflineTypeChange(player));
    }
  }

  syncOfflineSelectorsWithPending();
  handleOnlineRoleChange(onlineSelectedRole);
  updateLegendImages();
  updateOfflineConflict();
  updateOnlineWarning();
}

function initialiseLayoutControls() {
  const selects = [elements.offlineLayoutSelect, elements.onlineLayoutSelect].filter(Boolean);
  selects.forEach((select) => populateLayoutOptions(select));
  updateLayoutSelectors();
  if (elements.offlineLayoutSelect) {
    elements.offlineLayoutSelect.addEventListener("change", (event) => {
      setCurrentLayout(event.target.value);
    });
  }
  if (elements.onlineLayoutSelect) {
    elements.onlineLayoutSelect.addEventListener("change", (event) => {
      setCurrentLayout(event.target.value);
    });
  }
}

function populateLayoutOptions(select) {
  if (!select) return;
  const previous = select.value;
  select.innerHTML = "";
  STARTING_LAYOUT_ORDER.forEach((key) => {
    const layout = STARTING_LAYOUTS[key];
    if (!layout) return;
    const option = document.createElement("option");
    option.value = key;
    option.textContent = layout.label;
    select.appendChild(option);
  });
  const desired = STARTING_LAYOUTS[previous] ? previous : currentLayoutKey;
  select.value = normaliseLayoutKey(desired);
}

function updateLayoutSelectors() {
  const key = normaliseLayoutKey(currentLayoutKey);
  if (elements.offlineLayoutSelect) {
    elements.offlineLayoutSelect.value = key;
  }
  if (elements.onlineLayoutSelect) {
    elements.onlineLayoutSelect.value = key;
  }
}

function setCurrentLayout(layoutKey, { silent = false } = {}) {
  const key = normaliseLayoutKey(layoutKey);
  if (currentLayoutKey === key) {
    updateLayoutSelectors();
    return currentLayoutKey;
  }
  currentLayoutKey = key;
  updateLayoutSelectors();
  if (!silent && multiplayer.canBroadcast()) {
    broadcastGameState("layout-change");
  }
  return currentLayoutKey;
}

function applySelectedLayoutFromControls() {
  const candidates = [elements.offlineLayoutSelect, elements.onlineLayoutSelect];
  for (const select of candidates) {
    if (select && select.value) {
      setCurrentLayout(select.value, { silent: true });
    }
  }
}

function populateSkinSelect(select) {
  if (!select) return;
  select.innerHTML = "";
  Object.entries(SKINS).forEach(([key, skin]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = skin.label;
    select.appendChild(option);
  });
}

function populateTypeSelect(select, skinKey, { player = null, mode = "actual" } = {}) {
  if (!select) return;
  select.innerHTML = "";
  const skin = SKINS[skinKey];
  if (!skin) {
    select.disabled = true;
    return;
  }
  const opponent = player ? getOpponent(player) : null;
  const reference = mode === "pending" ? pendingSkins : skinSelection;
  Object.entries(skin.types).forEach(([typeKey, typeDef]) => {
    const option = document.createElement("option");
    option.value = typeKey;
    option.textContent = typeDef.label;
    const taken = Boolean(
      player &&
      reference[opponent] &&
      reference[opponent].skin === skinKey &&
      reference[opponent].type === typeKey
    );
    if (taken) {
      option.disabled = true;
      option.textContent = `${typeDef.label} — занято`;
    }
    select.appendChild(option);
  });
  select.disabled = false;
}

function syncOfflineSelectorsWithPending() {
  for (const player of Object.keys(elements.offlineFields)) {
    const fieldset = elements.offlineFields[player];
    if (!fieldset) continue;
    const pending = pendingSkins[player];
    if (fieldset.skin && pending) {
      fieldset.skin.value = pending.skin;
    }
    if (fieldset.type) {
      populateTypeSelect(fieldset.type, pending.skin, { player, mode: "pending" });
      const available = getFirstAvailableOption(fieldset.type, pending.type);
      if (available) {
        fieldset.type.value = available;
        setPendingSkin(player, pending.skin, available);
      }
      updateOfflinePreview(player);
    }
  }
}

function handleOfflineSkinChange(player) {
  const fieldset = elements.offlineFields[player];
  if (!fieldset || !fieldset.skin) return;
  const skin = fieldset.skin.value;
  const pending = pendingSkins[player];
  const desiredType = pending ? pending.type : null;
  populateTypeSelect(fieldset.type, skin, { player, mode: "pending" });
  const type = getFirstAvailableOption(fieldset.type, desiredType);
  if (fieldset.type && type) {
    fieldset.type.value = type;
  }
  setPendingSkin(player, skin, type);
  updateOfflinePreview(player);
  updateOfflineConflict();
}

function handleOfflineTypeChange(player) {
  const fieldset = elements.offlineFields[player];
  if (!fieldset || !fieldset.type) return;
  const selected = fieldset.type.value;
  if (!selected || fieldset.type.selectedOptions[0]?.disabled) {
    const fallback = getFirstAvailableOption(fieldset.type);
    if (fallback) {
      fieldset.type.value = fallback;
    }
  }
  const skin = fieldset.skin ? fieldset.skin.value : pendingSkins[player].skin;
  const type = fieldset.type ? fieldset.type.value : pendingSkins[player].type;
  setPendingSkin(player, skin, type);
  updateOfflinePreview(player);
  updateOfflineConflict();
}

function handleOnlineRoleChange(role) {
  onlineSelectedRole = role || null;
  if (!onlineSelectedRole) {
    if (elements.onlineSkinSelect) {
      elements.onlineSkinSelect.disabled = true;
    }
    if (elements.onlineTypeSelect) {
      elements.onlineTypeSelect.disabled = true;
    }
    updateOnlinePreview();
    updateOnlineWarning();
    return;
  }

  const pending = pendingSkins[onlineSelectedRole] || DEFAULT_SKIN_SELECTION[onlineSelectedRole];
  if (elements.onlineSkinSelect) {
    elements.onlineSkinSelect.disabled = false;
    elements.onlineSkinSelect.value = pending.skin;
  }
  if (elements.onlineTypeSelect) {
    populateTypeSelect(elements.onlineTypeSelect, pending.skin, { player: onlineSelectedRole, mode: "actual" });
    const type = getFirstAvailableOption(elements.onlineTypeSelect, pending.type);
    if (type) {
      elements.onlineTypeSelect.value = type;
      setPendingSkin(onlineSelectedRole, pending.skin, type);
    }
    elements.onlineTypeSelect.disabled = false;
  }

  updateOnlinePreview();
  updateOnlineWarning();
}

function handleOnlineSkinChange() {
  if (!onlineSelectedRole || !elements.onlineSkinSelect) {
    return;
  }
  const skin = elements.onlineSkinSelect.value;
  const current = pendingSkins[onlineSelectedRole] || DEFAULT_SKIN_SELECTION[onlineSelectedRole];
  const desiredType = current.type;
  if (elements.onlineTypeSelect) {
    populateTypeSelect(elements.onlineTypeSelect, skin, { player: onlineSelectedRole, mode: "actual" });
    const type = getFirstAvailableOption(elements.onlineTypeSelect, desiredType);
    if (type) {
      elements.onlineTypeSelect.value = type;
      setPendingSkin(onlineSelectedRole, skin, type);
    }
  } else {
    setPendingSkin(onlineSelectedRole, skin, desiredType);
  }
  updateOnlinePreview();
  if (multiplayer.isActive() && typeof multiplayer.getRole === "function" && multiplayer.getRole() === onlineSelectedRole) {
    applyPendingSkin(onlineSelectedRole);
  }
  updateOnlineWarning();
}

function handleOnlineTypeChange() {
  if (!onlineSelectedRole || !elements.onlineTypeSelect) {
    return;
  }
  const option = elements.onlineTypeSelect.selectedOptions[0];
  if (option && option.disabled) {
    const fallback = getFirstAvailableOption(elements.onlineTypeSelect);
    if (fallback) {
      elements.onlineTypeSelect.value = fallback;
    }
  }
  const skin = elements.onlineSkinSelect ? elements.onlineSkinSelect.value : pendingSkins[onlineSelectedRole].skin;
  const type = elements.onlineTypeSelect.value;
  setPendingSkin(onlineSelectedRole, skin, type);
  updateOnlinePreview();
  if (multiplayer.isActive() && typeof multiplayer.getRole === "function" && multiplayer.getRole() === onlineSelectedRole) {
    applyPendingSkin(onlineSelectedRole);
  }
  updateOnlineWarning();
}

function getFirstAvailableOption(select, preferred) {
  if (!select) return null;
  const options = Array.from(select.options);
  if (preferred) {
    const found = options.find((option) => option.value === preferred && !option.disabled);
    if (found) {
      return found.value;
    }
  }
  const fallback = options.find((option) => !option.disabled);
  return fallback ? fallback.value : null;
}

function updateOfflineConflict() {
  const conflict = Boolean(
    pendingSkins.light &&
    pendingSkins.shadow &&
    pendingSkins.light.skin === pendingSkins.shadow.skin &&
    pendingSkins.light.type === pendingSkins.shadow.type
  );
  if (elements.offlineConflict) {
    elements.offlineConflict.hidden = !conflict;
    elements.offlineConflict.textContent = conflict
      ? "Оба игрока выбрали одинаковый тип скина. Выберите разные варианты."
      : "";
  }
  if (elements.offlineStart) {
    elements.offlineStart.disabled = conflict;
  }
}

function updateOfflinePreview(player) {
  const fieldset = elements.offlineFields[player];
  if (!fieldset) return;
  const pending = pendingSkins[player] || DEFAULT_SKIN_SELECTION[player];
  const previewPath = getSkinPreviewPath(pending.skin, pending.type);
  if (fieldset.preview) {
    fieldset.preview.src = previewPath;
    fieldset.preview.alt = `${getSkinLabel(pending.skin)} — ${getTypeLabel(pending.skin, pending.type)}`;
  }
  if (fieldset.label) {
    fieldset.label.textContent = `${getSkinLabel(pending.skin)} — ${getTypeLabel(pending.skin, pending.type)}`;
  }
}

function updateOnlinePreview() {
  if (!elements.onlinePreviewImage || !elements.onlinePreviewLabel) return;
  if (!onlineSelectedRole) {
    const fallback = DEFAULT_SKIN_SELECTION.light;
    elements.onlinePreviewImage.src = getSkinPreviewPath(fallback.skin, fallback.type);
    elements.onlinePreviewLabel.textContent = "Выберите сторону и скин";
    return;
  }
  const pending = pendingSkins[onlineSelectedRole];
  const path = getSkinPreviewPath(pending.skin, pending.type);
  elements.onlinePreviewImage.src = path;
  elements.onlinePreviewLabel.textContent = `${getSkinLabel(pending.skin)} — ${getTypeLabel(pending.skin, pending.type)}`;
}

function updateOnlineWarning() {
  if (!elements.onlineTypeWarning) return;
  let message = "";
  let invalid = false;
  if (!onlineSelectedRole) {
    message = "Выберите сторону, чтобы указать скин.";
    invalid = true;
  } else {
    const pending = pendingSkins[onlineSelectedRole];
    if (!pending || !pending.skin || !pending.type) {
      message = "Выберите скин и тип.";
      invalid = true;
    } else if (isCombinationTaken(onlineSelectedRole, pending.skin, pending.type, { mode: "actual" })) {
      message = "Выбранный тип уже занят соперником. Выберите другой вариант.";
      invalid = true;
    }
  }
  elements.onlineTypeWarning.hidden = !invalid || message.length === 0;
  elements.onlineTypeWarning.textContent = message;
  if (elements.connectButton) {
    elements.connectButton.disabled = invalid;
  }
}

function applyOfflineSelection() {
  applySelectedLayoutFromControls();
  const conflict = Boolean(
    pendingSkins.light &&
    pendingSkins.shadow &&
    pendingSkins.light.skin === pendingSkins.shadow.skin &&
    pendingSkins.light.type === pendingSkins.shadow.type
  );
  if (conflict) {
    updateOfflineConflict();
    return false;
  }
  multiplayer.handleOfflineSelection();
  applyAllPendingSkins({ broadcast: false });
  updateLegendImages();
  return true;
}

function openOfflineSetup() {
  syncOfflineSelectorsWithPending();
  updateOfflineConflict();
  updateLayoutSelectors();
  showOverlayElement(elements.offlineOverlay);
}

function closeOfflineSetup() {
  hideOverlayElement(elements.offlineOverlay);
}

function openTraining() {
  showOverlayElement(elements.trainingOverlay);
}

function closeTraining() {
  hideOverlayElement(elements.trainingOverlay);
}

function showStartScreen() {
  showOverlayElement(elements.startScreen);
}

function hideStartScreen() {
  hideOverlayElement(elements.startScreen);
}

function showOverlayElement(element) {
  if (!element) return;
  element.hidden = false;
  element.setAttribute("aria-hidden", "false");
}

function hideOverlayElement(element) {
  if (!element) return;
  element.hidden = true;
  element.setAttribute("aria-hidden", "true");
}

function setPendingSkin(player, skin, type) {
  const skinKey = SKINS[skin] ? skin : DEFAULT_SKIN_SELECTION[player].skin;
  const typeKey = SKINS[skinKey].types[type] ? type : Object.keys(SKINS[skinKey].types)[0];
  pendingSkins[player] = { skin: skinKey, type: typeKey };
}

function applyPendingSkin(player, { broadcast = true } = {}) {
  const next = cloneSkinSelection(skinSelection);
  next[player] = { ...pendingSkins[player] };
  applySkinSelection(next, { broadcast });
}

function applyAllPendingSkins({ broadcast = true } = {}) {
  applySkinSelection(pendingSkins, { broadcast });
}

function applySkinSelection(selection, { broadcast = true, preservePendingFor = null } = {}) {
  const previousPending = cloneSkinSelection(pendingSkins);
  skinSelection = cloneSkinSelection(selection);
  playerSkins = cloneSkinSelection(skinSelection);
  const nextPending = cloneSkinSelection(skinSelection);
  if (preservePendingFor && previousPending[preservePendingFor]) {
    nextPending[preservePendingFor] = { ...previousPending[preservePendingFor] };
  }
  pendingSkins = nextPending;
  updateLegendImages();
  renderBoard();
  updateOnlineWarning();
  if (broadcast) {
    broadcastGameState("skin-change");
  }
}

function updateLegendImages() {
  if (!elements.legendImages) return;
  elements.legendImages.forEach((img) => {
    const player = img.dataset.player || "light";
    const piece = img.dataset.piece;
    if (!piece) return;
    const selection = skinSelection[player] || DEFAULT_SKIN_SELECTION[player];
    img.src = `pieces/skins/${selection.skin}/${selection.type}/${piece}.png`;
  });
}

function getSkinPreviewPath(skin, type) {
  const skinDef = SKINS[skin];
  if (!skinDef) {
    const fallback = DEFAULT_SKIN_SELECTION.light;
    return `pieces/skins/${fallback.skin}/${fallback.type}/laser.png`;
  }
  const typeDef = skinDef.types[type];
  if (typeDef && typeDef.preview) {
    return typeDef.preview;
  }
  if (skinDef.preview) {
    return skinDef.preview;
  }
  const typeKey = typeDef ? type : Object.keys(skinDef.types)[0];
  return `pieces/skins/${skin}/${typeKey}/laser.png`;
}

function getSkinLabel(skin) {
  return SKINS[skin]?.label || skin;
}

function getTypeLabel(skin, type) {
  return SKINS[skin]?.types?.[type]?.label || type;
}

function getPieceImageUrl(piece) {
  const selection = skinSelection[piece.player] || DEFAULT_SKIN_SELECTION[piece.player];
  return `pieces/skins/${selection.skin}/${selection.type}/${piece.type}.png`;
}

function isCombinationTaken(player, skin, type, { mode = "actual" } = {}) {
  const reference = mode === "pending" ? pendingSkins : skinSelection;
  const opponent = getOpponent(player);
  if (!reference[opponent]) return false;
  return reference[opponent].skin === skin && reference[opponent].type === type;
}

function getOpponent(player) {
  return player === "light" ? "shadow" : "light";
}

function cloneSkinSelection(selection) {
  const result = {};
  for (const player of Object.keys(DEFAULT_SKIN_SELECTION)) {
    const source = selection && selection[player] ? selection[player] : DEFAULT_SKIN_SELECTION[player];
    result[player] = { skin: source.skin, type: source.type };
  }
  return result;
}

function renderBoard() {
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cell = cells[y][x];
      const piece = board[y][x];
      cell.classList.toggle("cell--light", (x + y) % 2 === 0);
      cell.classList.toggle("cell--selected", selectedCell && selectedCell.x === x && selectedCell.y === y);
      const isRecent = Boolean(
        lastMove &&
        ((lastMove.from && lastMove.from.x === x && lastMove.from.y === y) ||
          (lastMove.to && lastMove.to.x === x && lastMove.to.y === y))
      );
      cell.classList.toggle("cell--recent", isRecent);
      cell.classList.remove("cell--option", "cell--swap");
      if (piece) {
        const def = PIECE_DEFS[piece.type];
        const wrapper = document.createElement("div");
        wrapper.className = `piece piece--${piece.player}`;
        const image = document.createElement("img");
        image.src = getPieceImageUrl(piece);
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
    lastMove = {
      from: { x: from.x, y: from.y },
      to: { x: option.x, y: option.y }
    };
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
  lastMove = {
    from: { x: from.x, y: from.y },
    to: { x: option.x, y: option.y }
  };
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
  lastMove = null;
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
      return {
        path,
        hit: { piece: target, x, y },
        firer: PLAYERS[player].laserName,
        origin: emitterPos,
        termination: { x: x + 0.5, y: y + 0.5 }
      };
    }
    if (interaction.stop) {
      const result = {
        path,
        hit: null,
        firer: PLAYERS[player].laserName,
        origin: emitterPos,
        termination: { x: x + 0.5, y: y + 0.5 }
      };
      result.blocked = { piece: target, x, y };
      return result;
    }
    previous = { x, y };
    direction = interaction.nextDirection;
  }
}

function simulateLaserTrace(boardState, player) {
  const snapshot = cloneBoardState(boardState);
  const emitter = findEmitterOnBoard(snapshot, player);
  if (!emitter) {
    return null;
  }

  let { x, y } = emitter;
  let direction = snapshot[y][x] && Number.isFinite(snapshot[y][x].orientation)
    ? mod4(snapshot[y][x].orientation)
    : 0;
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
        origin: emitter,
        termination: computeExitPoint(previous, direction)
      };
    }

    x = nextX;
    y = nextY;
    path.push({ x, y });
    const target = snapshot[y][x];
    if (!target) {
      previous = { x, y };
      continue;
    }

    const interaction = resolveLaserInteraction(target, direction);
    if (interaction.destroy) {
      snapshot[y][x] = null;
    }
    if (interaction.stop) {
      const result = {
        path,
        hit: interaction.destroy ? { piece: clonePiece(target), x, y } : null,
        firer: PLAYERS[player].laserName,
        origin: emitter,
        termination: { x: x + 0.5, y: y + 0.5 }
      };
      if (!interaction.destroy) {
        result.blocked = { piece: clonePiece(target), x, y };
      }
      return result;
    }

    previous = { x, y };
    direction = interaction.nextDirection;
  }
}

function findEmitterOnBoard(boardState, player) {
  for (let y = 0; y < boardState.length; y += 1) {
    const row = boardState[y];
    if (!Array.isArray(row)) continue;
    for (let x = 0; x < row.length; x += 1) {
      const piece = row[x];
      if (piece && piece.player === player && piece.type === "laser") {
        return { x, y };
      }
    }
  }
  return null;
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

function piecesEqual(a, b) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.type === b.type && a.player === b.player && mod4(a.orientation || 0) === mod4(b.orientation || 0);
}

function boardsEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    const rowA = Array.isArray(a[y]) ? a[y] : [];
    const rowB = Array.isArray(b[y]) ? b[y] : [];
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const pieceA = rowA[x] || null;
      const pieceB = rowB[x] || null;
      if (!piecesEqual(pieceA, pieceB)) {
        return false;
      }
    }
  }
  return true;
}

function findRemovedPieces(previousBoard, currentBoard) {
  if (!previousBoard || !currentBoard) {
    return [];
  }
  const removed = [];
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const before = previousBoard[y][x];
      const after = currentBoard[y][x];
      if (before && !after) {
        removed.push({ x, y, piece: clonePiece(before) });
      }
    }
  }
  return removed;
}

function reconstructLaserSimulation(previousBoard, currentBoard, player) {
  const removedPieces = findRemovedPieces(previousBoard, currentBoard);
  for (const candidate of removedPieces) {
    const restoredBoard = cloneBoardState(currentBoard);
    restoredBoard[candidate.y][candidate.x] = clonePiece(candidate.piece);
    const result = simulateLaserTrace(restoredBoard, player);
    if (result && result.hit && result.hit.x === candidate.x && result.hit.y === candidate.y) {
      return result;
    }
  }
  return null;
}

function normaliseCoordinatePoint(point) {
  if (!point || typeof point !== "object") {
    return null;
  }
  const x = Number(point.x);
  const y = Number(point.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
    return null;
  }
  return { x, y };
}

function normaliseLastMove(move) {
  if (!move || typeof move !== "object") {
    return null;
  }
  const from = normaliseCoordinatePoint(move.from);
  const to = normaliseCoordinatePoint(move.to);
  if (!from || !to) {
    return null;
  }
  return { from, to };
}

function cloneLastMove(move) {
  const normalised = normaliseLastMove(move);
  if (!normalised) {
    return null;
  }
  return {
    from: { x: normalised.from.x, y: normalised.from.y },
    to: { x: normalised.to.x, y: normalised.to.y }
  };
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
    laser: lastLaserResult ? normaliseLaserResult(lastLaserResult) : null,
    skins: cloneSkinSelection(skinSelection),
    lastMove: cloneLastMove(lastMove),
    layout: normaliseLayoutKey(currentLayoutKey)
  };
}

function applyRemoteState(state, options = {}) {
  if (!state) return;
  const previousBoard = cloneBoardState(board);
  const previousLaserResult = lastLaserResult;
  const preserveRole = options.preservePendingFor
    ? options.preservePendingFor
    : typeof multiplayer.getRole === "function"
      ? multiplayer.getRole()
      : null;
  const hasLaserOverride = Object.prototype.hasOwnProperty.call(options, "laser");
  const hasLaserInState = state && Object.prototype.hasOwnProperty.call(state, "laser");
  const incomingLaser = hasLaserOverride
    ? options.laser
    : hasLaserInState
      ? state.laser
      : null;

  multiplayer.suppress(() => {
    setCurrentLayout(state.layout, { silent: true });
    lastMove = normaliseLastMove(state.lastMove);
    board = cloneBoardState(state.board);
    if (state.skins) {
      const skinOptions = { broadcast: false };
      if (preserveRole) {
        skinOptions.preservePendingFor = preserveRole;
      }
      applySkinSelection(state.skins, skinOptions);
    }
    currentPlayer = state.currentPlayer === "shadow" ? "shadow" : "light";
    if (typeof state.turnCounter === "number" && Number.isFinite(state.turnCounter)) {
      turnCounter = state.turnCounter;
    }
    applyRemoteSkins(state.skins);
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
    const lastMover = state.currentPlayer === "shadow" ? "light" : "shadow";
    const boardChanged = !boardsEqual(previousBoard, board);
    let nextLaserResult = null;
    if (incomingLaser) {
      nextLaserResult = normaliseLaserResult(incomingLaser);
    } else if (boardChanged) {
      const reconstructed = reconstructLaserSimulation(previousBoard, board, lastMover);
      const simulated = reconstructed || simulateLaserTrace(board, lastMover);
      if (simulated) {
        nextLaserResult = normaliseLaserResult(simulated);
      }
    } else if (previousLaserResult) {
      nextLaserResult = normaliseLaserResult(previousLaserResult);
    }
    lastLaserResult = nextLaserResult;
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
    updatePlayersUI();
    if (elements.serverInput) {
      elements.serverInput.value = deriveDefaultServerUrl();
    }
    hideOverlay();
    setOverlayStatus("Введите параметры комнаты для сетевой игры.");
    window.addEventListener("beforeunload", () => {
      cleanupSocket(true);
    });
  }

  function handleConnectSubmission() {
    if (!elements.connectionForm) return;
    const formData = new FormData(elements.connectionForm);
    applySelectedLayoutFromControls();
    const serverInput = (formData.get("server") || "").toString().trim();
    const server = serverInput || deriveDefaultServerUrl();
    const room = (formData.get("room") || "").toString().trim().toLowerCase();
    const role = (formData.get("role") || "").toString();
    const skin = (formData.get("skin") || "").toString();
    const skinType = (formData.get("skinType") || "").toString();
    if (!room || room.length < 2) {
      setOverlayStatus("Название комнаты должно содержать минимум 2 символа.");
      return;
    }
    if (role !== "light" && role !== "shadow") {
      setOverlayStatus("Выберите сторону для игры.");
      return;
    }
    const pending = pendingSkins[role];
    if (!pending || isCombinationTaken(role, pending.skin, pending.type, { mode: "actual" })) {
      updateOnlineWarning();
      return;
    }
    applyPendingSkin(role, { broadcast: false });
    state.role = role;
    updatePlayersUI();
    connectToServer(server, room, role, pending);
  }

  function handleOfflineSelection() {
    cleanupSocket(true);
    resetConnectionState();
    hideOverlay();
    setOverlayStatus("");
  }

  function connectToServer(serverUrl, roomId, role, desiredSkin) {
    let parsedUrl;
    try {
      parsedUrl = new URL(serverUrl);
    } catch (err) {
      setOverlayStatus("Некорректный адрес сервера.");
      return;
    }
    if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
      setOverlayStatus("Используйте протокол ws:// или wss://.");
      return;
    }

    cleanupSocket(true);
    setFormDisabled(true);
    setOverlayStatus("Подключение...");

    state.serverUrl = parsedUrl.toString();
    state.roomId = roomId;

    const ws = new WebSocket(state.serverUrl);
    state.ws = ws;

    ws.onopen = () => {
      setOverlayStatus("Соединение установлено. Ожидаем подтверждения...");
      send({ type: "join", roomId, role, skin: desiredSkin ? desiredSkin.skin : null, skinType: desiredSkin ? desiredSkin.type : null });
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
          applyRemoteState(payload.state, { laser: payload.laser, preservePendingFor: state.role });
          reconcileLocalSkinSelection();
        } else {
          broadcastGameState("sync");
          reconcileLocalSkinSelection();
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
          applyRemoteState(payload.state, { laser: payload.laser, preservePendingFor: state.role });
          reconcileLocalSkinSelection();
        } else if (Object.prototype.hasOwnProperty.call(payload, "laser")) {
          lastLaserResult = payload.laser ? normaliseLaserResult(payload.laser) : null;
          if (!lastLaserResult && payload.author) {
            const simulated = simulateLaserTrace(board, payload.author);
            if (simulated) {
              lastLaserResult = normaliseLaserResult(simulated);
            }
          }
          if (lastLaserResult) {
            highlightLaserPath(lastLaserResult);
          } else {
            clearLaserPath();
          }
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

  function reconcileLocalSkinSelection({ broadcast = true } = {}) {
    if (!state.connected || !state.role) {
      return;
    }
    const role = state.role;
    const desired = pendingSkins[role];
    if (!desired) {
      return;
    }
    const actual = skinSelection[role] || DEFAULT_SKIN_SELECTION[role];
    if (actual.skin === desired.skin && actual.type === desired.type) {
      return;
    }
    if (isCombinationTaken(role, desired.skin, desired.type, { mode: "actual" })) {
      pendingSkins[role] = { skin: actual.skin, type: actual.type };
      handleOnlineRoleChange(role);
      updateOnlinePreview();
      updateOnlineWarning();
      syncOfflineSelectorsWithPending();
      return;
    }
    applyPendingSkin(role, { broadcast });
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
      if (control.id === "online-back") return;
      control.disabled = disabled;
    });
  }

  function openOverlay() {
    showOverlay();
    updatePlayersUI();
    const roleName = state.role && PLAYERS[state.role] ? PLAYERS[state.role].name : null;
    const message = state.connected
      ? `Соединение активно${roleName ? `: вы играете за «${roleName}».` : "."}`
      : "Подключитесь к комнате или продолжите офлайн.";
    setOverlayStatus(message);
    setFormDisabled(false);
    handleOnlineRoleChange(state.role || onlineSelectedRole);
    updateOnlinePreview();
    updateOnlineWarning();
  }

  function closeOverlay() {
    hideOverlay();
    setOverlayStatus("");
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
    state.role = null;
    state.players = { light: false, shadow: false };
    updatePlayersUI();
    onlineSelectedRole = null;
    handleOnlineRoleChange(null);
  }

  function send(payload) {
    if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    state.ws.send(JSON.stringify(payload));
  }

  function deriveDefaultServerUrl() {
    return DEFAULT_SERVER_URL;
  }

  return {
    init,
    handleConnectSubmission,
    handleOfflineSelection,
    openOverlay,
    closeOverlay,
    getRole() {
      return state.role;
    },
    sendState(reason, statePayload) {
      const laserSnapshot = statePayload && Object.prototype.hasOwnProperty.call(statePayload, "laser")
        ? statePayload.laser
        : lastLaserResult
          ? normaliseLaserResult(lastLaserResult)
          : null;
      send({
        type: "state",
        roomId: state.roomId,
        role: state.role,
        reason,
        state: statePayload,
        laser: laserSnapshot
      });
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
