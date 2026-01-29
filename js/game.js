let canvas;
let world;
let keyboard;

const ASSETS = {
  win: "img/You won, you lost/You won A.png",          
  lose: "img/9_intro_outro_screens/game_over/game over.png" 
};

function init() {
  canvas = document.getElementById("canvas");

  const startScreen = document.getElementById("startScreen");
  const endScreen = document.getElementById("endScreen");
  const endImage = document.getElementById("endImage");

  const btnStart = document.getElementById("btnStart");
  const btnControls = document.getElementById("btnControls");
  const btnRestart = document.getElementById("btnRestart");

  const mobileControls = document.querySelector(".mobile-controls");
  const instruction = document.querySelector(".instruction");


  show(startScreen);
  hide(endScreen);
  hideElement(mobileControls);

  keyboard = new Keyboard();

  btnStart.addEventListener("click", () => startGame(startScreen, mobileControls, instruction));
  btnReplay.addEventListener("click", restartGame);
  btnControls.addEventListener("click", () => toggleElement(instruction));

  bindKeyboardEvents();
}

function startGame(startScreen, mobileControls, instruction) {
  hide(startScreen);
  hide(instruction);               
  showElement(mobileControls);

  initLevel();

  world = new World(canvas, keyboard, (won) => {
    onGameEnd(won, mobileControls);
  });
}

function onGameEnd(won, mobileControls) {
  const endScreen = document.getElementById("endScreen");
  const endImage = document.getElementById("endImage");

  hideElement(mobileControls);

  endImage.src = won ? ASSETS.win : ASSETS.lose;
  endImage.alt = won ? "You Won" : "Game Over";

  show(endScreen);
}

function restartGame() {
  location.reload();
}

function show(el) {
  if (!el) return;
  el.classList.add("overlay--show");
}

function hide(el) {
  if (!el) return;
  el.classList.remove("overlay--show");
}

function showElement(el) {
  if (!el) return;
  el.style.display = "";
}

function hideElement(el) {
  if (!el) return;
  el.style.display = "none";
}

function toggleElement(el) {
  if (!el) return;
  const isHidden = getComputedStyle(el).display === "none";
  el.style.display = isHidden ? "" : "none";
}

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
