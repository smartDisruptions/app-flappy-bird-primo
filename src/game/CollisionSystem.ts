import { Bird } from './Bird';
import { PipeManager, PipePairData } from './Pipe';
import { EventBus } from './EventBus';
import {
  PIPE_WIDTH, PIPE_CAP_W, PIPE_GAP, GROUND_Y, NEAR_MISS_THRESHOLD, BIRD_X,
} from './constants';

function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export class CollisionSystem {
  private events: EventBus;

  constructor(events: EventBus) {
    this.events = events;
  }

  check(bird: Bird, pipes: PipeManager) {
    if (bird.isTumbling) return;

    const hb = bird.getHitbox();

    // Ground collision
    if (hb.y + hb.height >= GROUND_Y) {
      this.events.emit('collision');
      return;
    }

    // Ceiling
    if (hb.y <= 0) {
      bird.y = hb.height / 2 + (bird.y - hb.y);
      bird.vy = 0;
    }

    const pipeOffset = (PIPE_CAP_W - PIPE_WIDTH) / 2;

    for (const p of pipes.pairs) {
      const pipeLeft = p.x + pipeOffset;
      const pipeRight = pipeLeft + PIPE_WIDTH;

      // Top pipe AABB
      const topBottom = p.gapY - PIPE_GAP / 2;
      if (aabbOverlap(hb.x, hb.y, hb.width, hb.height, pipeLeft, 0, PIPE_WIDTH, topBottom)) {
        this.events.emit('collision');
        return;
      }

      // Bottom pipe AABB
      const botTop = p.gapY + PIPE_GAP / 2;
      if (aabbOverlap(hb.x, hb.y, hb.width, hb.height, pipeLeft, botTop, PIPE_WIDTH, GROUND_Y - botTop)) {
        this.events.emit('collision');
        return;
      }

      // Pipe cap collision (wider)
      if (aabbOverlap(hb.x, hb.y, hb.width, hb.height, p.x, topBottom - 24, PIPE_CAP_W, 24)) {
        this.events.emit('collision');
        return;
      }
      if (aabbOverlap(hb.x, hb.y, hb.width, hb.height, p.x, botTop, PIPE_CAP_W, 24)) {
        this.events.emit('collision');
        return;
      }

      // Scoring: bird passed pipe center
      if (!p.scored && hb.x > pipeLeft + PIPE_WIDTH / 2) {
        p.scored = true;
        this.events.emit('score');
      }

      // Near-miss detection
      if (!p.nearMissed && hb.x + hb.width > pipeLeft && hb.x < pipeRight) {
        const distTop = hb.y - topBottom;
        const distBot = botTop - (hb.y + hb.height);
        if ((distTop > 0 && distTop < NEAR_MISS_THRESHOLD) ||
            (distBot > 0 && distBot < NEAR_MISS_THRESHOLD)) {
          p.nearMissed = true;
          this.events.emit('near-miss', bird.x, bird.y);
        }
      }
    }
  }
}
