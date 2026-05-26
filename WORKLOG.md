# WORKLOG — карта проекта и оперативный навигатор

## Назначение
Этот файл используется как **быстрый индекс проекта**: где что лежит, в каком файле искать баги, где править анимации, сетевой код, логику хода и историю.

## 1) Верхний уровень проекта
- `index.html` — разметка приложения, контейнеры доски/оверлеев, панели управления, модалки и элементы истории.
- `style.css` — общий UI/CSS, стили доски, клеток, эффектов, состояния выбора.
- `script.js` — основной движок клиента (логика фигур, ходы, рендер, анимации, multiplayer, история ходов).
- `server.js` — websocket-сервер синхронизации онлайн-матча.
- `package.json` — скрипты запуска и зависимости.
- `audio/intro.wav` — базовый звук.
- `pieces/skins/*` — скины, ассеты и skin-специфичные анимации.

## 2) Где искать ключевые подсистемы в `script.js`
- **Инициализация и модели**: стартовые раскладки, токены, определения фигур, базовые константы.
- **UI/DOM**: сбор `elements`, обработчики кнопок/клеток, переключение экранов.
- **Рендер доски**: `renderBoard()`, подсветка выбора, кэш ориентаций, применение текстур фигур.
- **Выбор/ходы**:
  - `handleCellInteraction(x, y)` — входная точка клика по клетке.
  - `selectCell`, `clearSelection`, `executeMove`, `rotateSelected`.
  - `endTurn()` — завершение хода: звук, выстрел, история, смена игрока.
- **Лазер и взаимодействия**: `fireLaser`, `simulateLaserTrace`, `resolveInteraction` (+ mirror/totem/shield).
- **Эффекты и анимации**:
  - `applyPieceRotation` — анимация поворота фигуры.
  - `highlightLaserPath`, `handleLaserImpact`, `spawnEffect*` — лазерный луч и hit-эффекты.
- **Сеть/онлайн**:
  - `serialiseGameState`, `applyRemoteState`, `broadcastGameState`.
  - `createMultiplayerController` — websocket lifecycle.
- **История**:
  - `recordTurnHistory`, `renderMoveHistory`, `deriveRemoteAction`, export/clear.

## 3) Каталог скинов и эффектов
Структура папки `pieces/skins/<SkinName>/`:
- `config.json` — конфиг skin/type (пути, визуальные параметры, звуки, board theme).
- `animations.js` — JS-хуки для skin-специфичных реакций/эффектов.
- `skin.css` — локальные стили скина.
- `Type1/`, `Type2/` — PNG фигур (laser, volhv, mirror, shield, totem + preview где есть).

Общий слой:
- `pieces/skins/common/simple-skin-effects.js` — базовые обработчики эффектов.

## 4) Быстрый маршрут поиска проблем
1. **Баг выбора/хода** → `handleCellInteraction` + `selectCell/executeMove` + `endTurn`.
2. **Повтор/фантом анимаций** → `applyRemoteState` + `highlightLaserPath` + `handleLaserImpact`.
3. **Проблемы поворота** → `applyPieceRotation` + кэш `pieceOrientationCache`.
4. **Некорректная синхронизация онлайн** → `serialiseGameState` / `applyRemoteState` / WebSocket events.
5. **История не совпадает с визуалом** → `recordTurnHistory` + `deriveRemoteAction` + `renderMoveHistory`.

## 5) Принципы производительности (держать в фокусе)
- Минимизировать лишние `renderBoard()` при неизменённом состоянии.
- Не запускать impact-анимации повторно для одного и того же лазерного события.
- Использовать кэш ориентаций/конфигов скинов, не перечитывать одно и то же.
- При сетевой синхронизации отделять «обновление состояния» от «воспроизведения эффектов».

## 6) Последнее обновление
- 2026-05-26: добавлена подробная карта проекта и маршрут отладки; зафиксирован приоритет на предотвращение повторных анимаций при кликах без фактического хода.
