let 
canvas,
world,
keyboard, 
audioManager;
const ASSETS = {
  win:  "img/You won, you lost/You won A.png",
  lose: "img/9_intro_outro_screens/game_over/game over.png",
};

const $  = (sel) => document.querySelector(sel);
const id = (sel) => document.getElementById(sel);


function showOverlay(name, show) {
  id(name)?.classList.toggle("overlay--show", show);
}


function showMobileControls(show) {
  $(".mobile-controls")?.classList.toggle("mobile-controls--show", show);
}


function init() {
  initSoundDefaultOff();
  initCanvasAndKeyboard();
  initAudioManager();
  initUiAndEvents();
  showStartScreen();
}


function initSoundDefaultOff() {
  if (localStorage.getItem("soundEnabled") === null) {
    localStorage.setItem("soundEnabled", "false");
  }
}


function initCanvasAndKeyboard() {
  canvas = id("canvas");
  keyboard = new Keyboard();
}


function initAudioManager() {
  audioManager = createAudioManager();
  startIntroMusic();
  setupSoundButton(audioManager);
  unlockAudioOnce(audioManager);
}


function initUiAndEvents() {
  bindUiButtons();
  bindKeyboardEvents();
  bindOutsideMenuClose();
}


function createAudioManager() {
  return new GameAudio(
    {
      ...bottle_assets.sounds,
      ...CHARACTER_ASSETS.sounds,
      ...endboss_assets.sounds,
      ...chicken_assets.sounds,
    },
    0.6
  );
}


function startIntroMusic() {
  audioManager.switchMusic("audio/intro_game.mp3", 0.35, true);
}


function unlockAudioOnce(audio) {
  const unlock = () => audio.unlock();
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}


function showStartScreen() {
  showOverlay("startScreen", true);
  showOverlay("endScreen", false);
  showMobileControls(false);
}


function hideStartScreen() {
  showOverlay("startScreen", false);
}


function showEndScreen(won) {
  setEndScreenImage(won);
  showOverlay("endScreen", true);
  showMobileControls(false);
}


function hideEndScreen() {
  showOverlay("endScreen", false);
}


function setEndScreenImage(won) {
  const img = id("endImage");
  if (!img) return;
  img.src = won ? ASSETS.win : ASSETS.lose;
  img.alt = won ? "You Won" : "Game Over";
}


function startGame() {
  prepareGameUi();
  Cloud.nextX = 0;
  resetLevel();
  createWorld();
}

function replayGame() {
  stopWorld();
  startIntroMusic();
  startGame();
}


function goHome() {
  stopWorld();
  startIntroMusic();
  showStartScreen();
}


function onGameEnd(won) {
  showEndScreen(won);
}


function prepareGameUi() {
  hideStartScreen();
  hideEndScreen();
  showMobileControls(true);
}


function resetLevel() {
  initLevel();
}


function createWorld() {
  world = new World(canvas, keyboard, onGameEnd, audioManager);
}


function stopWorld() {
  world?.stopLoops?.();
  world = null;
}


function openControls()  { 
  showOverlay("controlsModal", true);
 }


function closeControls() {
   showOverlay("controlsModal", false); 
  }


function toggleFullscreen() {
  const wrap = $(".game-wrap");
  if (!wrap) return;
  if (!document.fullscreenElement) wrap.requestFullscreen?.();
  else document.exitFullscreen?.();
}


function bindKeyboardEvents() {
  const map = {
    39: "RIGHT",
    37: "LEFT",
    38: "UP",
    40: "DOWN",
    32: "SPACE",
    68: "D",
  };
  window.addEventListener("keydown", (e) => setKey(map[e.keyCode], true));
  window.addEventListener("keyup",   (e) => setKey(map[e.keyCode], false));
}


function setKey(keyName, value) {
  if (!keyboard || !keyName) return;
  keyboard[keyName] = value;
}


function bindUiButtons() {
  bindClick("btnStart", startGame);
  bindClick("btnReplay", replayGame);
  bindClick("btnHome", goHome);
  bindClick("btnControls", openControls);
  bindClick("btnCloseControls", closeControls);
  bindClick("btnFullscreen", toggleFullscreen);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeControls();
  });
}


function bindClick(idName, handler) {
  id(idName)?.addEventListener("click", handler);
}


function bindOutsideMenuClose() {
  document.addEventListener("click", (e) => {
    const menu = id("hamburger-menu");
    const topnav = $("#legal-notice .topnav");
    if (!menu || !topnav) return;
    if (!topnav.contains(e.target)) menu.classList.remove("is-open");
  });
}

function setupSoundButton(audio) {
  const btn  = id("btnSound");
  const icon = id("soundIcon");
  if (!btn || !icon) return;

  initSoundIcon(audio, icon);
  bindSoundUnlock(audio, icon);
  bindSoundToggle(btn, audio, icon);
}


function initSoundIcon(audio, icon) {
  updateSoundIcon(audio, icon);
}


function bindSoundUnlock(audio, icon) {
  const unlock = () => {
    audio.unlock();
    updateSoundIcon(audio, icon);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}


function bindSoundToggle(btn, audio, icon) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    audio.unlock();           
    audio.toggle();
    updateSoundIcon(audio, icon);
  });
}


function updateSoundIcon(audio, icon) {
  const isOn = audio.enabled && audio.unlocked;
  icon.src = isOn ? "img/ton/ton_on.png" : "img/ton/ton_off.png";
}


function renderSoundIcon(audio, iconEl) {
  iconEl.src = audio.enabled ? "img/ton/ton_on.png" : "img/ton/ton_off.png";
}