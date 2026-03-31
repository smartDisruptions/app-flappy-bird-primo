import { Container, Sprite, Texture } from 'pixi.js';
import { GAME_WIDTH, GROUND_Y, GROUND_SPEED } from './constants';

export class Ground extends Container {
  private tiles: Sprite[] = [];
  private tileW: number;
  private tex: Texture;

  constructor(tex: Texture) {
    super();
    this.tex = tex;
    this.tileW = GAME_WIDTH;

    // Two tiles for seamless scroll
    for (let i = 0; i < 2; i++) {
      const s = new Sprite(tex);
      s.x = i * this.tileW;
      s.y = GROUND_Y;
      this.tiles.push(s);
      this.addChild(s);
    }
  }

  reset() {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].x = i * this.tileW;
    }
  }

  update(dt: number) {
    for (const t of this.tiles) {
      t.x -= GROUND_SPEED * dt;
      if (t.x <= -this.tileW) {
        t.x += this.tileW * 2;
      }
    }
  }
}
