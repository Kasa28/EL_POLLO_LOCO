/**
 * Input state for keyboard + mobile touch buttons.
 */
class Keyboard {
  /** @type {boolean} */
  LEFT = false;
  /** @type {boolean} */
  RIGHT = false;
  /** @type {boolean} */
  UP = false;
  /** @type {boolean} */
  DOWN = false;
  /** @type {boolean} */
  SPACE = false;
  /** @type {boolean} */
  D = false;

  /** @type {number} */
  THROW_REQUEST_STOP = Date.now();
  /** @type {number} */
  THROW_REQUEST_START = 0;

  constructor() {
    this.bindBtsPressEvents();
  }

  /** @returns {void} */
  bindBtsPressEvents() {
    /** @type {HTMLElement} */
    const btnLeft = document.getElementById("btnLeft");
    /** @type {HTMLElement} */
    const btnRight = document.getElementById("btnRight");
    /** @type {HTMLElement} */
    const btnJump = document.getElementById("btnJump");
    /** @type {HTMLElement} */
    const btnThrow = document.getElementById("btnThrow");

    btnLeft.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.LEFT = true;
    });

    btnLeft.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.LEFT = false;
    });

    btnRight.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.RIGHT = true;
    });

    btnRight.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.RIGHT = false;
    });

    btnJump.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.UP = true;
    });

    btnJump.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.UP = false;
    });

    btnThrow.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const now = Date.now();
      const cooldown = 400;
      if (now - this.THROW_REQUEST_START >= cooldown) {
        this.THROW_REQUEST_START = now;
        this.D = true;
      }
    });

    btnThrow.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.THROW_REQUEST_STOP = Date.now();
      this.D = false;
    });
  }
}
