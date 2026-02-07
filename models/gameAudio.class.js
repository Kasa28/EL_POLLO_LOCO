class GameAudio {
  constructor(groups, volume = 0.6) {
    this.groups = groups;      
    this.volume = volume;
    this.enabled = true;
    this.unlocked = false;
  }

  unlock() {
    this.unlocked = true;
  }

  play(groupName) {
    if (!this.enabled || !this.unlocked) return;
    const list = this.groups[groupName];
    if (!list || list.length === 0) return;

    const src = list[Math.floor(Math.random() * list.length)];
    const a = new window.Audio(src);
    a.volume = this.volume;
    a.play().catch(() => {});
  }
}