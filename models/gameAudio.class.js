class GameAudio {
  constructor(groups, volume = 0.6) {
    this.groups = groups;      // sound effects
    this.volume = volume;
    this.enabled = localStorage.getItem("soundEnabled") !== "false";
    this.unlocked = false;

    this.music = null;
    this.musicVolume = 0.35;
  }

  unlock() {
    this.unlocked = true;

    // wenn schon enabled und Music existiert -> starten
    if (this.enabled && this.music) {
      this.music.play().catch(() => {});
    }
  }

  startMusic(src, volume = 0.35) {
    this.musicVolume = volume;
    this.music = new Audio(src);
    this.music.loop = true;
    this.music.volume = this.musicVolume;

    // falls schon entsperrt und enabled -> starten
    if (this.enabled && this.unlocked) {
      this.music.play().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", String(this.enabled));

    // Musik an/aus
    if (!this.music) return;

    if (this.enabled) {
      if (this.unlocked) this.music.play().catch(() => {});
    } else {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }

  play(groupName) {
    if (!this.enabled || !this.unlocked) return;
    const list = this.groups[groupName];
    if (!list || list.length === 0) return;

    const src = list[Math.floor(Math.random() * list.length)];
    const a = new Audio(src);
    a.volume = this.volume;
    a.play().catch(() => {});
  }
}