import { Graphics } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, DEATH_FLASH_MS, C } from '../game/constants';

export class ScreenFlash extends Graphics {
  private elapsed = 0;
  private flashDuration = 0;
  private flashActive = false;
  private borderActive = false;
  private borderElapsed = 0;

  constructor() {
    super();
    this.visible = false;
  }

  trigger() {
    this.flashActive = true;
    this.elapsed = 0;
    this.flashDuration = DEATH_FLASH_MS / 1000;
    this.borderActive = true;
    this.borderElapsed = 0;
    this.visible = true;
  }

  update(dt: number) {
    if (!this.flashActive && !this.borderActive) return;

    this.clear();

    if (this.flashActive) {
      this.elapsed += dt;
      const t = this.elapsed / this.flashDuration;
      if (t >= 1) {
        this.flashActive = false;
      } else {
        this.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill({ color: C.flashWhite, alpha: 1 - t });
      }
    }

    if (this.borderActive) {
      this.borderElapsed += dt;
      const borderFade = Math.max(0, 1 - this.borderElapsed / 0.3);
      if (borderFade <= 0) {
        this.borderActive = false;
      } else {
        const w = 4;
        // Top
        this.rect(0, 0, GAME_WIDTH, w).fill({ color: C.flashRed, alpha: borderFade * 0.6 });
        // Bottom
        this.rect(0, GAME_HEIGHT - w, GAME_WIDTH, w).fill({ color: C.flashRed, alpha: borderFade * 0.6 });
        // Left
        this.rect(0, 0, w, GAME_HEIGHT).fill({ color: C.flashRed, alpha: borderFade * 0.6 });
        // Right
        this.rect(GAME_WIDTH - w, 0, w, GAME_HEIGHT).fill({ color: C.flashRed, alpha: borderFade * 0.6 });
      }
    }

    if (!this.flashActive && !this.borderActive) {
      this.clear();
      this.visible = false;
    }
  }

  reset() {
    this.flashActive = false;
    this.borderActive = false;
    this.clear();
    this.visible = false;
  }
}
