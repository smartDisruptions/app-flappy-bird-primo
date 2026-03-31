import { Container } from 'pixi.js';

export class ScreenShake {
  private target: Container;
  private duration = 0;
  private elapsed = 0;
  private intensity = 0;
  active = false;

  constructor(target: Container) {
    this.target = target;
  }

  trigger(duration: number, intensity: number) {
    this.duration = duration / 1000;
    this.elapsed = 0;
    this.intensity = intensity;
    this.active = true;
  }

  update(dt: number) {
    if (!this.active) return;
    this.elapsed += dt;

    if (this.elapsed >= this.duration) {
      this.active = false;
      this.target.x = 0;
      this.target.y = 0;
      return;
    }

    const decay = 1 - this.elapsed / this.duration;
    const mag = this.intensity * decay;
    this.target.x = (Math.random() - 0.5) * 2 * mag;
    this.target.y = (Math.random() - 0.5) * 2 * mag;
  }

  reset() {
    this.active = false;
    this.target.x = 0;
    this.target.y = 0;
  }
}
