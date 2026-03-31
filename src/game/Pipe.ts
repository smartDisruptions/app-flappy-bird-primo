import { Container, Sprite, Texture, TilingSprite } from 'pixi.js';
import {
  PIPE_WIDTH, PIPE_CAP_W, PIPE_CAP_H, PIPE_GAP, PIPE_SPEED,
  PIPE_SPAWN_INTERVAL, PIPE_MIN_Y, PIPE_MAX_Y, PIPE_MAX_GAP_DELTA,
  FIRST_PIPE_GAP_Y, GAME_WIDTH, GROUND_Y,
} from './constants';

export interface PipePairData {
  x: number;
  gapY: number;
  scored: boolean;
  nearMissed: boolean;
}

export class PipeManager extends Container {
  pairs: PipePairData[] = [];
  private bodyTex: Texture;
  private capTex: Texture;
  private spawnTimer = 0;
  private lastGapY = FIRST_PIPE_GAP_Y;
  private pipeContainers: Container[] = [];
  private firstSpawn = true;

  constructor(bodyTex: Texture, capTex: Texture) {
    super();
    this.bodyTex = bodyTex;
    this.capTex = capTex;
  }

  reset() {
    this.pairs = [];
    this.spawnTimer = PIPE_SPAWN_INTERVAL - 0.5;
    this.lastGapY = FIRST_PIPE_GAP_Y;
    this.firstSpawn = true;
    for (const c of this.pipeContainers) {
      this.removeChild(c);
      c.destroy({ children: true });
    }
    this.pipeContainers = [];
  }

  update(dt: number) {
    this.spawnTimer += dt;
    if (this.spawnTimer >= PIPE_SPAWN_INTERVAL) {
      this.spawnTimer -= PIPE_SPAWN_INTERVAL;
      this.spawn();
    }

    // Move pipes
    for (let i = this.pairs.length - 1; i >= 0; i--) {
      const p = this.pairs[i];
      p.x -= PIPE_SPEED * dt;
      this.pipeContainers[i].x = p.x;

      // Remove off-screen
      if (p.x < -PIPE_CAP_W) {
        this.pairs.splice(i, 1);
        const cont = this.pipeContainers.splice(i, 1)[0];
        this.removeChild(cont);
        cont.destroy({ children: true });
      }
    }
  }

  private spawn() {
    let gapY: number;
    if (this.firstSpawn) {
      gapY = FIRST_PIPE_GAP_Y;
      this.firstSpawn = false;
    } else {
      const minY = Math.max(PIPE_MIN_Y, this.lastGapY - PIPE_MAX_GAP_DELTA);
      const maxY = Math.min(PIPE_MAX_Y, this.lastGapY + PIPE_MAX_GAP_DELTA);
      gapY = minY + Math.random() * (maxY - minY);
    }
    this.lastGapY = gapY;

    const x = GAME_WIDTH + 10;
    const pair: PipePairData = { x, gapY, scored: false, nearMissed: false };
    this.pairs.push(pair);

    const cont = new Container();
    cont.x = x;

    // Top pipe
    const topH = gapY - PIPE_GAP / 2;
    if (topH > 0) {
      const topBody = new TilingSprite({ texture: this.bodyTex, width: PIPE_WIDTH, height: topH });
      topBody.x = (PIPE_CAP_W - PIPE_WIDTH) / 2;
      topBody.y = 0;
      cont.addChild(topBody);
    }
    const topCap = new Sprite(this.capTex);
    topCap.y = topH - PIPE_CAP_H;
    topCap.x = 0;
    cont.addChild(topCap);

    // Bottom pipe
    const botY = gapY + PIPE_GAP / 2;
    const botH = GROUND_Y - botY;
    if (botH > 0) {
      const botBody = new TilingSprite({ texture: this.bodyTex, width: PIPE_WIDTH, height: botH });
      botBody.x = (PIPE_CAP_W - PIPE_WIDTH) / 2;
      botBody.y = botY;
      cont.addChild(botBody);
    }
    const botCap = new Sprite(this.capTex);
    botCap.y = botY;
    botCap.x = 0;
    cont.addChild(botCap);

    this.pipeContainers.push(cont);
    this.addChild(cont);
  }
}
