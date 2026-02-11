/**
 * Audio manager for music + SFX groups with enable toggle, unlock gating and cooldowns.
 */
class GameAudio {
  /**
   * @param {Record<string, string[]>} groups
   * @param {number} [volume=0.6]
   */
  constructor(groups, volume = 0.6) {
    /** @type {Record<string, string[]>} */
    this.groups = groups;
    /** @type {number} */
    this.volume = volume;
    /** @type {boolean} */
    this.enabled = localStorage.getItem("soundEnabled") === "true";
    /** @type {boolean} */
    this.unlocked = false;
    /** @type {HTMLAudioElement|null} */
    this.music = null;
    /** @type {number} */
    this.musicVolume = 0.35;
    /** @type {Record<string, number>} */
    this.cooldowns = {};
    /** @type {Set<HTMLAudioElement>} */
    this.activeSfx = new Set();
    /** @type {Map<string, HTMLAudioElement>} */
    this.loopingSfx = new Map();
  }

  /** @returns {void} */
  unlock() {
    this.unlocked = true;
    this.tryPlayMusic();
  }

  /** @returns {void} */
  tryPlayMusic() {
    if (!this.enabled || !this.unlocked || !this.music) return;
    this.music.play().catch(() => {});
  }

  /**
   * @param {string} src
   * @param {number} [volume=this.musicVolume]
   * @param {boolean} [loop=true]
   * @returns {void}
   */
  switchMusic(src, volume = this.musicVolume, loop = true) {
    this.stopMusic();
    this.music = this.createMusic(src, volume, loop);
    this.tryPlayMusic();
  }

  /** @returns {void} */
  stopMusic() {
    if (!this.music) return;
    this.music.pause();
    this.music.currentTime = 0;
  }

  /**
   * @param {string} src
   * @param {number} volume
   * @param {boolean} loop
   * @returns {HTMLAudioElement}
   */
  createMusic(src, volume, loop) {
    this.musicVolume = volume;
    const a = new Audio(src);
    a.loop = loop;
    a.volume = volume;
    return a;
  }

  /** @returns {void} */
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", String(this.enabled));
    this.applyEnabledState();
  }

  /** @returns {void} */
  applyEnabledState() {
    if (this.enabled) return this.tryPlayMusic();
    this.stopMusic();
    this.stopAllSfx();
  }

  /**
   * @param {string} groupName
   * @returns {void}
   */
  play(groupName) {
    if (!this.canPlay()) return;
    const src = this.pickRandomSrc(groupName);
    if (!src) return;
    const a = this.createSfx(src);
    this.trackSfx(a);
    a.play().catch(() => {});
  }

  /** @returns {boolean} */
  canPlay() {
    return this.enabled && this.unlocked;
  }

  /**
   * @param {string} groupName
   * @returns {string|null}
   */
  pickRandomSrc(groupName) {
    const list = this.groups[groupName];
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  /**
   * @param {string} src
   * @returns {HTMLAudioElement}
   */
  createSfx(src) {
    const a = new Audio(src);
    a.volume = this.volume;
    return a;
  }

  /**
   * @param {HTMLAudioElement} a
   * @returns {void}
   */
  trackSfx(a) {
    this.activeSfx.add(a);
    const cleanup = () => this.activeSfx.delete(a);
    a.addEventListener("ended", cleanup, { once: true });
    a.addEventListener("pause", cleanup, { once: true });
  }

  /**
   * @param {string} groupName
   * @param {number} [cooldown=200]
   * @returns {void}
   */
  playOnce(groupName, cooldown = 200) {
    if (!this.canPlay()) return;
    if (!this.cooldownReady(groupName, cooldown)) return;
    this.setCooldown(groupName);
    this.play(groupName);
  }

  /**
   * @param {string} groupName
   * @param {number} cooldown
   * @returns {boolean}
   */
  cooldownReady(groupName, cooldown) {
    const now = Date.now();
    const last = this.cooldowns[groupName] || 0;
    return now - last >= cooldown;
  }

  /**
   * @param {string} groupName
   * @returns {void}
   */
  setCooldown(groupName) {
    this.cooldowns[groupName] = Date.now();
  }

  /** @returns {void} */
  stopAllSfx() {
    this.loopingSfx?.forEach((_, key) => this.stopLoop(key));
    this.loopingSfx?.clear?.();
    this.activeSfx.forEach((a) => this.stopAudio(a));
    this.activeSfx.clear();
  }

  /**
   * @param {HTMLAudioElement} a
   * @returns {void}
   */
  stopAudio(a) {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  }

  /** @returns {void} */
  playThrow() {
    this.playOnce("throw", 80);
  }

  /** @returns {void} */
  playCollect() {
    this.playOnce("collect", 80);
  }

  /** @returns {void} */
  playHurt() {
    this.playOnce("hurt_audio", 500);
  }

  /** @returns {void} */
  playBossAttack() {
    this.playOnce("attack_audio", 800);
  }

  /** @returns {void} */
  musicIntro() {
    this.switchMusic("audio/intro_game.mp3", 0.35, true);
  }

  /** @returns {void} */
  musicBoss() {
    this.switchMusic("audio/endboss.mp3", 0.35, true);
  }

  /** @returns {void} */
  musicWin() {
    this.switchMusic("audio/you_win.mp3", 0.45, false);
  }

  /** @returns {void} */
  musicLose() {
    this.switchMusic("audio/game_over.mp3", 0.45, false);
  }

  /**
   * @param {boolean} won
   * @returns {void}
   */
  endGame(won) {
    this.stopAllSfx();
    if (won) this.musicWin();
    else this.musicLose();
  }

  /**
   * @param {string} groupName
   * @param {string} [key=groupName]
   * @returns {void}
   */
  playLoop(groupName, key = groupName) {
    if (!this.canPlay()) return;
    const existing = this.loopingSfx.get(key);
    if (existing && !existing.paused) return;
    const src = this.pickRandomSrc(groupName);
    if (!src) return;
    if (existing) this.stopLoop(key);
    const a = this.createSfx(src);
    a.loop = true;
    this.loopingSfx.set(key, a);
    this.activeSfx.add(a);
    a.play().catch(() => {});
  }

  /**
   * @param {string} key
   * @returns {void}
   */
  stopLoop(key) {
    const a = this.loopingSfx.get(key);
    if (!a) return;
    this.stopAudio(a);
    this.loopingSfx.delete(key);
    this.activeSfx.delete(a);
  }
}
