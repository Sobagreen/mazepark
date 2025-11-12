(function () {
  const SKIN_KEY = "Greece";

  const state = {
    board: null,
    boardWrapper: null,
    laserOverlay: null,
    effectsOverlay: null,
    boardSize: { width: 10, height: 8 },
    getCellElement: null,
    lastThemeActive: false,
    laserExtras: []
  };

  function normaliseOrientation(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 0;
    }
    return ((numeric % 4) + 4) % 4;
  }

  function matches(selection) {
    return Boolean(selection && selection.skin === SKIN_KEY);
  }

  function setBoardDataset(active, type) {
    if (!state.board) return;
    if (active) {
      state.board.dataset.skin = SKIN_KEY;
      if (type) {
        state.board.dataset.skinType = type;
      } else {
        delete state.board.dataset.skinType;
      }
    } else {
      delete state.board.dataset.skin;
      delete state.board.dataset.skinType;
    }
  }

  function clearLaserExtras() {
    state.laserExtras.forEach((item) => {
      if (!item) return;
      if (item.timeout) {
        clearTimeout(item.timeout);
      }
      if (item.element && item.element.parentElement) {
        item.element.parentElement.removeChild(item.element);
      }
    });
    state.laserExtras = [];
  }

  function createOverlayElement(className, center) {
    if (!state.laserOverlay || !center) {
      return null;
    }
    const el = document.createElement("div");
    el.className = `greece-laser-extra ${className}`;
    if (Number.isFinite(center.x) && Number.isFinite(center.y)) {
      el.style.left = `${(center.x / state.boardSize.width) * 100}%`;
      el.style.top = `${(center.y / state.boardSize.height) * 100}%`;
    }
    state.laserOverlay.appendChild(el);
    const timeout = window.setTimeout(() => {
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    }, 1600);
    state.laserExtras.push({ element: el, timeout });
    el.addEventListener(
      "animationend",
      () => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      },
      { once: true }
    );
    return el;
  }

  function toCellCenter(position) {
    if (!position) {
      return null;
    }
    return {
      x: position.x + 0.5,
      y: position.y + 0.5
    };
  }

  function resolveResultSelection(result, fallbackSelection) {
    if (result && result.skin && result.skin.skin) {
      return { skin: result.skin.skin, type: result.skin.type };
    }
    if (fallbackSelection) {
      return fallbackSelection;
    }
    if (result && result.player) {
      return { skin: null, type: null, player: result.player };
    }
    return null;
  }

  function withReflow(element, className) {
    if (!element) return;
    element.classList.remove(className);
    // Force reflow
    void element.offsetWidth; // eslint-disable-line no-unused-expressions
    element.classList.add(className);
  }

  function init(options) {
    state.board = options && options.boardElement ? options.boardElement : state.board;
    state.boardWrapper = options && options.boardWrapper ? options.boardWrapper : state.boardWrapper;
    state.laserOverlay = options && options.laserOverlay ? options.laserOverlay : state.laserOverlay;
    state.effectsOverlay = options && options.effectsOverlay ? options.effectsOverlay : state.effectsOverlay;
    if (options && options.boardSize) {
      state.boardSize = {
        width: options.boardSize.width || state.boardSize.width,
        height: options.boardSize.height || state.boardSize.height
      };
    }
    if (options && typeof options.getCellElement === "function") {
      state.getCellElement = options.getCellElement;
    }
  }

  function onBoardTheme(payload) {
    const selection = payload ? payload.selection : null;
    const active = matches(selection);
    setBoardDataset(active, selection ? selection.type : null);
    if (state.boardWrapper) {
      if (active) {
        withReflow(state.boardWrapper, "greece-board-breathe");
      } else {
        state.boardWrapper.classList.remove("greece-board-breathe");
      }
    }
    state.lastThemeActive = active;
  }

  function decoratePiece(payload) {
    if (!payload || !payload.wrapper || !payload.image) {
      return;
    }
    const selection = payload.selection;
    if (!matches(selection)) {
      return;
    }
    const { wrapper, image, piece, position, lastMove } = payload;
    wrapper.classList.add("greece-piece");
    if (piece && piece.type) {
      wrapper.dataset.greecePiece = piece.type;
    }
    const orientation = piece && piece.orientation !== undefined ? normaliseOrientation(piece.orientation) : 0;
    wrapper.dataset.greeceOrientation = String(orientation);
    wrapper.style.setProperty("--greece-orientation-angle", `${orientation * 90}deg`);

    switch (piece.type) {
      case "volhv":
        wrapper.classList.add("greece-piece--volhv");
        break;
      case "shield":
        wrapper.classList.add("greece-piece--shield");
        break;
      case "totem":
        wrapper.classList.add("greece-piece--totem");
        break;
      case "mirror":
        wrapper.classList.add("greece-piece--mirror");
        break;
      default:
        break;
    }

    if (lastMove && lastMove.to && lastMove.from && position) {
      if (lastMove.to.x === position.x && lastMove.to.y === position.y) {
        const dx = lastMove.from.x - lastMove.to.x;
        const dy = lastMove.from.y - lastMove.to.y;
        image.style.setProperty("--greece-move-dx", String(dx));
        image.style.setProperty("--greece-move-dy", String(dy));
        image.classList.add("greece-piece__image--enter");
        image.addEventListener(
          "animationend",
          () => {
            image.classList.remove("greece-piece__image--enter");
            image.style.removeProperty("--greece-move-dx");
            image.style.removeProperty("--greece-move-dy");
          },
          { once: true }
        );
        const trail = document.createElement("span");
        trail.className = "greece-piece-trail";
        wrapper.appendChild(trail);
        requestAnimationFrame(() => {
          trail.classList.add("greece-piece-trail--active");
        });
        const removeTrail = () => {
          if (trail.parentElement) {
            trail.parentElement.removeChild(trail);
          }
        };
        trail.addEventListener("animationend", removeTrail, { once: true });
        setTimeout(removeTrail, 800);
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
    if (previousOrientation === null || previousOrientation === undefined) {
      return;
    }
    const prev = normaliseOrientation(previousOrientation);
    const curr = normaliseOrientation(currentOrientation);
    if (prev === curr) {
      return;
    }
    const delta = ((curr - prev + 4) % 4);
    const direction = delta === 3 ? "ccw" : "cw";
    image.dataset.greeceRotationDirection = direction;
    image.classList.add("greece-piece__image--rotating");
    image.addEventListener(
      "animationend",
      () => {
        image.classList.remove("greece-piece__image--rotating");
        delete image.dataset.greeceRotationDirection;
      },
      { once: true }
    );
  }

  function invalidMove(payload) {
    if (!payload || !payload.cell) {
      return;
    }
    if (!matches(payload.selection)) {
      return;
    }
    const cell = payload.cell;
    cell.classList.remove("greece-cell--invalid");
    void cell.offsetWidth; // eslint-disable-line no-unused-expressions
    cell.classList.add("greece-cell--invalid");
    cell.addEventListener(
      "animationend",
      () => {
        cell.classList.remove("greece-cell--invalid");
      },
      { once: true }
    );
  }

  function onLaserFired(payload) {
    if (!payload) {
      return;
    }
    const selection = payload.selection;
    if (!matches(selection)) {
      return;
    }
    if (state.boardWrapper) {
      withReflow(state.boardWrapper, "greece-board-breathe");
    }
    if (payload.result && payload.result.origin && typeof state.getCellElement === "function") {
      const cell = state.getCellElement(payload.result.origin.x, payload.result.origin.y);
      if (cell) {
        cell.classList.add("greece-cell--emitter-charge");
        cell.addEventListener(
          "animationend",
          () => {
            cell.classList.remove("greece-cell--emitter-charge");
          },
          { once: true }
        );
      }
    }
  }

  function applyBeamStyling(active) {
    if (!state.laserOverlay) {
      return;
    }
    const beams = state.laserOverlay.querySelectorAll(".laser-overlay__beam");
    const total = beams.length || 1;
    beams.forEach((beam, index) => {
      if (active) {
        beam.classList.add("greece-laser-beam");
        beam.style.setProperty("--greece-laser-index", String(index));
        const opacity = 0.55 + (index / total) * 0.35;
        beam.style.opacity = opacity.toFixed(3);
      } else {
        beam.classList.remove("greece-laser-beam");
        beam.style.removeProperty("--greece-laser-index");
        beam.style.removeProperty("opacity");
      }
    });
    if (active) {
      state.laserOverlay.classList.add("greece-laser-active");
      state.laserOverlay.style.setProperty("--greece-laser-count", String(beams.length));
    } else {
      state.laserOverlay.classList.remove("greece-laser-active");
      state.laserOverlay.style.removeProperty("--greece-laser-count");
    }
  }

  function handleLaserPath(payload) {
    if (!payload) {
      clearLaserExtras();
      applyBeamStyling(false);
      return;
    }
    const { result } = payload;
    if (!result) {
      clearLaserExtras();
      applyBeamStyling(false);
      return;
    }
    const selection = resolveResultSelection(result, payload.selection);
    const active = matches(selection);
    if (!active) {
      clearLaserExtras();
      applyBeamStyling(false);
      return;
    }
    applyBeamStyling(true);
    clearLaserExtras();

    const steps = Array.isArray(result.path) ? result.path.slice() : [];
    const centers = [];
    if (result.origin) {
      centers.push(toCellCenter(result.origin));
    }
    steps.forEach((step) => {
      centers.push(toCellCenter(step));
    });

    centers.forEach((center, idx) => {
      if (!center) return;
      if (idx > 0) {
        createOverlayElement("greece-laser-marker", center);
      }
    });

    for (let i = 0; i < steps.length; i += 1) {
      const current = steps[i];
      if (!current) continue;
      const prev = i === 0 ? (result.origin ? result.origin : null) : steps[i - 1];
      const next = steps[i + 1];
      if (!prev || !next) {
        continue;
      }
      const dx1 = current.x - prev.x;
      const dy1 = current.y - prev.y;
      const dx2 = next.x - current.x;
      const dy2 = next.y - current.y;
      if (dx1 !== dx2 || dy1 !== dy2) {
        const center = toCellCenter(current);
        createOverlayElement("greece-laser-reflection", center);
        createOverlayElement("greece-laser-glyph", center);
      }
    }

    if (!result.hit && result.termination) {
      createOverlayElement("greece-laser-fade", result.termination);
    }
  }

  function handleLaserImpact(payload) {
    if (!payload || !payload.result || !payload.result.hit) {
      return;
    }
    const selection = resolveResultSelection(payload.result, payload.selection);
    if (!matches(selection)) {
      return;
    }
    const center = toCellCenter(payload.result.hit);
    if (!state.effectsOverlay || !center) {
      return;
    }
    const effect = document.createElement("div");
    effect.className = "greece-impact-scorch";
    effect.style.left = `${(center.x / state.boardSize.width) * 100}%`;
    effect.style.top = `${(center.y / state.boardSize.height) * 100}%`;
    state.effectsOverlay.appendChild(effect);
    const remove = () => {
      if (effect.parentElement) {
        effect.parentElement.removeChild(effect);
      }
    };
    effect.addEventListener("animationend", remove, { once: true });
    window.setTimeout(remove, 1200);
  }

  function handleVictory(payload) {
    if (!payload || !matches(payload.selection) || !state.board) {
      return;
    }
    const playerClass = payload.winner ? `piece--${payload.winner}` : null;
    if (!playerClass) {
      return;
    }
    const hero = state.board.querySelector(`.${playerClass}.piece--hero`);
    if (!hero) {
      return;
    }
    hero.classList.add("greece-piece--victory");
    hero.addEventListener(
      "animationend",
      () => {
        hero.classList.remove("greece-piece--victory");
      },
      { once: true }
    );
    window.setTimeout(() => {
      hero.classList.remove("greece-piece--victory");
    }, 2000);
  }

  window.GreeceSkinEffects = {
    init,
    onBoardTheme,
    decoratePiece,
    handleRotation,
    invalidMove,
    onLaserFired,
    handleLaserPath,
    handleLaserImpact,
    handleVictory
  };
  if (window.__registerSkinEffects) {
    window.__registerSkinEffects(SKIN_KEY, window.GreeceSkinEffects);
  }
})();
