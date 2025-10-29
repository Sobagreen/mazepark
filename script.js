(function () {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const ui = {
    start: document.getElementById('start'),
    pause: document.getElementById('pause'),
    restart: document.getElementById('restart'),
    score: document.getElementById('score'),
    best: document.getElementById('best')
  };

  const CONFIG = {
    gravity: 1800, // пикселей в секунду^2
    flapStrength: -520,
    pipeGap: 165,
    pipeWidth: 70,
    pipeSpeed: 210,
    spawnInterval: 1.6,
    minGapTop: 90,
    groundHeight: 80
  };

  const bird = {
    x: canvas.width * 0.3,
    y: canvas.height / 2,
    radius: 18,
    velocity: 0,
    rotation: 0
  };

  const stars = Array.from({ length: 30 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * (canvas.height - CONFIG.groundHeight - 40),
    radius: Math.random() * 1.5 + 0.5
  }));

  let pipes = [];
  const state = {
    mode: 'ready',
    score: 0,
    best: loadBestScore(),
    lastTime: performance.now(),
    spawnTimer: 0
  };

  let animationId = null;

  function loadBestScore() {
    const raw = localStorage.getItem('mazepark-flappy-best');
    const value = parseInt(raw, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  function saveBestScore() {
    localStorage.setItem('mazepark-flappy-best', String(state.best));
  }

  function resetEntities() {
    state.score = 0;
    state.spawnTimer = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes = [];
    updateScoreboard();
  }

  function updateScoreboard() {
    ui.score.textContent = state.score;
    ui.best.textContent = state.best;
  }

  function applyUiState() {
    ui.start.disabled = state.mode === 'running';
    ui.pause.disabled = !(state.mode === 'running' || state.mode === 'paused');
    ui.restart.disabled = state.mode === 'ready';
    ui.pause.textContent = state.mode === 'paused' ? 'Продолжить' : 'Пауза';
  }

  function flap() {
    bird.velocity = CONFIG.flapStrength;
  }

  function beginGame() {
    resetEntities();
    state.mode = 'running';
    state.lastTime = performance.now();
    applyUiState();
    flap();
  }

  function togglePause() {
    if (state.mode === 'running') {
      state.mode = 'paused';
      applyUiState();
    } else if (state.mode === 'paused') {
      state.mode = 'running';
      state.lastTime = performance.now();
      applyUiState();
    }
  }

  function gameOver() {
    if (state.mode === 'gameover') return;
    state.mode = 'gameover';
    if (state.score > state.best) {
      state.best = state.score;
      saveBestScore();
    }
    updateScoreboard();
    applyUiState();
  }

  function spawnPipe() {
    const clearance = CONFIG.pipeGap;
    const maxTop = canvas.height - CONFIG.groundHeight - clearance - CONFIG.minGapTop;
    const gapTop = CONFIG.minGapTop + Math.random() * Math.max(10, maxTop);
    pipes.push({
      x: canvas.width + CONFIG.pipeWidth,
      width: CONFIG.pipeWidth,
      gapTop,
      gapBottom: gapTop + clearance,
      scored: false
    });
  }

  function updateGame(delta) {
    state.spawnTimer += delta;
    if (state.spawnTimer >= CONFIG.spawnInterval) {
      state.spawnTimer = 0;
      spawnPipe();
    }

    bird.velocity += CONFIG.gravity * delta;
    bird.y += bird.velocity * delta;
    bird.rotation = Math.atan2(bird.velocity, CONFIG.pipeSpeed * 2);

    const ceiling = bird.radius;
    const floor = canvas.height - CONFIG.groundHeight - bird.radius;
    if (bird.y < ceiling) {
      bird.y = ceiling;
      bird.velocity = 0;
    }
    if (bird.y > floor) {
      bird.y = floor;
      gameOver();
    }

    const nextPipes = [];
    for (const pipe of pipes) {
      pipe.x -= CONFIG.pipeSpeed * delta;
      if (!pipe.scored && pipe.x + pipe.width < bird.x - bird.radius) {
        pipe.scored = true;
        state.score += 1;
        updateScoreboard();
      }
      if (pipe.x + pipe.width > 0) {
        nextPipes.push(pipe);
      }

      if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipe.width) {
        if (bird.y - bird.radius < pipe.gapTop || bird.y + bird.radius > pipe.gapBottom) {
          gameOver();
        }
      }
    }
    pipes = nextPipes;
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#060915');
    gradient.addColorStop(0.55, '#102040');
    gradient.addColorStop(1, '#182d52');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround() {
    ctx.fillStyle = '#1a2d4d';
    ctx.fillRect(0, canvas.height - CONFIG.groundHeight, canvas.width, CONFIG.groundHeight);
    ctx.strokeStyle = '#253d63';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - CONFIG.groundHeight);
    ctx.lineTo(canvas.width, canvas.height - CONFIG.groundHeight);
    ctx.stroke();
  }

  function drawPipes() {
    for (const pipe of pipes) {
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      gradient.addColorStop(0, '#1ad6ff');
      gradient.addColorStop(1, '#1a90ff');
      ctx.fillStyle = gradient;

      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapTop);
      ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, canvas.height - CONFIG.groundHeight - pipe.gapBottom);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(pipe.x, pipe.gapTop - 12, pipe.width, 12);
      ctx.fillRect(pipe.x, pipe.gapBottom, pipe.width, 12);
    }
  }

  function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(Math.max(Math.min(bird.rotation, 0.45), -0.75));
    ctx.fillStyle = '#ffe56c';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f9c23c';
    ctx.beginPath();
    ctx.ellipse(-bird.radius * 0.6, 0, bird.radius * 0.65, bird.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0c1324';
    ctx.beginPath();
    ctx.arc(bird.radius * 0.4, -bird.radius * 0.2, bird.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath();
    ctx.moveTo(bird.radius, 0);
    ctx.lineTo(bird.radius + 12, -4);
    ctx.lineTo(bird.radius + 12, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawOverlay() {
    let title = '';
    let subtitle = '';

    if (state.mode === 'ready') {
      title = 'Готовы к полёту?';
      subtitle = 'Нажмите «Старт» или пробел, чтобы начать.';
    } else if (state.mode === 'paused') {
      title = 'Пауза';
      subtitle = 'Нажмите «Продолжить» или пробел, чтобы вернуться в полёт.';
    } else if (state.mode === 'gameover') {
      title = 'Промах!';
      subtitle = `Ваш счёт: ${state.score}. Попробуйте снова.`;
    }

    if (!title) return;

    ctx.save();
    ctx.fillStyle = 'rgba(5, 9, 18, 0.65)';
    ctx.fillRect(40, canvas.height * 0.32, canvas.width - 80, 140);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe56c';
    ctx.font = '700 32px "Segoe UI", sans-serif';
    ctx.fillText(title, canvas.width / 2, canvas.height * 0.4);

    ctx.fillStyle = '#d2dbf5';
    ctx.font = '400 18px "Segoe UI", sans-serif';
    ctx.fillText(subtitle, canvas.width / 2, canvas.height * 0.47);
    ctx.restore();
  }

  function drawScore() {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '700 24px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 229, 108, 0.95)';
    ctx.fillText(`Счёт: ${state.score}`, 20, 36);
    ctx.fillText(`Рекорд: ${state.best}`, 20, 66);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    drawScore();
    drawOverlay();
  }

  function loop(timestamp) {
    const delta = Math.min((timestamp - state.lastTime) / 1000, 0.05);
    state.lastTime = timestamp;

    if (state.mode === 'running') {
      updateGame(delta);
    }

    draw();
    animationId = requestAnimationFrame(loop);
  }

function useTorch(){
  const index = playerSequence.length;
  let x=0, y=0;
  for(let i=0;i<=index;i++){
    const step = path[i];
    if(i===index){
      if(step==='right') x++;
      else if(step==='left') x--;
      else if(step==='down') y++;
      else if(step==='up') y--;
      const cell = getCell(x,y);
      if(cell){
        cell.classList.add('lit');
        setTimeout(()=>cell.classList.remove('lit'),1000);
      }
      return;
    }
    if(step==='right') x++;
    else if(step==='left') x--;
    else if(step==='down') y++;
    else if(step==='up') y--;
  }
}

// start screen logic
const startScreen = document.getElementById('start-screen');
document.getElementById('start').addEventListener('click', ()=>{
  startScreen.classList.add('hidden');
  startLevel();
});

document.getElementById('share').addEventListener('click', ()=>{
  const url = window.location.href;
  if(navigator.share){
    navigator.share({title: 'Ночной обход', url});
  } else {
    navigator.clipboard.writeText(url);
    alert('Ссылка скопирована');
  }
});
  function handleFlapTrigger(event) {
    if (event) {
      event.preventDefault();
    }

    if (state.mode === 'ready' || state.mode === 'gameover') {
      beginGame();
    } else if (state.mode === 'running') {
      flap();
    } else if (state.mode === 'paused') {
      togglePause();
    }
  }

  ui.start.addEventListener('click', () => {
    beginGame();
  });

  ui.pause.addEventListener('click', () => {
    togglePause();
  });

  ui.restart.addEventListener('click', () => {
    beginGame();
  });

  canvas.addEventListener('pointerdown', handleFlapTrigger);
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      handleFlapTrigger(event);
    } else if (event.code === 'KeyP') {
      event.preventDefault();
      togglePause();
    } else if (event.code === 'KeyR' && state.mode !== 'ready') {
      event.preventDefault();
      beginGame();
    }
  });

  window.addEventListener('touchstart', (event) => {
    handleFlapTrigger(event);
  }, { passive: false });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.mode === 'running') {
      togglePause();
    }
  });

  function cancelAnimation() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.addEventListener('beforeunload', cancelAnimation);

  function init() {
    resetEntities();
    state.mode = 'ready';
    applyUiState();
    updateScoreboard();
    state.lastTime = performance.now();
    animationId = requestAnimationFrame(loop);
  }

  init();
})();
