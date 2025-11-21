(function () {
  const registry = window.__skinEffectsRegistry || (window.__skinEffectsRegistry = {});

  function registerSkinEffects(key, handlers) {
    if (!key || !handlers || typeof handlers !== "object") {
      return;
    }
    registry[key] = handlers;
  }

  function withReflow(element, className) {
    if (!element || !className) {
      return;
    }
    element.classList.remove(className);
    void element.offsetWidth; // eslint-disable-line no-unused-expressions
    element.classList.add(className);
  }

  function removeOnAnimationEnd(element, className) {
    if (!element || !className) {
      return;
    }
    const handle = () => {
      element.classList.remove(className);
      element.removeEventListener("animationend", handle);
    };
    element.addEventListener("animationend", handle, { once: true });
  }

  function createSimpleSkinEffects(config = {}) {
    const key = config.key;
    if (!key) {
      throw new Error("simple skin effects require a key");
    }
    const varPrefix = (config.varPrefix || key).toLowerCase();
    const classes = config.classes || {};
    const pieceTypeClasses = config.pieceTypeClasses || {};
    const rotationDataAttr = config.rotationDataAttribute || `${varPrefix}RotationDirection`;
    const orientationDataAttr = config.orientationDataAttribute || `${varPrefix}Orientation`;
    const pieceTypeDataAttr = config.pieceTypeDataAttribute || `${varPrefix}Piece`;

    const state = {
      board: null,
      boardWrapper: null,
      laserOverlay: null,
      effectsOverlay: null,
      boardSize: { width: 10, height: 8 },
      getCellElement: null
    };

    function matches(selection) {
      return Boolean(selection && selection.skin === key);
    }

    function init(options = {}) {
      state.board = options.boardElement || state.board;
      state.boardWrapper = options.boardWrapper || state.boardWrapper;
      state.laserOverlay = options.laserOverlay || state.laserOverlay;
      state.effectsOverlay = options.effectsOverlay || state.effectsOverlay;
      if (options.boardSize) {
        const { width, height } = options.boardSize;
        state.boardSize = {
          width: Number.isFinite(width) ? width : state.boardSize.width,
          height: Number.isFinite(height) ? height : state.boardSize.height
        };
      }
      if (typeof options.getCellElement === "function") {
        state.getCellElement = options.getCellElement;
      }
    }

    function onBoardTheme(payload) {
      if (!state.boardWrapper) {
        return;
      }
      const active = matches(payload && payload.selection);
      if (!active) {
        state.boardWrapper.classList.remove(classes.boardPulse);
        if (state.board) {
          state.board.classList.remove(classes.boardActive);
        }
        return;
      }
      if (classes.boardActive && state.board) {
        state.board.classList.add(classes.boardActive);
      }
      if (classes.boardPulse) {
        withReflow(state.boardWrapper, classes.boardPulse);
      }
    }

    function decoratePiece(payload) {
      if (!payload || !payload.wrapper || !payload.image || !payload.piece) {
        return;
      }
      const selection = payload.selection;
      if (!matches(selection)) {
        return;
      }
      const { wrapper, image, piece, position, lastMove } = payload;
      if (classes.piece) {
        wrapper.classList.add(classes.piece);
      }
      if (classes.image) {
        image.classList.add(classes.image);
      }
      if (pieceTypeClasses[piece.type]) {
        wrapper.classList.add(pieceTypeClasses[piece.type]);
      }
      const orientation = Number.isFinite(piece.orientation) ? ((piece.orientation % 4) + 4) % 4 : 0;
      wrapper.dataset[orientationDataAttr] = String(orientation);
      wrapper.dataset[pieceTypeDataAttr] = piece.type || "";
      const angle = orientation * 90;
      wrapper.style.setProperty(`--${varPrefix}-orientation-angle`, `${angle}deg`);
      image.style.setProperty(`--${varPrefix}-orientation-angle`, `${angle}deg`);

      if (lastMove && lastMove.to && lastMove.from && position) {
        if (lastMove.to.x === position.x && lastMove.to.y === position.y) {
          const dx = lastMove.from.x - lastMove.to.x;
          const dy = lastMove.from.y - lastMove.to.y;
          image.style.setProperty(`--${varPrefix}-move-dx`, String(dx));
          image.style.setProperty(`--${varPrefix}-move-dy`, String(dy));
          if (classes.enter) {
            image.classList.add(classes.enter);
            const handleEnd = () => {
              image.classList.remove(classes.enter);
              image.style.removeProperty(`--${varPrefix}-move-dx`);
              image.style.removeProperty(`--${varPrefix}-move-dy`);
            };
            image.addEventListener("animationend", handleEnd, { once: true });
          }
          if (classes.trail) {
            const trail = document.createElement("span");
            trail.className = classes.trail;
            wrapper.appendChild(trail);
            requestAnimationFrame(() => {
              trail.classList.add(classes.trailActive || `${classes.trail}--active`);
            });
            const cleanup = () => {
              if (trail && trail.parentElement) {
                trail.parentElement.removeChild(trail);
              }
            };
            trail.addEventListener("animationend", cleanup, { once: true });
            window.setTimeout(cleanup, 800);
          }
        }
      }
    }

    function handleRotation(payload) {
      if (!payload || !payload.image) {
        return;
      }
      if (!matches(payload.selection)) {
        return;
      }
      const { image, previousOrientation, currentOrientation } = payload;
      if (previousOrientation === undefined || previousOrientation === null) {
        return;
      }
      const prev = ((Number(previousOrientation) % 4) + 4) % 4;
      const curr = ((Number(currentOrientation) % 4) + 4) % 4;
      if (prev === curr) {
        return;
      }
      const delta = (curr - prev + 4) % 4;
      const direction = delta === 3 ? "ccw" : "cw";
      image.dataset[rotationDataAttr] = direction;
      image.style.setProperty(`--${varPrefix}-orientation-angle`, `${curr * 90}deg`);
      if (classes.rotation) {
        image.classList.add(classes.rotation);
        if (classes.rotationReverse) {
          if (direction === "ccw") {
            image.classList.add(classes.rotationReverse);
          } else {
            image.classList.remove(classes.rotationReverse);
          }
        }
        const handleEnd = () => {
          image.classList.remove(classes.rotation);
          if (classes.rotationReverse) {
            image.classList.remove(classes.rotationReverse);
          }
          delete image.dataset[rotationDataAttr];
          image.removeEventListener("animationend", handleEnd);
        };
        image.addEventListener("animationend", handleEnd);
      }
    }

    function invalidMove(payload) {
      if (!payload || !payload.cell || !matches(payload.selection)) {
        return;
      }
      const cell = payload.cell;
      if (!classes.invalid) {
        return;
      }
      cell.classList.remove(classes.invalid);
      void cell.offsetWidth; // eslint-disable-line no-unused-expressions
      cell.classList.add(classes.invalid);
      removeOnAnimationEnd(cell, classes.invalid);
    }

    function onLaserFired(payload) {
      if (!payload || !matches(payload.selection)) {
        return;
      }
      const result = payload.result;
      const hasDestruction = result && Boolean(result.hit);
      if (classes.boardPulse && state.boardWrapper && hasDestruction) {
        withReflow(state.boardWrapper, classes.boardPulse);
      }
      if (!classes.emitter || !result || !result.origin || typeof state.getCellElement !== "function") {
        return;
      }
      const origin = result.origin;
      const cell = state.getCellElement(origin.x, origin.y);
      if (!cell) {
        return;
      }
      cell.classList.add(classes.emitter);
      removeOnAnimationEnd(cell, classes.emitter);
    }

    function handleVictory(payload) {
      if (!payload || !matches(payload.selection) || !state.board || !classes.victory) {
        return;
      }
      const winner = payload.winner;
      if (!winner) {
        return;
      }
      const hero = state.board.querySelector(`.piece--${winner}.piece--hero`);
      if (!hero) {
        return;
      }
      hero.classList.add(classes.victory);
      removeOnAnimationEnd(hero, classes.victory);
      window.setTimeout(() => hero.classList.remove(classes.victory), 1600);
    }

    return {
      init,
      onBoardTheme,
      decoratePiece,
      handleRotation,
      invalidMove,
      onLaserFired,
      handleVictory
    };
  }

  if (!window.__registerSkinEffects) {
    window.__registerSkinEffects = registerSkinEffects;
  }
  window.__createSimpleSkinEffects = createSimpleSkinEffects;
})();
