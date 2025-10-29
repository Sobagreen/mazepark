(function () {
  const BOARD_SIZE = 6;
  const COLUMN_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const ROW_NUMBERS = [6, 5, 4, 3, 2, 1];
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
      glyph: { dawn: '♔', dusk: '♚' },
      role: 'Лидер',
      description: 'Центр координации отряда. Командор обеспечивает связь и не может быть потерян.',
      movement: 'Ходит на одну клетку в любом направлении.',
      traits: ['Лидер', 'Тактическая аура'],
      stats: { Манёвр: '★☆☆', Контроль: '★★★★★', Защита: '★★★★' }
    },
    sentinel: {
      name: 'Страж',
      glyph: { dawn: '♖', dusk: '♜' },
      role: 'Линейный контроль',
      description: 'Стражи держат прямые коридоры и отрезают пути отступления.',
      movement: 'Любое количество клеток по горизонтали или вертикали без прыжков.',
      traits: ['Линии давления', 'Гарнизон'],
      stats: { Манёвр: '★★★', Контроль: '★★★★', Сложность: '★★' }
    },
    strider: {
      name: 'Странник',
      glyph: { dawn: '♗', dusk: '♝' },
      role: 'Диагональный манёвр',
      description: 'Странники режут пространство по диагоналям и выстраивают дуги обхода.',
      movement: 'Любое количество клеток по диагонали без прыжков.',
      traits: ['Фланг', 'Позиционный прессинг'],
      stats: { Манёвр: '★★★★', Контроль: '★★★', Сложность: '★★☆' }
    },
    lancer: {
      name: 'Гонец',
      glyph: { dawn: '♘', dusk: '♞' },
      role: 'Манёвр через заслоны',
      description: 'Гонец прыгает дугой, прорывается через заслоны и наносит внезапные удары.',
      movement: 'Прыжок буквой «Г»: две клетки в одном направлении и одна в перпендикулярном.',
      traits: ['Скачок', 'Атака из тыла'],
      stats: { Манёвр: '★★★★★', Контроль: '★★', Сложность: '★★★' }
    },
    squire: {
      name: 'Рекрут',
      glyph: { dawn: '♙', dusk: '♟' },
      role: 'Линия фронта',
      description: 'Рекруты выстраивают фронт. Врага берут по диагонали и могут сделать стартовый рывок.',
      movement: 'На одну клетку вперёд (две при первом ходе). Захватывает по диагонали. На последней линии повышается до Странника.',
      traits: ['Гарнизон', 'Повышение'],
      stats: { Манёвр: '★★', Контроль: '★★', Сложность: '★' }
    }
  };

  const boardEl = document.getElementById('board');
  const statusPrimaryEl = document.getElementById('status-primary');
  const statusSecondaryEl = document.getElementById('status-secondary');
  const moveLogEl = document.getElementById('move-log');
  const codexEl = document.getElementById('codex');
  const newGameButton = document.getElementById('new-game');
  const playAgainButton = document.getElementById('play-again');
  const liveRegion = document.getElementById('live-region');
  const endgameEl = document.getElementById('endgame');
  const endgameTitleEl = document.getElementById('endgame-title');
  const endgameSubtitleEl = document.getElementById('endgame-subtitle');

  const playerCards = {
    dawn: document.querySelector('.player-card[data-player="dawn"]'),
    dusk: document.querySelector('.player-card[data-player="dusk"]')
  };
  const turnBadges = {
    dawn: document.getElementById('turn-dawn'),
    dusk: document.getElementById('turn-dusk')
  };
  const capturedEls = {
    dawn: document.getElementById('captured-dawn'),
    dusk: document.getElementById('captured-dusk')
  };

  const focusEls = {
    card: document.getElementById('piece-focus'),
    glyph: document.getElementById('focus-glyph'),
    name: document.getElementById('focus-name'),
    role: document.getElementById('focus-role'),
    summary: document.getElementById('focus-summary'),
    movement: document.getElementById('focus-movement'),
    position: document.getElementById('focus-position'),
    status: document.getElementById('focus-status'),
    promotion: document.getElementById('focus-promotion'),
    traits: document.getElementById('focus-traits'),
    stats: document.getElementById('focus-stats')
  };

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

  newGameButton.addEventListener('click', startNewGame);
  playAgainButton.addEventListener('click', startNewGame);

  function start() {
    buildBoardSkeleton();
    populateCodex();
    startNewGame();
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
    renderBoard();
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

  function executeMove(fromRow, fromCol, move) {
    const piece = board[fromRow][fromCol];
    if (!piece) {
      return;
    }

    const target = board[move.row][move.col];
    const originalType = piece.type;
    const opponent = otherPlayer(piece.owner);
    const notation = `${toNotation(fromRow, fromCol)} → ${toNotation(move.row, move.col)}`;

    if (target) {
      capturedPieces[piece.owner].push(target.type);
    }

    board[move.row][move.col] = piece;
    board[fromRow][fromCol] = null;
    piece.moved = true;

    let promotionType = null;
    if (move.promotion) {
      promotionType = move.promotion;
      piece.promotedFrom = piece.promotedFrom || piece.type;
      piece.type = promotionType;
    }

    const moveEntry = {
      player: piece.owner,
      pieceType: originalType,
      notation,
      capture: Boolean(target),
      promotion: promotionType,
      check: false,
      checkmate: false,
      stalemate: false
    };

    const victoryByCapture = target && target.type === 'commander';

    selectedCell = null;
    setLegalMoves([]);
    renderBoard();
    updateCaptured();

    if (victoryByCapture) {
      moveEntry.checkmate = true;
      moveHistory.push(moveEntry);
      finalizeGame(piece.owner, `${PIECES[originalType].name} пленил Командора ${PLAYERS[opponent].name}.`, 'Решающее столкновение завершило поединок.');
      return;
    }

    const opponentCommander = findCommander(board, opponent);
    const givesCheck = opponentCommander ? isSquareUnderAttack(board, opponentCommander.row, opponentCommander.col, piece.owner) : false;
    moveEntry.check = givesCheck;
    moveHistory.push(moveEntry);

    currentPlayer = opponent;

    const opponentHasMoves = hasLegalMoves(board, opponent);
    const opponentInCheck = isCommanderInCheck(board, opponent);

    if (!opponentHasMoves) {
      if (opponentInCheck) {
        moveEntry.checkmate = true;
        finalizeGame(piece.owner, `${PLAYERS[piece.owner].name} ставит мат.`, `${PLAYERS[opponent].name} не может спасти Командора.`);
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

    const actorName = PLAYERS[piece.owner].name;
    const opponentName = PLAYERS[opponent].name;
    let primary = `${actorName} перемещает ${PIECES[originalType].name} на ${toNotation(move.row, move.col)}.`;
    if (target) {
      primary += ` Взято: ${PIECES[target.type].name}.`;
    }
    if (promotionType) {
      primary += ` Повышение до ${PIECES[piece.type].name}.`;
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
        cell.appendChild(wrapper);
        cell.setAttribute('aria-label', `${def.name} ${PLAYERS[piece.owner].name} на клетке ${toNotation(row, col)}`);
      }
    }
    updateCommanderAlerts();
  }

  function updateHighlights() {
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = cellElements[row][col];
        cell.classList.remove('cell--selected', 'cell--move', 'cell--capture');
        if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
          cell.classList.add('cell--selected');
        }
        const key = `${row},${col}`;
        if (legalMoveMap.has(key)) {
          const move = legalMoveMap.get(key);
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
    const detail = document.createElement('p');
    detail.className = 'move-log__detail';
    const flags = [];
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

  function createInitialBoard() {
    const backline = ['sentinel', 'lancer', 'commander', 'strider', 'lancer', 'sentinel'];
    const boardState = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      boardState[0][col] = createPiece(backline[col], 'dusk');
      boardState[1][col] = createPiece('squire', 'dusk');
      boardState[BOARD_SIZE - 2][col] = createPiece('squire', 'dawn');
      boardState[BOARD_SIZE - 1][col] = createPiece(backline[col], 'dawn');
    }
    return boardState;
  }

  function createPiece(type, owner) {
    return { type, owner, moved: false };
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

  start();
})();
