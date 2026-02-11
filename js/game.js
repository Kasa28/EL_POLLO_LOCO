/** @type {HTMLCanvasElement|null} */
let canvas;
/** @type {World|null} */
let world;
/** @type {Keyboard|null} */
let keyboard;
/** @type {GameAudio|null} */
let audioManager;

const ASSETS = {
  win:  "img/You won, you lost/You won A.png",
  lose: "img/9_intro_outro_screens/game_over/game over.png",
};

/** @param {string} sel @returns {Element|null} */
const $ = (sel) => document.querySelector(sel);

/** @param {string} sel @returns {HTMLElement|null} */
const id = (sel) => document.getElementById(sel);

/** @param {string} name @param {boolean} show @returns {void} */
function showOverlay(name, show) {
  id(name)?.classList.toggle("overlay--show", show);
}

/** @param {boolean} show @returns {void} */
function showMobileControls(show) {
  $(".mobile-controls")?.classList.toggle("mobile-controls--show", show);
}

/** @returns {void} */
function init() {
  initSoundDefaultOff();
  initCanvasAndKeyboard();
  initAudioManager();
  initUiAndEvents();
  showStartScreen();
}

/** @returns {void} */
function initSoundDefaultOff() {
  if (localStorage.getItem("soundEnabled") === null) {
    localStorage.setItem("soundEnabled", "false");
  }
}

/** @returns {void} */
function initCanvasAndKeyboard() {
  canvas = id("canvas");
  keyboard = new Keyboard();
}

/** @returns {void} */
function initAudioManager() {
  audioManager = createAudioManager();
  startIntroMusic();
  setupSoundButton(audioManager);
  unlockAudioOnce(audioManager);
}

/** @returns {void} */
function initUiAndEvents() {
  bindUiButtons();
  bindKeyboardEvents();
  bindOutsideMenuClose();
}

/** @returns {GameAudio} */
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

/** @returns {void} */
function startIntroMusic() {
  audioManager.switchMusic("audio/intro_game.mp3", 0.35, true);
}

/** @param {GameAudio} audio @returns {void} */
function unlockAudioOnce(audio) {
  const unlock = () => {
    audio.unlock();
    audio.applyEnabledState(); 
    const icon = id("soundIcon");
    if (icon) updateSoundIcon(audio, icon);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

/** @returns {void} */
function showStartScreen() {
  showOverlay("startScreen", true);
  showOverlay("endScreen", false);
  showMobileControls(false);
}

/** @returns {void} */
function hideStartScreen() {
  showOverlay("startScreen", false);
}

/** @param {boolean} won @returns {void} */
function showEndScreen(won) {
  setEndScreenImage(won);
  showOverlay("endScreen", true);
  showMobileControls(false);
}

/** @returns {void} */
function hideEndScreen() {
  showOverlay("endScreen", false);
}

/** @param {boolean} won @returns {void} */
function setEndScreenImage(won) {
  const img = id("endImage");
  if (!img) return;
  img.src = won ? ASSETS.win : ASSETS.lose;
  img.alt = won ? "You Won" : "Game Over";
}

/** @returns {void} */
function startGame() {
  prepareGameUi();
  Cloud.nextX = 0;
  resetLevel();
  createWorld();
}

/** @returns {void} */
function replayGame() {
  stopWorld();
  startIntroMusic();
  startGame();
}

/** @returns {void} */
function goHome() {
  stopWorld();
  startIntroMusic();
  showStartScreen();
}

/** @param {boolean} won @returns {void} */
function onGameEnd(won) {
  showEndScreen(won);
}

/** @returns {void} */
function prepareGameUi() {
  hideStartScreen();
  hideEndScreen();
  showMobileControls(true);
}

/** @returns {void} */
function resetLevel() {
  initLevel();
}

/** @returns {void} */
function createWorld() {
  world = new World(canvas, keyboard, onGameEnd, audioManager);
}

/** @returns {void} */
function stopWorld() {
  world?.stopLoops?.();
  world = null;
}

/** @returns {void} */
function openControls() {
  showOverlay("controlsModal", true);
}

/** @returns {void} */
function closeControls() {
  showOverlay("controlsModal", false);
}

/** @returns {void} */
function toggleFullscreen() {
  const wrap = $(".game-wrap");
  if (!wrap) return;
  if (!document.fullscreenElement) wrap.requestFullscreen?.();
  else document.exitFullscreen?.();
}

/** @returns {void} */
function bindKeyboardEvents() {
  /** @type {Record<number, keyof Keyboard>} */
  const map = {
    39: "RIGHT",
    37: "LEFT",
    38: "UP",
    40: "DOWN",
    32: "SPACE",
    68: "D",
  };
  window.addEventListener("keydown", (e) => setKey(map[e.keyCode], true));
  window.addEventListener("keyup", (e) => setKey(map[e.keyCode], false));
}

/** @param {keyof Keyboard | undefined} keyName @param {boolean} value @returns {void} */
function setKey(keyName, value) {
  if (!keyboard || !keyName) return;
  keyboard[keyName] = value;
}

/** @returns {void} */
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

/** @param {string} idName @param {(ev:MouseEvent)=>void} handler @returns {void} */
function bindClick(idName, handler) {
  id(idName)?.addEventListener("click", handler);
}

/** @returns {void} */
function bindOutsideMenuClose() {
  document.addEventListener("click", (e) => {
    const menu = id("hamburger-menu");
    const topnav = $("#legal-notice .topnav");
    if (!menu || !topnav) return;
    if (!topnav.contains(/** @type {Node} */ (e.target))) menu.classList.remove("is-open");
  });
}

/** @param {GameAudio} audio @returns {void} */
function setupSoundButton(audio) {
  const btn = id("btnSound");
  const icon = id("soundIcon");
  if (!btn || !icon) return;

  initSoundIcon(audio, icon);
  bindSoundUnlock(audio, icon);
  bindSoundToggle(btn, audio, icon);
}

/** @param {GameAudio} audio @param {HTMLImageElement} icon @returns {void} */
function initSoundIcon(audio, icon) {
  updateSoundIcon(audio, icon);
}

/** @param {GameAudio} audio @param {HTMLImageElement} icon @returns {void} */
function bindSoundUnlock(audio, icon) {
  const unlock = () => {
    audio.unlock();
    updateSoundIcon(audio, icon);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

/** @param {HTMLButtonElement} btn @param {GameAudio} audio @param {HTMLImageElement} icon @returns {void} */
function bindSoundToggle(btn, audio, icon) {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    audio.unlock();
    audio.toggle();
    updateSoundIcon(audio, icon);
  });
}

/** @param {GameAudio} audio @param {HTMLImageElement} icon @returns {void} */
function updateSoundIcon(audio, icon) {
  const btn = id("btnSound");
  const isOn = audio.enabled;  
  icon.src = isOn ? "img/ton/ton_on.png" : "img/ton/ton_off.png";
  btn?.classList.toggle("is-off", !isOn);
}

/** @param {GameAudio} audio @param {HTMLImageElement} iconEl @returns {void} */
function renderSoundIcon(audio, iconEl) {
  iconEl.src = audio.enabled ? "img/ton/ton_on.png" : "img/ton/ton_off.png";
}
