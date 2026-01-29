let canvas;
let world;
let keyboard;

const ASSETS = {
  win:  "img/You won, you lost/You won A.png",
  lose: "img/9_intro_outro_screens/game_over/game over.png"
};

function init() {
  canvas = document.getElementById("canvas");
  keyboard = new Keyboard();

  bindUiButtons();
  bindKeyboardEvents();

  showStartScreen();
}

function bindUiButtons() {
  const btnStart = document.getElementById("btnStart");
  const btnControls = document.getElementById("btnControls");
  const btnReplay = document.getElementById("btnReplay");
  const btnHome = document.getElementById("btnHome");

  btnStart.addEventListener("click", startGame);

  btnReplay.addEventListener("click", () => location.reload());
  btnHome.addEventListener("click", () => location.reload());

  btnControls.addEventListener("click", () => {
    document.querySelector(".instruction").classList.toggle("instruction--show");
  });
}


function startGame() {
  hideStartScreen();
  showIngameUi();
  initLevel();
  world = new World(canvas, keyboard, onGameEnd);
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


function showIngameUi() {
  document.querySelector(".mobile-controls").classList.add("mobile-controls--show");
  document.querySelector(".instruction").classList.add("instruction--show");
}

function hideIngameUi() {
  document.querySelector(".mobile-controls").classList.remove("mobile-controls--show");
  document.querySelector(".instruction").classList.remove("instruction--show");
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
