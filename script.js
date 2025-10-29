(function () {
  const BOARD_SIZE = 10;
  const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const ROW_NUMBERS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const directionByPlayer = { dawn: -1, dusk: 1 };

  const PLAYERS = {
    dawn: {
      name: 'Орден Рассвета',
      motto: 'Инициатива света',
      color: '#f6d47f'
    },
    dusk: {
      name: 'Клан Сумрака',
      motto: 'Тактика тени',
      color: '#7aa5ff'
    }
  };

  const PIECES = {
    commander: {
      name: 'Командор',
      glyph: { dawn: '✶', dusk: '✹' },
      role: 'Лидер',
      description: 'Центр координации отряда. Командор обеспечивает связь и не может быть потерян.',
      movement: 'Ходит на одну клетку в любом направлении.',
      traits: ['Лидер', 'Тактическая аура'],
      stats: { Манёвр: '★☆☆', Контроль: '★★★★★', Защита: '★★★★' },
      abilities: [
        {
          id: 'radiant-step',
          name: 'Радиантный шаг',
          cost: 4,
          description: 'Прорыв на две клетки по любой из восьми направлений. Пути должны быть свободны.'
        },
        {
          id: 'astral-swap',
          name: 'Астральный обмен',
          cost: 6,
          description: 'Меняется местами с союзной фигурой в радиусе трёх клеток, мгновенно перебрасывая силы.'
        }
      ]
    },
    sentinel: {
      name: 'Страж',
      glyph: { dawn: '⬢', dusk: '⬣' },
      role: 'Линейный контроль',
      description: 'Стражи держат прямые коридоры и отрезают пути отступления.',
      movement: 'Любое количество клеток по горизонтали или вертикали без прыжков.',
      traits: ['Линии давления', 'Гарнизон'],
      stats: { Манёвр: '★★★', Контроль: '★★★★', Сложность: '★★' },
      abilities: [
        {
          id: 'iron-diagonals',
          name: 'Железные диагонали',
          cost: 3,
          description: 'Дает возможность сместиться по диагонали на одну или две клетки.'
        },
        {
          id: 'siege-bolt',
          name: 'Осадный импульс',
          cost: 5,
          description: 'Дистанционный удар по прямой до трёх клеток. Страж остаётся на месте.'
        }
      ]
    },
    strider: {
      name: 'Странник',
      glyph: { dawn: '◇', dusk: '◆' },
      role: 'Диагональный манёвр',
      description: 'Странники режут пространство по диагоналям и выстраивают дуги обхода.',
      movement: 'Любое количество клеток по диагонали без прыжков.',
      traits: ['Фланг', 'Позиционный прессинг'],
      stats: { Манёвр: '★★★★', Контроль: '★★★', Сложность: '★★☆' },
      abilities: [
        {
          id: 'horizon-drift',
          name: 'Горизонтальный дрейф',
          cost: 3,
          description: 'Однократный ход на две клетки по горизонтали, раскрывающий новые углы атаки.'
        },
        {
          id: 'prism-gate',
          name: 'Призматический портал',
          cost: 6,
          description: 'Телепорт на диагональ через три клетки, если цель свободна.'
        }
      ]
    },
    lancer: {
      name: 'Гонец',
      glyph: { dawn: '⚚', dusk: '⚝' },
      role: 'Манёвр через заслоны',
      description: 'Гонец прыгает дугой, прорывается через заслоны и наносит внезапные удары.',
      movement: 'Прыжок буквой «Г»: две клетки в одном направлении и одна в перпендикулярном.',
      traits: ['Скачок', 'Атака из тыла'],
      stats: { Манёвр: '★★★★★', Контроль: '★★', Сложность: '★★★' },
      abilities: [
        {
          id: 'meteor-dash',
          name: 'Метеорный разгон',
          cost: 3,
          description: 'Рывок по прямой до трёх клеток с возможностью срезать врага в конце пути.'
        },
        {
          id: 'storm-reversal',
          name: 'Штормовой переворот',
          cost: 5,
          description: 'Прыжок к цели по ходу коня с обменом позиций, выбивая врага с ключевой клетки.'
        }
      ]
    },
    squire: {
      name: 'Рекрут',
      glyph: { dawn: '◖', dusk: '◗' },
      role: 'Линия фронта',
      description: 'Рекруты выстраивают фронт. Врага берут по диагонали и могут сделать стартовый рывок.',
      movement: 'На одну клетку вперёд (две при первом ходе). Захватывает по диагонали. На последней линии повышается до Странника.',
      traits: ['Гарнизон', 'Повышение'],
      stats: { Манёвр: '★★', Контроль: '★★', Сложность: '★' },
      abilities: [
        {
          id: 'line-surge',
          name: 'Фронтовой рывок',
          cost: 2,
          description: 'Повторный марш на две клетки вперёд даже после первых шагов, если путь свободен.'
        },
        {
          id: 'hook-strike',
          name: 'Крюковой удар',
          cost: 3,
          description: 'Лобовая атака на одну клетку вперёд, пробивая оборону противника.'
        }
      ]
    }
  };

  const MAX_ENERGY = 16;
  const CAPTURE_REWARD = {
    commander: 6,
    sentinel: 4,
    strider: 4,
    lancer: 4,
    squire: 2
  };

  const ABILITY_EFFECTS = {
    'radiant-step': {
      generate: generateRadiantStepOptions,
      apply: applyStandardAbilityMove
    },
    'astral-swap': {
      generate: generateAstralSwapOptions,
      apply: applyAstralSwap
    },
    'iron-diagonals': {
      generate: generateIronDiagonalOptions,
      apply: applyStandardAbilityMove
    },
    'siege-bolt': {
      generate: generateSiegeBoltOptions,
      apply: applySiegeBolt
    },
    'horizon-drift': {
      generate: generateHorizonDriftOptions,
      apply: applyStandardAbilityMove
    },
    'prism-gate': {
      generate: generatePrismGateOptions,
      apply: applyStandardAbilityMove
    },
    'meteor-dash': {
      generate: generateMeteorDashOptions,
      apply: applyStandardAbilityMove
    },
    'storm-reversal': {
      generate: generateStormReversalOptions,
      apply: applyStormReversal
    },
    'line-surge': {
      generate: generateLineSurgeOptions,
      apply: applyStandardAbilityMove
    },
    'hook-strike': {
      generate: generateHookStrikeOptions,
      apply: applyStandardAbilityMove
    }
  };

  let boardEl;
  let boardFrame;
  let statusPrimaryEl;
  let statusSecondaryEl;
  let moveLogEl;
  let codexEl;
  let newGameButton;
  let playAgainButton;
  let liveRegion;
  let endgameEl;
  let endgameTitleEl;
  let endgameSubtitleEl;
  let playerCards;
  let turnBadges;
  let capturedEls;
  let focusEls;

  let activeAbility = null;
  let abilitySource = null;

  let board = [];
  let cellElements = [];
  let currentPlayer = 'dawn';
  let selectedCell = null;
  let legalMoves = [];
  let legalMoveMap = new Map();
  let capturedPieces = { dawn: [], dusk: [] };
  let moveHistory = [];
  let gameState = 'idle';
  let winner = null;

  function initialize() {
    boardEl = document.getElementById('board');
    boardFrame = document.querySelector('.board-frame');
    statusPrimaryEl = document.getElementById('status-primary');
    statusSecondaryEl = document.getElementById('status-secondary');
    moveLogEl = document.getElementById('move-log');
    codexEl = document.getElementById('codex');
    newGameButton = document.getElementById('new-game');
    playAgainButton = document.getElementById('play-again');
    liveRegion = document.getElementById('live-region');
    endgameEl = document.getElementById('endgame');
    endgameTitleEl = document.getElementById('endgame-title');
    endgameSubtitleEl = document.getElementById('endgame-subtitle');

    playerCards = {
      dawn: document.querySelector('.player-card[data-player="dawn"]'),
      dusk: document.querySelector('.player-card[data-player="dusk"]')
    };
    turnBadges = {
      dawn: document.getElementById('turn-dawn'),
      dusk: document.getElementById('turn-dusk')
    };
    capturedEls = {
      dawn: document.getElementById('captured-dawn'),
      dusk: document.getElementById('captured-dusk')
    };

    focusEls = {
      card: document.getElementById('piece-focus'),
      glyph: document.getElementById('focus-glyph'),
      name: document.getElementById('focus-name'),
      role: document.getElementById('focus-role'),
      summary: document.getElementById('focus-summary'),
      movement: document.getElementById('focus-movement'),
      position: document.getElementById('focus-position'),
      status: document.getElementById('focus-status'),
      promotion: document.getElementById('focus-promotion'),
      energy: document.getElementById('focus-energy'),
      traits: document.getElementById('focus-traits'),
      stats: document.getElementById('focus-stats'),
      abilities: document.getElementById('focus-abilities')
    };

    if (!boardEl) {
      return;
    }

    newGameButton?.addEventListener('click', handleNewGameRequest);
    playAgainButton?.addEventListener('click', handleNewGameRequest);

    buildBoardSkeleton();
    populateCodex();
    startNewGame();
    window.addEventListener('resize', updateBoardOrientation);
  }

  function handleNewGameRequest(event) {
    event?.preventDefault();
    startNewGame();
    if (event?.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
  }

  function startNewGame() {
    board = createInitialBoard();
    currentPlayer = 'dawn';
    selectedCell = null;
    legalMoves = [];
    legalMoveMap.clear();
    capturedPieces = { dawn: [], dusk: [] };
    moveHistory = [];
    gameState = 'playing';
    winner = null;
    endgameEl.hidden = true;
    clearAbilityState();
    renderBoard();
    updateBoardOrientation();
    updateHighlights();
    updateCaptured();
    renderMoveLog();
    updatePieceFocus(null);
    updateTurnPanel();
    updateStatus('Орден Рассвета начинает партию.', 'Выберите фигуру, чтобы совершить первый ход.');
  }

  function buildBoardSkeleton() {
    boardEl.innerHTML = '';
    boardEl.style.setProperty('--board-size', BOARD_SIZE);
    cellElements = Array.from({ length: BOARD_SIZE }, () => []);

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `cell ${(row + col) % 2 === 0 ? 'cell--light' : 'cell--dark'}`;
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.dataset.coord = toNotation(row, col);
        cell.setAttribute('aria-label', `Клетка ${toNotation(row, col)}`);
        cell.addEventListener('click', handleCellClick);
        boardEl.appendChild(cell);
        cellElements[row][col] = cell;
      }
    }
  }

  function handleCellClick(event) {
    if (gameState !== 'playing') {
      return;
    }

    const cell = event.currentTarget;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const piece = board[row][col];

    if (activeAbility && abilitySource) {
      const key = `${row},${col}`;
      const abilityMove = legalMoveMap.get(key);
      if (abilityMove) {
        executeMove(abilitySource.row, abilitySource.col, abilityMove);
        return;
      }
      if (abilitySource.row === row && abilitySource.col === col) {
        clearAbilityState();
        setLegalMoves([]);
        updateHighlights();
        if (piece) {
          updatePieceFocus(piece, row, col);
        }
        updateStatus('Способность отменена.', `${PLAYERS[currentPlayer].name} выбирает новое действие.`);
        return;
      }
      clearAbilityState();
    }

    const key = `${row},${col}`;
    const move = legalMoveMap.get(key);
    if (move && selectedCell) {
      executeMove(selectedCell.row, selectedCell.col, move);
      return;
    }

    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      selectedCell = null;
      setLegalMoves([]);
      updateHighlights();
      updatePieceFocus(null);
      updateStatus(`${PLAYERS[currentPlayer].name} ожидает решения.`, 'Вы можете выбрать другую фигуру.');
      return;
    }

    if (!piece) {
      selectedCell = null;
      setLegalMoves([]);
      updateHighlights();
      updatePieceFocus(null);
      return;
    }

    updatePieceFocus(piece, row, col);

    if (piece.owner !== currentPlayer) {
      setLegalMoves([]);
      selectedCell = null;
      updateHighlights();
      updateStatus(`${PLAYERS[currentPlayer].name} ходит.`, 'Вы можете только изучить фигуры соперника.');
      return;
    }

    const moves = getLegalMoves(row, col);
    selectedCell = { row, col };
    setLegalMoves(moves);
    updateHighlights();
    if (moves.length === 0) {
      updateStatus(`${PIECES[piece.type].name} заблокирован.`, 'Выберите другую фигуру для манёвра.');
    } else {
      const coords = moves.map((m) => toNotation(m.row, m.col)).join(', ');
      updateStatus(`${PIECES[piece.type].name} готов к манёвру.`, `Доступные клетки: ${coords}.`);
    }
  }

  function clearAbilityState() {
    activeAbility = null;
    abilitySource = null;
  }

  function handleAbilityActivation(row, col, abilityDef) {
    if (gameState !== 'playing') {
      return;
    }
    const piece = board[row][col];
    if (!piece || piece.owner !== currentPlayer) {
      return;
    }
    if (piece.energy < abilityDef.cost) {
      updateStatus('Недостаточно силы для способности.', `Нужно ${abilityDef.cost}, доступно ${piece.energy}.`);
      return;
    }

    if (
      activeAbility &&
      abilitySource &&
      activeAbility.id === abilityDef.id &&
      abilitySource.row === row &&
      abilitySource.col === col
    ) {
      clearAbilityState();
      setLegalMoves([]);
      updateHighlights();
      updatePieceFocus(piece, row, col);
      updateStatus(`${abilityDef.name} отменена.`, `${PLAYERS[currentPlayer].name} выбирает новое действие.`, false);
      return;
    }

    const moves = getAbilityMoves(board, row, col, piece, abilityDef);
    if (moves.length === 0) {
      clearAbilityState();
      setLegalMoves([]);
      updateHighlights();
      updatePieceFocus(piece, row, col);
      updateStatus(`${abilityDef.name} пока невозможна.`, 'Нет допустимых целей.', false);
      return;
    }

    activeAbility = abilityDef;
    abilitySource = { row, col };
    selectedCell = { row, col };
    setLegalMoves(moves);
    updateHighlights();
    updatePieceFocus(piece, row, col);
    const coords = moves.map((move) => toNotation(move.row, move.col)).join(', ');
    updateStatus(`${abilityDef.name} готова.`, `Доступные цели: ${coords}.`, false);
  }

  function getAbilityMoves(boardState, row, col, piece, abilityDef) {
    const effect = ABILITY_EFFECTS[abilityDef.id];
    if (!effect) {
      return [];
    }
    const options = effect.generate(boardState, row, col, piece, abilityDef) || [];
    const legal = [];
    for (const option of options) {
      const simulation = cloneBoard(boardState);
      const simPiece = simulation[row][col];
      if (!simPiece) {
        continue;
      }
      const result = effect.apply(simulation, row, col, simPiece, option, abilityDef);
      if (!result) {
        continue;
      }
      const commander = findCommander(simulation, piece.owner);
      if (!commander) {
        continue;
      }
      if (isSquareUnderAttack(simulation, commander.row, commander.col, otherPlayer(piece.owner))) {
        continue;
      }
      legal.push({
        ...option,
        abilityId: abilityDef.id,
        abilityName: abilityDef.name,
        capture:
          option.capture !== undefined
            ? option.capture
            : Boolean(option.type === 'strike'
                ? boardState[option.row][option.col] && boardState[option.row][option.col].owner !== piece.owner
                : boardState[option.row]?.[option.col] && boardState[option.row][option.col].owner !== piece.owner),
        promotion: option.promotion || null
      });
    }
    return legal;
  }

  function executeMove(fromRow, fromCol, move) {
    const piece = board[fromRow][fromCol];
    if (!piece) {
      return;
    }

    const originalType = piece.type;
    const opponent = otherPlayer(piece.owner);
    const abilityDef = move.abilityId ? getAbilityDefinition(originalType, move.abilityId) : null;
    const effect = abilityDef ? ABILITY_EFFECTS[abilityDef.id] : null;

    let target = board[move.row]?.[move.col] || null;
    let captureOccurred = Boolean(target);
    let promotionType = move.promotion || null;
    let finalRow = move.row;
    let finalCol = move.col;
    let stayedInPlace = false;
    let notationSymbol = null;

    if (abilityDef) {
      if (!effect) {
        return;
      }
      const result = effect.apply(board, fromRow, fromCol, piece, move, abilityDef);
      if (!result) {
        return;
      }
      finalRow = result.finalRow;
      finalCol = result.finalCol;
      promotionType = result.promotion || promotionType;
      captureOccurred = Boolean(result.capture);
      target = result.capturedPiece || null;
      stayedInPlace = Boolean(result.stayPut);
      notationSymbol = result.notationSymbol || null;
      if (captureOccurred && target) {
        capturedPieces[piece.owner].push(target.type);
      }
    } else {
      if (target) {
        capturedPieces[piece.owner].push(target.type);
      }
      board[move.row][move.col] = piece;
      board[fromRow][fromCol] = null;
      piece.moved = true;
      if (move.promotion) {
        promotionType = move.promotion;
        piece.promotedFrom = piece.promotedFrom || piece.type;
        piece.type = promotionType;
      }
    }

    const victoryByCapture = target && target.type === 'commander' && captureOccurred;

    clearAbilityState();
    selectedCell = null;
    setLegalMoves([]);

    const movedPiece = board[finalRow][finalCol] || board[fromRow][fromCol] || piece;
    const distance = stayedInPlace ? 0 : calculateDistance(fromRow, fromCol, finalRow, finalCol);
    let energyGain = distance;
    if (captureOccurred && target) {
      energyGain += CAPTURE_REWARD[target.type] || 0;
    }
    if (abilityDef) {
      movedPiece.energy = Math.max(0, movedPiece.energy - abilityDef.cost);
    }
    movedPiece.energy = Math.min(MAX_ENERGY, movedPiece.energy + energyGain);
    movedPiece.moved = true;

    let notationFrom = toNotation(fromRow, fromCol);
    let notationTo = toNotation(finalRow, finalCol);
    let notation;
    if (abilityDef) {
      if (move.type === 'strike') {
        notation = `${notationFrom} ⚡ ${toNotation(move.row, move.col)}`;
      } else if (move.type === 'swap' || move.type === 'swap-enemy') {
        notation = `${notationFrom} ⇄ ${notationTo}`;
      } else {
        notation = `${notationFrom} ⇢ ${notationTo}`;
      }
      if (notationSymbol) {
        notation += ` ${notationSymbol}`;
      }
    } else {
      notation = `${notationFrom} → ${notationTo}`;
    }

    const moveEntry = {
      player: movedPiece.owner,
      pieceType: originalType,
      notation,
      capture: captureOccurred,
      promotion: promotionType,
      ability: abilityDef ? abilityDef.name : null,
      check: false,
      checkmate: false,
      stalemate: false
    };

    renderBoard();
    updateCaptured();

    if (victoryByCapture) {
      moveEntry.checkmate = true;
      moveHistory.push(moveEntry);
      const action = abilityDef ? `способностью «${abilityDef.name}»` : 'точным манёвром';
      finalizeGame(
        movedPiece.owner,
        `${PIECES[originalType].name} пленил Командора ${PLAYERS[opponent].name}.`,
        `Решающее столкновение завершено, использована ${action}.`
      );
      return;
    }

    const opponentCommander = findCommander(board, opponent);
    const givesCheck = opponentCommander
      ? isSquareUnderAttack(board, opponentCommander.row, opponentCommander.col, movedPiece.owner)
      : false;
    moveEntry.check = givesCheck;
    moveHistory.push(moveEntry);

    currentPlayer = opponent;
    updateBoardOrientation();

    const opponentHasMoves = hasLegalMoves(board, opponent);
    const opponentInCheck = isCommanderInCheck(board, opponent);

    if (!opponentHasMoves) {
      if (opponentInCheck) {
        moveEntry.checkmate = true;
        finalizeGame(
          movedPiece.owner,
          `${PLAYERS[movedPiece.owner].name} ставит мат.`,
          `${PLAYERS[opponent].name} не может спасти Командора.`
        );
      } else {
        moveEntry.stalemate = true;
        finalizeGame(null, 'Перемирие — пат.', 'Оба ордена выдыхают и объявляют ничью.');
      }
      renderMoveLog();
      return;
    }

    renderMoveLog();
    updatePieceFocus(null);
    updateTurnPanel();

    const actorName = PLAYERS[movedPiece.owner].name;
    const opponentName = PLAYERS[opponent].name;
    let primary;
    if (abilityDef) {
      primary = `${actorName} задействует «${abilityDef.name}» у ${PIECES[originalType].name}.`;
      if (captureOccurred && target) {
        primary += ` Цель: ${PIECES[target.type].name}.`;
      }
      if (promotionType) {
        primary += ` Повышение до ${PIECES[movedPiece.type].name}.`;
      }
    } else {
      primary = `${actorName} перемещает ${PIECES[originalType].name} на ${notationTo}.`;
      if (captureOccurred && target) {
        primary += ` Взято: ${PIECES[target.type].name}.`;
      }
      if (promotionType) {
        primary += ` Повышение до ${PIECES[movedPiece.type].name}.`;
      }
    }

    let secondary;
    if (givesCheck) {
      secondary = `${opponentName}, ваш Командор под прицелом!`;
    } else if (opponentInCheck) {
      secondary = `${opponentName}, ваш Командор всё ещё под угрозой.`;
    } else {
      secondary = `${opponentName}, ваш ход.`;
    }

    updateStatus(primary, secondary);
    updateHighlights();
    updateCommanderAlerts();
  }

  function finalizeGame(winningPlayer, title, subtitle) {
    gameState = 'ended';
    winner = winningPlayer;
    selectedCell = null;
    setLegalMoves([]);
    updateHighlights();
    updateCommanderAlerts();
    updateTurnPanel();

    const heading = winningPlayer ? `${PLAYERS[winningPlayer].name} побеждает!` : title;
    const detail = subtitle;

    endgameTitleEl.textContent = heading;
    endgameSubtitleEl.textContent = detail;
    endgameEl.hidden = false;
    updateStatus(heading, detail);
    renderMoveLog();
    updateBoardOrientation();
  }

  function setLegalMoves(moves) {
    legalMoves = moves;
    legalMoveMap = new Map();
    moves.forEach((move) => {
      legalMoveMap.set(`${move.row},${move.col}`, move);
    });
  }

  function renderBoard() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = cellElements[row][col];
        const piece = board[row][col];
        cell.innerHTML = '';
        cell.classList.remove('cell--alert');
        if (!piece) {
          cell.setAttribute('aria-label', `Пустая клетка ${toNotation(row, col)}`);
          continue;
        }
        const def = PIECES[piece.type];
        const wrapper = document.createElement('div');
        wrapper.className = `piece piece--${piece.owner} piece--${piece.type}`;
        const glyph = document.createElement('span');
        glyph.className = 'piece__glyph';
        glyph.setAttribute('aria-hidden', 'true');
        glyph.textContent = def.glyph[piece.owner];
        const sr = document.createElement('span');
        sr.className = 'sr-only';
        sr.textContent = `${def.name} игрока ${PLAYERS[piece.owner].name}`;
        wrapper.appendChild(glyph);
        wrapper.appendChild(sr);
        if (piece.energy > 0) {
          const energyBadge = document.createElement('span');
          energyBadge.className = 'piece__energy';
          energyBadge.textContent = piece.energy;
          energyBadge.setAttribute('aria-hidden', 'true');
          wrapper.appendChild(energyBadge);
        }
        cell.appendChild(wrapper);
        let label = `${def.name} ${PLAYERS[piece.owner].name} на клетке ${toNotation(row, col)}`;
        if (piece.energy > 0) {
          label += `. Сила: ${piece.energy}.`;
        }
        cell.setAttribute('aria-label', label);
      }
    }
    updateCommanderAlerts();
  }

  function updateHighlights() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = cellElements[row][col];
        cell.classList.remove('cell--selected', 'cell--move', 'cell--capture', 'cell--ability');
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
          cell.classList.add('cell--selected');
        }
        const key = `${row},${col}`;
        if (legalMoveMap.has(key)) {
          const move = legalMoveMap.get(key);
          if (move.abilityId) {
            cell.classList.add('cell--ability');
          }
          cell.classList.add(move.capture ? 'cell--capture' : 'cell--move');
        }
      }
    }
  }

  function updateCommanderAlerts() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        cellElements[row][col].classList.remove('cell--alert');
      }
    }
    const players = ['dawn', 'dusk'];
    players.forEach((player) => {
      const commander = findCommander(board, player);
      if (!commander) {
        return;
      }
      const cell = cellElements[commander.row][commander.col];
      if (isCommanderInCheck(board, player)) {
        cell.classList.add('cell--alert');
      }
    });
  }

  function updateBoardOrientation() {
    if (!boardFrame) {
      return;
    }
    const tabletopMode = window.matchMedia('(max-width: 720px)').matches;
    let facingPlayer = currentPlayer;
    if (gameState === 'ended') {
      facingPlayer = winner !== null ? winner : 'dawn';
    }
    boardFrame.classList.toggle('board-frame--flipped', tabletopMode && facingPlayer === 'dusk');
  }

  function updateStatus(primary, secondary = '', announce = true) {
    statusPrimaryEl.textContent = primary;
    statusSecondaryEl.textContent = secondary;
    if (announce) {
      const combined = `${primary} ${secondary}`.trim();
      liveRegion.textContent = combined;
      window.setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  function updateTurnPanel() {
    const players = ['dawn', 'dusk'];
    players.forEach((player) => {
      const card = playerCards[player];
      const badge = turnBadges[player];
      card.classList.remove('player-card--active', 'player-card--alert');
      if (gameState === 'ended') {
        if (winner === player) {
          badge.textContent = 'Победа';
        } else if (winner === null) {
          badge.textContent = 'Перемирие';
        } else {
          badge.textContent = 'Поражение';
        }
        return;
      }
      if (currentPlayer === player) {
        badge.textContent = 'Ход';
        card.classList.add('player-card--active');
      } else {
        badge.textContent = 'Ожидает';
      }
      if (isCommanderInCheck(board, player)) {
        card.classList.add('player-card--alert');
        if (currentPlayer === player) {
          badge.textContent = 'Под ударом';
        }
      }
    });
  }

  function updateCaptured() {
    const order = ['commander', 'sentinel', 'strider', 'lancer', 'squire'];
    ['dawn', 'dusk'].forEach((player) => {
      const container = capturedEls[player];
      container.innerHTML = '';
      const counts = capturedPieces[player].reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const entries = order.filter((type) => counts[type]);
      if (entries.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'captured__empty';
        empty.textContent = 'Пока без трофеев';
        container.appendChild(empty);
        return;
      }
      entries.forEach((type) => {
        const span = document.createElement('span');
        const glyph = document.createElement('span');
        glyph.setAttribute('aria-hidden', 'true');
        glyph.textContent = PIECES[type].glyph[otherPlayer(player)];
        const count = document.createElement('strong');
        count.textContent = `${counts[type]}×`;
        const label = document.createTextNode(` ${PIECES[type].name}`);
        span.append(glyph, count, label);
        container.appendChild(span);
      });
    });
  }

  function renderMoveLog() {
    moveLogEl.innerHTML = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
      const entry = document.createElement('li');
      entry.className = 'move-log__entry';
      const turnNumber = Math.floor(i / 2) + 1;
      const turnLabel = document.createElement('span');
      turnLabel.className = 'move-log__turn';
      turnLabel.textContent = `${turnNumber}`;
      const row = document.createElement('div');
      row.className = 'move-log__row';
      row.appendChild(createMoveLogCell(moveHistory[i]));
      row.appendChild(createMoveLogCell(moveHistory[i + 1]));
      entry.append(turnLabel, row);
      moveLogEl.appendChild(entry);
    }
  }

  function createMoveLogCell(entry) {
    const cell = document.createElement('div');
    cell.className = 'move-log__cell';
    if (!entry) {
      cell.classList.add('move-log__cell--empty');
      cell.textContent = '…';
      return cell;
    }
    const playerLabel = document.createElement('span');
    playerLabel.className = 'move-log__player';
    playerLabel.textContent = PLAYERS[entry.player].name;
    const notation = document.createElement('span');
    notation.className = 'move-log__notation';
    notation.textContent = `${PIECES[entry.pieceType].glyph[entry.player]} ${entry.notation}`;
    if (entry.ability) {
      notation.textContent += ' ✦';
    }
    const detail = document.createElement('p');
    detail.className = 'move-log__detail';
    const flags = [];
    if (entry.ability) {
      flags.push(`приём: ${entry.ability}`);
    }
    if (entry.capture) {
      flags.push('взято');
    }
    if (entry.promotion) {
      flags.push(`повышение → ${PIECES[entry.promotion].name}`);
    }
    if (entry.checkmate) {
      flags.push('мат');
    } else if (entry.check) {
      flags.push('шах');
    }
    if (entry.stalemate) {
      flags.push('пат');
    }
    detail.textContent = flags.length ? flags.join(' · ') : 'манёвр';
    cell.append(playerLabel, notation, detail);
    return cell;
  }

  function updatePieceFocus(piece, row, col) {
    focusEls.traits.innerHTML = '';
    focusEls.stats.innerHTML = '';
    focusEls.abilities.innerHTML = '';
    focusEls.energy.textContent = '';
    if (!piece) {
      focusEls.card.classList.add('focus-card--empty');
      focusEls.glyph.textContent = '☆';
      focusEls.name.textContent = 'Выберите фигуру, чтобы узнать её сильные стороны';
      focusEls.role.textContent = '';
      focusEls.summary.textContent = '';
      focusEls.movement.textContent = '';
      focusEls.position.textContent = '';
      focusEls.status.textContent = '';
      focusEls.promotion.textContent = '';
      const abilityPlaceholder = document.createElement('p');
      abilityPlaceholder.className = 'focus-card__abilities-placeholder';
      abilityPlaceholder.textContent = 'Способности появятся после выбора фигуры.';
      focusEls.abilities.appendChild(abilityPlaceholder);
      const placeholder = document.createElement('li');
      placeholder.className = 'tag-list__placeholder';
      placeholder.textContent = 'Тактическое досье появится здесь';
      focusEls.traits.appendChild(placeholder);
      return;
    }

    const def = PIECES[piece.type];
    focusEls.card.classList.remove('focus-card--empty');
    focusEls.glyph.textContent = def.glyph[piece.owner];
    focusEls.name.textContent = `${def.name} — ${PLAYERS[piece.owner].name}`;
    focusEls.role.textContent = def.role;
    focusEls.summary.textContent = def.description;
    focusEls.movement.textContent = def.movement;
    focusEls.position.textContent = `Позиция: ${toNotation(row, col)}`;
    focusEls.status.textContent = piece.moved ? 'Уже участвовал в манёврах.' : 'Пока не двигался.';
    focusEls.energy.textContent = `Сила: ${piece.energy}`;
    if (piece.promotedFrom && piece.promotedFrom !== piece.type) {
      focusEls.promotion.textContent = `Повышен из ${PIECES[piece.promotedFrom].name}.`;
    } else {
      focusEls.promotion.textContent = '';
    }

    def.traits.forEach((trait) => {
      const li = document.createElement('li');
      li.textContent = trait;
      focusEls.traits.appendChild(li);
    });

    Object.entries(def.stats).forEach(([key, value]) => {
      const dt = document.createElement('dt');
      dt.textContent = key;
      const dd = document.createElement('dd');
      dd.textContent = value;
      focusEls.stats.append(dt, dd);
    });

    if (def.abilities && def.abilities.length > 0) {
      def.abilities.forEach((ability) => {
        const item = document.createElement('div');
        item.className = 'ability';
        const header = document.createElement('div');
        header.className = 'ability__header';
        const title = document.createElement('h4');
        title.className = 'ability__name';
        title.textContent = ability.name;
        const cost = document.createElement('span');
        cost.className = 'ability__cost';
        cost.textContent = `${ability.cost} ⚡`;
        header.append(title, cost);
        const description = document.createElement('p');
        description.className = 'ability__description';
        description.textContent = ability.description;
        item.append(header, description);
        if (piece.owner === currentPlayer && gameState === 'playing') {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'ability__button';
          button.textContent = piece.energy >= ability.cost ? 'Активировать' : 'Недостаточно силы';
          button.disabled = piece.energy < ability.cost;
          if (
            activeAbility &&
            abilitySource &&
            abilitySource.row === row &&
            abilitySource.col === col &&
            activeAbility.id === ability.id
          ) {
            button.classList.add('ability__button--active');
            button.textContent = 'Выбор цели';
          }
          button.addEventListener('click', () => handleAbilityActivation(row, col, ability));
          item.appendChild(button);
        }
        focusEls.abilities.appendChild(item);
      });
    } else {
      const abilityPlaceholder = document.createElement('p');
      abilityPlaceholder.className = 'focus-card__abilities-placeholder';
      abilityPlaceholder.textContent = 'Особых приёмов не заявлено.';
      focusEls.abilities.appendChild(abilityPlaceholder);
    }
  }

  function populateCodex() {
    codexEl.innerHTML = '';
    Object.entries(PIECES).forEach(([type, def]) => {
      const card = document.createElement('article');
      card.className = `codex-card codex-card--${type}`;
      const header = document.createElement('div');
      header.className = 'codex-card__header';
      const glyph = document.createElement('span');
      glyph.className = 'codex-card__glyph';
      glyph.textContent = def.glyph.dawn;
      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'codex-card__title';
      title.textContent = def.name;
      const role = document.createElement('p');
      role.className = 'codex-card__role';
      role.textContent = def.role;
      titleWrap.append(title, role);
      header.append(glyph, titleWrap);
      const desc = document.createElement('p');
      desc.className = 'codex-card__text';
      desc.textContent = def.description;
      const move = document.createElement('p');
      move.className = 'codex-card__text';
      move.textContent = def.movement;
      const traits = document.createElement('ul');
      traits.className = 'tag-list';
      def.traits.forEach((trait) => {
        const li = document.createElement('li');
        li.textContent = trait;
        traits.appendChild(li);
      });
      const stats = document.createElement('dl');
      stats.className = 'stat-list';
      Object.entries(def.stats).forEach(([key, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = key;
        const dd = document.createElement('dd');
        dd.textContent = value;
        stats.append(dt, dd);
      });
      card.append(header, desc, move, traits, stats);
      if (def.abilities && def.abilities.length > 0) {
        const abilityBlock = document.createElement('div');
        abilityBlock.className = 'codex-card__abilities';
        const abilityTitle = document.createElement('h4');
        abilityTitle.textContent = 'Способности';
        abilityBlock.appendChild(abilityTitle);
        def.abilities.forEach((ability) => {
          const abilityRow = document.createElement('div');
          abilityRow.className = 'codex-card__ability';
          const abilityName = document.createElement('strong');
          abilityName.textContent = `${ability.name} — ${ability.cost}⚡`;
          const abilityDesc = document.createElement('p');
          abilityDesc.textContent = ability.description;
          abilityRow.append(abilityName, abilityDesc);
          abilityBlock.appendChild(abilityRow);
        });
        card.appendChild(abilityBlock);
      }
      codexEl.appendChild(card);
    });
  }

  function toNotation(row, col) {
    const letter = COLUMN_LETTERS[col] || '?';
    const number = ROW_NUMBERS[row] || row + 1;
    return `${letter}${number}`;
  }

  function otherPlayer(player) {
    return player === 'dawn' ? 'dusk' : 'dawn';
  }

  function getAbilityDefinition(type, abilityId) {
    const def = PIECES[type];
    if (!def || !def.abilities) {
      return null;
    }
    return def.abilities.find((ability) => ability.id === abilityId) || null;
  }

  function createInitialBoard() {
    const backline = [
      'sentinel',
      'lancer',
      'strider',
      'sentinel',
      'commander',
      'strider',
      'sentinel',
      'strider',
      'lancer',
      'sentinel'
    ];
    const boardState = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const pieceType = backline[col % backline.length];
      boardState[0][col] = createPiece(pieceType, 'dusk');
      boardState[1][col] = createPiece('squire', 'dusk');
      boardState[BOARD_SIZE - 2][col] = createPiece('squire', 'dawn');
      boardState[BOARD_SIZE - 1][col] = createPiece(pieceType, 'dawn');
    }
    return boardState;
  }

  function createPiece(type, owner) {
    return { type, owner, moved: false, energy: 0 };
  }

  function cloneBoard(boardState) {
    return boardState.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
  }

  function applyMoveOnBoard(boardState, fromRow, fromCol, toRow, toCol, options = {}) {
    const clone = cloneBoard(boardState);
    const piece = clone[fromRow][fromCol];
    clone[fromRow][fromCol] = null;
    if (!piece) {
      return clone;
    }
    const movedPiece = { ...piece, moved: true };
    if (options.promotion) {
      movedPiece.promotedFrom = movedPiece.promotedFrom || movedPiece.type;
      movedPiece.type = options.promotion;
    }
    clone[toRow][toCol] = movedPiece;
    return clone;
  }

  function getLegalMoves(row, col) {
    return getLegalMovesForBoard(board, row, col, currentPlayer);
  }

  function getLegalMovesForBoard(boardState, row, col, player) {
    const piece = boardState[row][col];
    if (!piece || piece.owner !== player) {
      return [];
    }
    const pseudoMoves = generatePseudoMoves(boardState, row, col, piece, 'move');
    const legal = [];
    for (const move of pseudoMoves) {
      const target = boardState[move.row][move.col];
      if (target && target.owner === player) {
        continue;
      }
      const promotionType = piece.type === 'squire' && move.row === promotionRowFor(player) ? 'strider' : null;
      const boardAfter = applyMoveOnBoard(boardState, row, col, move.row, move.col, { promotion: promotionType });
      const commander = findCommander(boardAfter, player);
      if (!commander) {
        continue;
      }
      if (isSquareUnderAttack(boardAfter, commander.row, commander.col, otherPlayer(player))) {
        continue;
      }
      legal.push({
        row: move.row,
        col: move.col,
        capture: Boolean(target),
        promotion: promotionType
      });
    }
    return legal;
  }

  function calculateDistance(fromRow, fromCol, toRow, toCol) {
    const dr = Math.abs(fromRow - toRow);
    const dc = Math.abs(fromCol - toCol);
    if ((dr === 2 && dc === 1) || (dr === 1 && dc === 2)) {
      return 3;
    }
    if (dr === dc) {
      return dr;
    }
    if (dr === 0 || dc === 0) {
      return dr + dc;
    }
    return dr + dc;
  }

  function hasLegalMoves(boardState, player) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const piece = boardState[row][col];
        if (piece && piece.owner === player) {
          const moves = getLegalMovesForBoard(boardState, row, col, player);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function promotionRowFor(player) {
    return player === 'dawn' ? 0 : BOARD_SIZE - 1;
  }

  function isCommanderInCheck(boardState, player) {
    const commander = findCommander(boardState, player);
    if (!commander) {
      return false;
    }
    return isSquareUnderAttack(boardState, commander.row, commander.col, otherPlayer(player));
  }

  function findCommander(boardState, player) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const piece = boardState[row][col];
        if (piece && piece.owner === player && piece.type === 'commander') {
          return { row, col };
        }
      }
    }
    return null;
  }

  function isSquareUnderAttack(boardState, targetRow, targetCol, attacker) {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const piece = boardState[row][col];
        if (!piece || piece.owner !== attacker) {
          continue;
        }
        const threats = generatePseudoMoves(boardState, row, col, piece, 'threat');
        if (threats.some((move) => move.row === targetRow && move.col === targetCol)) {
          return true;
        }
      }
    }
    return false;
  }

  function generatePseudoMoves(boardState, row, col, piece, purpose) {
    const moves = [];
    const owner = piece.owner;
    const isThreat = purpose === 'threat';

    const pushSliding = (directions) => {
      directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        while (isInside(r, c)) {
          const occupant = boardState[r][c];
          if (!occupant) {
            moves.push({ row: r, col: c });
          } else {
            if (occupant.owner !== owner) {
              moves.push({ row: r, col: c });
            }
            break;
          }
          r += dr;
          c += dc;
        }
      });
    };

    switch (piece.type) {
      case 'commander': {
        for (let dr = -1; dr <= 1; dr += 1) {
          for (let dc = -1; dc <= 1; dc += 1) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (!isInside(r, c)) continue;
            const occupant = boardState[r][c];
            if (occupant && occupant.owner === owner) continue;
            moves.push({ row: r, col: c });
          }
        }
        break;
      }
      case 'sentinel': {
        pushSliding([
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]);
        break;
      }
      case 'strider': {
        pushSliding([
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1]
        ]);
        break;
      }
      case 'lancer': {
        const jumps = [
          [2, 1], [2, -1],
          [-2, 1], [-2, -1],
          [1, 2], [1, -2],
          [-1, 2], [-1, -2]
        ];
        jumps.forEach(([dr, dc]) => {
          const r = row + dr;
          const c = col + dc;
          if (!isInside(r, c)) return;
          const occupant = boardState[r][c];
          if (occupant && occupant.owner === owner) return;
          moves.push({ row: r, col: c });
        });
        break;
      }
      case 'squire': {
        const dir = directionByPlayer[owner];
        const forwardRow = row + dir;
        if (purpose === 'move') {
          if (isInside(forwardRow, col) && !boardState[forwardRow][col]) {
            moves.push({ row: forwardRow, col });
            const doubleRow = forwardRow + dir;
            if (!piece.moved && isInside(doubleRow, col) && !boardState[doubleRow][col]) {
              moves.push({ row: doubleRow, col });
            }
          }
          [-1, 1].forEach((dc) => {
            const r = row + dir;
            const c = col + dc;
            if (!isInside(r, c)) return;
            const occupant = boardState[r][c];
            if (occupant && occupant.owner !== owner) {
              moves.push({ row: r, col: c });
            }
          });
        } else {
          [-1, 1].forEach((dc) => {
            const r = row + dir;
            const c = col + dc;
            if (isInside(r, c)) {
              moves.push({ row: r, col: c });
            }
          });
        }
        break;
      }
      default:
        break;
    }

    if (isThreat && piece.type !== 'squire') {
      // For threats we should not include squares beyond allied pieces; already handled.
      return moves;
    }

    return moves;
  }

  function isInside(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  function generateRadiantStepOptions(boardState, row, col, piece) {
    const moves = [];
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) {
          continue;
        }
        for (let step = 1; step <= 2; step += 1) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (!isInside(r, c)) {
            break;
          }
          if (step === 2) {
            const midRow = row + dr;
            const midCol = col + dc;
            if (boardState[midRow][midCol]) {
              break;
            }
          }
          const occupant = boardState[r][c];
          if (occupant && occupant.owner === piece.owner) {
            break;
          }
          moves.push({ row: r, col: c, type: 'move', capture: Boolean(occupant && occupant.owner !== piece.owner) });
          if (occupant) {
            break;
          }
        }
      }
    }
    return moves;
  }

  function generateAstralSwapOptions(boardState, row, col, piece) {
    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r += 1) {
      for (let c = 0; c < BOARD_SIZE; c += 1) {
        if (r === row && c === col) {
          continue;
        }
        const occupant = boardState[r][c];
        if (!occupant || occupant.owner !== piece.owner) {
          continue;
        }
        const distance = Math.abs(row - r) + Math.abs(col - c);
        if (distance > 3) {
          continue;
        }
        moves.push({ row: r, col: c, type: 'swap', capture: false });
      }
    }
    return moves;
  }

  function generateIronDiagonalOptions(boardState, row, col, piece) {
    const moves = [];
    const directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ];
    directions.forEach(([dr, dc]) => {
      for (let step = 1; step <= 2; step += 1) {
        const r = row + dr * step;
        const c = col + dc * step;
        if (!isInside(r, c)) {
          break;
        }
        if (step === 2) {
          const midRow = row + dr;
          const midCol = col + dc;
          if (boardState[midRow][midCol]) {
            break;
          }
        }
        const occupant = boardState[r][c];
        if (occupant && occupant.owner === piece.owner) {
          break;
        }
        moves.push({ row: r, col: c, type: 'move', capture: Boolean(occupant && occupant.owner !== piece.owner) });
        if (occupant) {
          break;
        }
      }
    });
    return moves;
  }

  function generateSiegeBoltOptions(boardState, row, col, piece) {
    const moves = [];
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    directions.forEach(([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;
      let step = 1;
      while (isInside(r, c) && step <= 3) {
        const occupant = boardState[r][c];
        if (occupant) {
          if (occupant.owner !== piece.owner) {
            moves.push({ row: r, col: c, type: 'strike', capture: true });
          }
          break;
        }
        r += dr;
        c += dc;
        step += 1;
      }
    });
    return moves;
  }

  function generateHorizonDriftOptions(boardState, row, col, piece) {
    const moves = [];
    const directions = [
      [0, 1],
      [0, -1]
    ];
    directions.forEach(([dr, dc]) => {
      for (let step = 1; step <= 2; step += 1) {
        const r = row + dr * step;
        const c = col + dc * step;
        if (!isInside(r, c)) {
          break;
        }
        if (step === 2) {
          const midRow = row + dr;
          const midCol = col + dc;
          if (boardState[midRow][midCol]) {
            break;
          }
        }
        const occupant = boardState[r][c];
        if (occupant && occupant.owner === piece.owner) {
          break;
        }
        moves.push({ row: r, col: c, type: 'move', capture: Boolean(occupant && occupant.owner !== piece.owner) });
        if (occupant) {
          break;
        }
      }
    });
    return moves;
  }

  function generatePrismGateOptions(boardState, row, col) {
    const moves = [];
    const directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1]
    ];
    directions.forEach(([dr, dc]) => {
      const r = row + dr * 3;
      const c = col + dc * 3;
      if (!isInside(r, c)) {
        return;
      }
      if (!boardState[r][c]) {
        moves.push({ row: r, col: c, type: 'move', capture: false });
      }
    });
    return moves;
  }

  function generateMeteorDashOptions(boardState, row, col, piece) {
    const moves = [];
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];
    directions.forEach(([dr, dc]) => {
      let r = row + dr;
      let c = col + dc;
      let step = 1;
      while (isInside(r, c) && step <= 3) {
        const occupant = boardState[r][c];
        if (occupant) {
          if (occupant.owner !== piece.owner) {
            moves.push({ row: r, col: c, type: 'move', capture: true });
          }
          break;
        }
        moves.push({ row: r, col: c, type: 'move', capture: false });
        r += dr;
        c += dc;
        step += 1;
      }
    });
    return moves;
  }

  function generateStormReversalOptions(boardState, row, col, piece) {
    const moves = [];
    const jumps = [
      [2, 1], [2, -1],
      [-2, 1], [-2, -1],
      [1, 2], [1, -2],
      [-1, 2], [-1, -2]
    ];
    jumps.forEach(([dr, dc]) => {
      const r = row + dr;
      const c = col + dc;
      if (!isInside(r, c)) {
        return;
      }
      const occupant = boardState[r][c];
      if (occupant && occupant.owner !== piece.owner) {
        moves.push({ row: r, col: c, type: 'swap-enemy', capture: false });
      }
    });
    return moves;
  }

  function generateLineSurgeOptions(boardState, row, col, piece) {
    const moves = [];
    const dir = directionByPlayer[piece.owner];
    const firstRow = row + dir;
    const secondRow = row + dir * 2;
    if (
      isInside(firstRow, col) &&
      !boardState[firstRow][col] &&
      isInside(secondRow, col) &&
      !boardState[secondRow][col]
    ) {
      const promotion = secondRow === promotionRowFor(piece.owner) ? 'strider' : null;
      moves.push({ row: secondRow, col, type: 'move', capture: false, promotion });
    }
    return moves;
  }

  function generateHookStrikeOptions(boardState, row, col, piece) {
    const moves = [];
    const dir = directionByPlayer[piece.owner];
    const targetRow = row + dir;
    if (!isInside(targetRow, col)) {
      return moves;
    }
    const occupant = boardState[targetRow][col];
    if (occupant && occupant.owner !== piece.owner) {
      const promotion = targetRow === promotionRowFor(piece.owner) ? 'strider' : null;
      moves.push({ row: targetRow, col, type: 'move', capture: true, promotion });
    }
    return moves;
  }

  function applyStandardAbilityMove(boardState, fromRow, fromCol, piece, option) {
    const target = boardState[option.row][option.col];
    if (target && target.owner === piece.owner) {
      return null;
    }
    boardState[option.row][option.col] = piece;
    boardState[fromRow][fromCol] = null;
    piece.moved = true;
    if (option.promotion) {
      piece.promotedFrom = piece.promotedFrom || piece.type;
      piece.type = option.promotion;
    }
    const captured = target && target.owner !== piece.owner ? target : null;
    return {
      finalRow: option.row,
      finalCol: option.col,
      capture: Boolean(captured),
      capturedPiece: captured,
      promotion: option.promotion || null
    };
  }

  function applyAstralSwap(boardState, fromRow, fromCol, piece, option) {
    const ally = boardState[option.row][option.col];
    if (!ally || ally.owner !== piece.owner) {
      return null;
    }
    boardState[option.row][option.col] = piece;
    boardState[fromRow][fromCol] = ally;
    piece.moved = true;
    ally.moved = true;
    return {
      finalRow: option.row,
      finalCol: option.col,
      capture: false,
      capturedPiece: null
    };
  }

  function applySiegeBolt(boardState, fromRow, fromCol, piece, option) {
    const enemy = boardState[option.row][option.col];
    if (!enemy || enemy.owner === piece.owner) {
      return null;
    }
    boardState[option.row][option.col] = null;
    piece.moved = true;
    return {
      finalRow: fromRow,
      finalCol: fromCol,
      capture: true,
      capturedPiece: enemy,
      stayPut: true,
      notationSymbol: '☄'
    };
  }

  function applyStormReversal(boardState, fromRow, fromCol, piece, option) {
    const enemy = boardState[option.row][option.col];
    if (!enemy || enemy.owner === piece.owner) {
      return null;
    }
    boardState[option.row][option.col] = piece;
    boardState[fromRow][fromCol] = enemy;
    piece.moved = true;
    enemy.moved = true;
    return {
      finalRow: option.row,
      finalCol: option.col,
      capture: false,
      capturedPiece: null,
      notationSymbol: '↺'
    };
  }

  whenReady(initialize);

  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }
})();
