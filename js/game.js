let canvas;
let world;
let keyboard;
let audioManager;

const ASSETS = {
  win:  "img/You won, you lost/You won A.png",
  lose: "img/9_intro_outro_screens/game_over/game over.png"
};

function init() {
  canvas = document.getElementById("canvas");
  keyboard = new Keyboard();
  audioManager = new GameAudio(
  {
    ...bottle_assets.sounds,
    ...CHARACTER_ASSETS.sounds
  },
  0.6
);
  audioManager.startMusic("audio/intro_game.mp3", 0.35);
  setupSoundButton(audioManager);
  window.addEventListener("pointerdown", () => audioManager.unlock(), { once: true });
  window.addEventListener("keydown", () => audioManager.unlock(), { once: true });
  bindUiButtons();
  bindKeyboardEvents();
  showStartScreen();
}

function bindUiButtons() {
  const btnStart = document.getElementById("btnStart");
  const btnControls = document.getElementById("btnControls");
  const btnReplay = document.getElementById("btnReplay");
  const btnHome = document.getElementById("btnHome");
  const btnFullscreen = document.getElementById("btnFullscreen");
  if (btnFullscreen) btnFullscreen.addEventListener("click", toggleFullscreen);
  btnStart.addEventListener("click", startGame);
  btnReplay.addEventListener("click", replayGame);
  btnHome.addEventListener("click", goHome);
  btnControls.addEventListener("click", openControls);
  document.getElementById("btnCloseControls").addEventListener("click", closeControls);
  }

function startGame() {
  hideStartScreen();
  hideEndScreen();
  showIngameUi();
  initLevel();
  world = new World(canvas, keyboard, onGameEnd, audioManager);
}

function replayGame() {
  if (world?.stopLoops) world.stopLoops();
  hideEndScreen();
  showIngameUi();
  initLevel();
  world = new World(canvas, keyboard, onGameEnd, audioManager);
}

function goHome() {
  if (world?.stopLoops) world.stopLoops();
  world = null;

  hideEndScreen();
  hideIngameUi();
  showStartScreen();
}

function onGameEnd(won) {
  hideIngameUi();
  showEndScreen(won);
}

function showStartScreen() {
  document.getElementById("startScreen").classList.add("overlay--show");
  document.getElementById("endScreen").classList.remove("overlay--show");

  hideIngameUi();
}

function hideStartScreen() {
  document.getElementById("startScreen").classList.remove("overlay--show");
}

function showEndScreen(won) {
  const endImg = document.getElementById("endImage");
  endImg.src = won ? ASSETS.win : ASSETS.lose;
  endImg.alt = won ? "You Won" : "Game Over";
  document.getElementById("endScreen").classList.add("overlay--show");
}

function hideEndScreen() {
  document.getElementById("endScreen").classList.remove("overlay--show");
}

function showIngameUi() {
  document.querySelector(".mobile-controls").classList.add("mobile-controls--show");
}

function hideIngameUi() {
  document.querySelector(".mobile-controls").classList.remove("mobile-controls--show");
}

function openControls() {
  document.getElementById("controlsModal").classList.add("overlay--show");
}

function closeControls() {
  document.getElementById("controlsModal").classList.remove("overlay--show");
}

function toggleFullscreen() {
  const wrap = document.querySelector(".game-wrap");
  if (!wrap) return;

  if (!document.fullscreenElement) {
    wrap.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function enterFullscreen(element) {
  if (!element) return;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) { 
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) { 
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { 
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { 
    document.msExitFullscreen();
  }
}


window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeControls();
});




function bindKeyboardEvents() {
  window.addEventListener("keyup", (e) => {
    if (!keyboard) return;
    if (e.keyCode === 39) keyboard.RIGHT = false;
    if (e.keyCode === 37) keyboard.LEFT = false;
    if (e.keyCode === 38) keyboard.UP = false;
    if (e.keyCode === 40) keyboard.DOWN = false;
    if (e.keyCode === 32) keyboard.SPACE = false;
    if (e.keyCode === 68) keyboard.D = false;
  });

  window.addEventListener("keydown", (e) => {
    if (!keyboard) return;
    if (e.keyCode === 39) keyboard.RIGHT = true;
    if (e.keyCode === 37) keyboard.LEFT = true;
    if (e.keyCode === 38) keyboard.UP = true;
    if (e.keyCode === 40) keyboard.DOWN = true;
    if (e.keyCode === 32) keyboard.SPACE = true;
    if (e.keyCode === 68) keyboard.D = true;
  });
}

document.addEventListener("click", (e) => {
  const menu = document.getElementById("hamburger-menu");
  const topnav = document.querySelector("#legal-notice .topnav");
  if (!menu || !topnav) return;

  if (!topnav.contains(e.target)) {
    menu.classList.remove("is-open");
  }
});

function setupSoundButton(audio) {
  const btn = document.getElementById("btnSound");
  const icon = document.getElementById("soundIcon");
  if (!btn || !icon) return;

  const render = () => {
    icon.src = audio.enabled ? "img/ton/ton_on.png" : "img/ton/ton_off.png";
  };

  const unlockOnce = () => audio.unlock();
  window.addEventListener("pointerdown", unlockOnce, { once: true });
  window.addEventListener("keydown", unlockOnce, { once: true });

  render();

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    audio.unlock();   // wichtig für Browser-Audio
    audio.toggle();   // macht Musik an/aus + enabled speichern
    render();
  });
}