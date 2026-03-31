import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, C } from '../game/constants';

export class Background extends Container {
  private sky: Graphics;
  private cloudLayers: Container[] = [];
  private cloudData: { sprite: Sprite; speed: number }[] = [];

  constructor(cloudTextures: Texture[]) {
    super();

    // Gradient sky
    this.sky = new Graphics();
    this.drawSky();
    this.addChild(this.sky);

    // Cloud layers (3 depth layers)
    const speeds = [8, 15, 25];
    for (let layer = 0; layer < 3; layer++) {
      const cont = new Container();
      cont.alpha = 0.4 + layer * 0.15;
      this.addChild(cont);
      this.cloudLayers.push(cont);

      const count = 3 + layer;
      for (let i = 0; i < count; i++) {
        const tex = cloudTextures[layer % cloudTextures.length];
        const s = new Sprite(tex);
        s.x = Math.random() * (GAME_WIDTH + 100) - 50;
        s.y = 30 + Math.random() * (GROUND_Y * 0.5);
        s.scale.set(1.5 - layer * 0.3);
        s.alpha = 0.6 + Math.random() * 0.3;
        cont.addChild(s);
        this.cloudData.push({ sprite: s, speed: speeds[layer] });
      }
    }
  }

  private drawSky() {
    this.sky.clear();
    const steps = 32;
    const h = GROUND_Y / steps;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const r = this.lerp((C.skyTop >> 16) & 0xFF, (C.skyBottom >> 16) & 0xFF, t);
      const g = this.lerp((C.skyTop >> 8) & 0xFF, (C.skyBottom >> 8) & 0xFF, t);
      const b = this.lerp(C.skyTop & 0xFF, C.skyBottom & 0xFF, t);
      const color = (r << 16) | (g << 8) | b;
      this.sky.rect(0, i * h, GAME_WIDTH, h + 1).fill(color);
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return Math.round(a + (b - a) * t);
  }

  update(dt: number) {
    for (const cd of this.cloudData) {
      cd.sprite.x -= cd.speed * dt;
      if (cd.sprite.x < -80) {
        cd.sprite.x = GAME_WIDTH + 20 + Math.random() * 40;
        cd.sprite.y = 30 + Math.random() * (GROUND_Y * 0.5);
      }
    }
  }

  reset() {
    for (const cd of this.cloudData) {
      cd.sprite.x = Math.random() * (GAME_WIDTH + 100) - 50;
    }
  }
}
