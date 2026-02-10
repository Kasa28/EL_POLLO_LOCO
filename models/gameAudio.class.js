class GameAudio {
  constructor(groups, volume = 0.6) {
    this.groups = groups;
    this.volume = volume;
    this.enabled = localStorage.getItem("soundEnabled") === "true";
    this.unlocked = false;
    this.music = null;
    this.musicVolume = 0.35;
    this.cooldowns = {};
    this.activeSfx = new Set();
    this.loopingSfx = new Map();
  }

  unlock() {
    this.unlocked = true;
    this.tryPlayMusic();
  }

  tryPlayMusic() {
    if (!this.enabled || !this.unlocked || !this.music) return;
    this.music.play().catch(() => {});
  }

  switchMusic(src, volume = this.musicVolume, loop = true) {
    this.stopMusic();
    this.music = this.createMusic(src, volume, loop);
    this.tryPlayMusic();
  }

  stopMusic() {
    if (!this.music) return;
    this.music.pause();
    this.music.currentTime = 0;
  }

  createMusic(src, volume, loop) {
    this.musicVolume = volume;
    const a = new Audio(src);
    a.loop = loop;
    a.volume = volume;
    return a;
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", String(this.enabled));
    this.applyEnabledState();
  }

  applyEnabledState() {
    if (this.enabled) return this.tryPlayMusic();
    this.stopMusic();
    this.stopAllSfx();
  }

  play(groupName) {
    if (!this.canPlay()) return;
    const src = this.pickRandomSrc(groupName);
    if (!src) return;
    const a = this.createSfx(src);
    this.trackSfx(a);
    a.play().catch(() => {});
  }
  canPlay() {
    return this.enabled && this.unlocked;
  }

  pickRandomSrc(groupName) {
    const list = this.groups[groupName];
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  createSfx(src) {
    const a = new Audio(src);
    a.volume = this.volume;
    return a;
  }

  trackSfx(a) {
    this.activeSfx.add(a);
    const cleanup = () => this.activeSfx.delete(a);
    a.addEventListener("ended", cleanup, { once: true });
    a.addEventListener("pause", cleanup, { once: true });
  }

  playOnce(groupName, cooldown = 200) {
    if (!this.canPlay()) return;
    if (!this.cooldownReady(groupName, cooldown)) return;
    this.setCooldown(groupName);
    this.play(groupName);
  }

  cooldownReady(groupName, cooldown) {
    const now = Date.now();
    const last = this.cooldowns[groupName] || 0;
    return now - last >= cooldown;
  }

  setCooldown(groupName) {
    this.cooldowns[groupName] = Date.now();
  }

  stopAllSfx() {
    this.loopingSfx?.forEach((_, key) => this.stopLoop(key));
  this.loopingSfx?.clear?.();
    this.activeSfx.forEach(a => this.stopAudio(a));
    this.activeSfx.clear();
  }

  stopAudio(a) {
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
  }

  playThrow() {
    this.playOnce("throw", 80);
  }

  playCollect() {
    this.playOnce("collect", 80);
  }

  playHurt() {
    this.playOnce("hurt_audio", 500);
  }

  playBossAttack() {
    this.playOnce("attack_audio", 800);
  }

  musicIntro() {
    this.switchMusic("audio/intro_game.mp3", 0.35, true);
  }

  musicBoss() {
    this.switchMusic("audio/endboss.mp3", 0.35, true);
  }

  musicWin() {
    this.switchMusic("audio/you_win.mp3", 0.45, false);
  }

  musicLose() {
    this.switchMusic("audio/game_over.mp3", 0.45, false);
  }

  endGame(won) {
    this.stopAllSfx();
    if (won) this.musicWin();
    else this.musicLose();
  }

  playLoop(groupName, key = groupName) {
  if (!this.canPlay()) return;

  // läuft schon?
  const existing = this.loopingSfx.get(key);
  if (existing && !existing.paused) return;

  const src = this.pickRandomSrc(groupName);
  if (!src) return;

  // falls vorhanden, alten Loop ersetzen
  if (existing) this.stopLoop(key);

  const a = this.createSfx(src);
  a.loop = true;

  this.loopingSfx.set(key, a);
  this.activeSfx.add(a); // optional: damit stopAllSfx es auch killt

  a.play().catch(() => {});
}

stopLoop(key) {
  const a = this.loopingSfx.get(key);
  if (!a) return;
  this.stopAudio(a);
  this.loopingSfx.delete(key);
  this.activeSfx.delete(a);
}
}