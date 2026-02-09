class GameAudio {
  constructor(groups, volume = 0.6) {
    this.groups = groups;
    this.volume = volume;
    this.enabled = localStorage.getItem("soundEnabled") !== "false";
    this.unlocked = false;
    this.music = null;
    this.musicVolume = 0.35;
    this.cooldowns = {};
    this.activeSfx = new Set(); 
  }

  unlock() {
    this.unlocked = true;

    if (this.enabled && this.music) {
      this.music.play().catch(() => {});
    }
  }

  switchMusic(src, volume = this.musicVolume, loop = true) {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
    }

    this.musicVolume = volume;
    this.music = new Audio(src);
    this.music.loop = loop;
    this.music.volume = volume;
    if (this.enabled && this.unlocked) {
      this.music.play().catch(() => {});
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", String(this.enabled));
    if (!this.music) {
      if (!this.enabled) this.stopAllSfx();
      return;
    }

    if (this.enabled) {
      if (this.unlocked) this.music.play().catch(() => {});
    } else {
      this.music.pause();
      this.music.currentTime = 0;
      this.stopAllSfx(); 
    }
  }

  play(groupName) {
    if (!this.enabled || !this.unlocked) return;
    const list = this.groups[groupName];
    if (!list || list.length === 0) return;
    const src = list[Math.floor(Math.random() * list.length)];
    const a = new Audio(src);
    a.volume = this.volume;
    this.activeSfx.add(a);
    const cleanup = () => this.activeSfx.delete(a);
    a.addEventListener("ended", cleanup, { once: true });
    a.addEventListener("pause", cleanup, { once: true });

    a.play().catch(() => {});
  }

  playOnce(groupName, cooldown = 200) {
    if (!this.enabled || !this.unlocked) return;

    const now = Date.now();
    const last = this.cooldowns[groupName] || 0;
    if (now - last < cooldown) return;

    this.cooldowns[groupName] = now;
    this.play(groupName);
  }

  stopAllSfx() {
    this.activeSfx.forEach(a => {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    });
    this.activeSfx.clear();
  }
}