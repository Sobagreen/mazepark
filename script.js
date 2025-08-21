const gridSize = 5;
const cellSize = 60;
const board = document.getElementById('board');
const sequenceDiv = document.getElementById('sequence');
const statusDiv = document.getElementById('status');
let path = [];
let playerSequence = [];
let playerPos = {x:0,y:0};

// build board
for(let y=0;y<gridSize;y){
  for(let x=0;x<gridSize;x){
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.x = x;
    cell.dataset.y = y;
    if(x===0 && y===0) cell.classList.add('start');
    if(x===gridSize-1 && y===gridSize-1) cell.classList.add('finish');
    board.appendChild(cell);
  }
}

const player = document.createElement('div');
player.id = 'player';
board.appendChild(player);

function getCell(x,y){
  return board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function placePlayer(){
  player.style.left = playerPos.x*cellSize  'px';
  player.style.top = playerPos.y*cellSize  'px';
}

function generatePath(){
  const result = [];
  let x=0,y=0;
  const obstacles = ['jump','slide','punch','dodge'];
  while(x < gridSize-1 || y < gridSize-1){
    const options = [];
    if(x < gridSize-1) options.push('right');
    if(y < gridSize-1) options.push('down');
    const move = options[Math.floor(Math.random()*options.length)];
    result.push(move);
    if(move==='right') x; else y;
    if(Math.random()<0.3){
      result.push(obstacles[Math.floor(Math.random()*obstacles.length)]);
    }
  }
  return result;
}

function previewPath(){
  let x=0,y=0;
  path.forEach(step=>{
    if(step==='right') x;
    else if(step==='left') x--; // not used but for completeness
    else if(step==='down') y;
    else if(step==='up') y--;
    const cell = getCell(x,y);
    if(cell) cell.classList.add('lit');
  });
  statusDiv.textContent = path.join(' → ');
  setTimeout(()=>{
    board.querySelectorAll('.lit').forEach(c=>c.classList.remove('lit'));
    statusDiv.textContent = '';
  },3000);
}

function startLevel(){
  playerSequence = [];
  sequenceDiv.textContent = '';
  playerPos = {x:0,y:0};
  placePlayer();
  path = generatePath();
  previewPath();
}

function updateSequence(){
  sequenceDiv.textContent = playerSequence.join(' , ');
}

// control buttons
const controls = document.getElementById('controls');
controls.addEventListener('click', e=>{
  const action = e.target.dataset.action;
  if(action){
    playerSequence.push(action);
    updateSequence();
  } else if(e.target.id==='undo'){
    playerSequence.pop();
    updateSequence();
  }
});

document.getElementById('go').addEventListener('click', ()=>{
  runSequence();
});

document.getElementById('new').addEventListener('click', ()=>{
  startLevel();
});

function runSequence(){
  let x=0,y=0,i=0;
  statusDiv.textContent = '';
  const interval = setInterval(()=>{
    const expected = path[i];
    const action = playerSequence[i];
    if(action !== expected){
      statusDiv.textContent = 'Ошибка!';
      clearInterval(interval);
      return;
    }
    if(action==='right') x;
    else if(action==='left') x--;
    else if(action==='down') y;
    else if(action==='up') y--;
    player.style.left = x*cellSize  'px';
    player.style.top = y*cellSize  'px';
    i;
    if(i>=path.length){
      clearInterval(interval);
      if(x===gridSize-1 && y===gridSize-1){
        statusDiv.textContent = 'Успех!';
      } else {
        statusDiv.textContent = 'Проигрыш!';
      }
    }
  },500);
}

startLevel();

