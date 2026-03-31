import { SLOW_MO_SCALE, SLOW_MO_DURATION } from '../game/constants';

export class SlowMotion {
  timeScale = 1;
  private duration = 0;
  private elapsed = 0;
  private active = false;

  trigger() {
    this.active = true;
    this.timeScale = SLOW_MO_SCALE;
    this.duration = SLOW_MO_DURATION;
    this.elapsed = 0;
  }

  forceNormal() {
    this.active = false;
    this.timeScale = 1;
  }

  freeze() {
    this.timeScale = 0;
  }

  update(dt: number) {
    if (!this.active) return;
    this.elapsed += dt;
    if (this.elapsed >= this.duration) {
      this.active = false;
      this.timeScale = 1;
    }
  }

  reset() {
    this.active = false;
    this.timeScale = 1;
  }
}
