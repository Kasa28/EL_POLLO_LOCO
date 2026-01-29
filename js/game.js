let canvas;
let world;
let keyboard;

const IMG_GAMEOVER = "img/You won, you lost/Game over A.png";
const IMG_YOUWON   = "im/You won, you lost/You Win A.png";

function init() {
  canvas = document.getElementById("canvas");
  initLevel();
  keyboard = new Keyboard();        
  bindKeyboardEvents();           
  bindUiButtons();           
  showStartScreen();             
}


function bindUiButtons() {
  document.getElementById("btnStart").addEventListener("click", startGame);

  document.getElementById("btnRestart").addEventListener("click", () => {
    location.reload();
  });

  document.getElementById("btnControls").addEventListener("click", () => {
    alert("Controls:\n← → Walk\n⬆ / Space Jump\nD / 🍾 Throw");
  });
}

function startGame() {
  hideStartScreen();
  showIngameUi();
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
  endImg.src = won ? IMG_YOUWON : IMG_GAMEOVER;

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
    if (e.keyCode == 39) keyboard.RIGHT = false;
    if (e.keyCode == 37) keyboard.LEFT = false;
    if (e.keyCode == 38) keyboard.UP = false;
    if (e.keyCode == 40) keyboard.DOWN = false;
    if (e.keyCode == 32) keyboard.SPACE = false;
    if (e.keyCode == 68) keyboard.D = false;
  });

  window.addEventListener("keydown", (e) => {
    if (e.keyCode == 39) keyboard.RIGHT = true;
    if (e.keyCode == 37) keyboard.LEFT = true;
    if (e.keyCode == 38) keyboard.UP = true;
    if (e.keyCode == 40) keyboard.DOWN = true;
    if (e.keyCode == 32) keyboard.SPACE = true;
    if (e.keyCode == 68) keyboard.D = true;
  });
}
