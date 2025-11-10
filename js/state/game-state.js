export class GameState {
  constructor({ defaultLayoutKey, width, height }) {
    this.defaultLayoutKey = defaultLayoutKey;
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset({ layoutKey = this.defaultLayoutKey } = {}) {
    this.layoutKey = layoutKey;
    this.board = this.createEmptyBoard();
    this.currentPlayer = "light";
    this.selectedCell = null;
    this.currentOptions = [];
    this.turnCounter = 1;
    this.lastStatusMessage = "";
    this.lastLaserResult = null;
    this.lastLaserEffectSignature = null;
    this.lastLaserEffectTimestamp = 0;
    this.lastMove = null;
    return this;
  }

  createEmptyBoard() {
    return Array.from({ length: this.height }, () => Array(this.width).fill(null));
  }

  setLayoutKey(layoutKey) {
    if (layoutKey) {
      this.layoutKey = layoutKey;
    }
    return this.layoutKey;
  }

  setBoard(board) {
    this.board = board || this.createEmptyBoard();
    return this.board;
  }
}
