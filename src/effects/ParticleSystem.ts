import { Container, Sprite, Texture } from 'pixi.js';
import { PARTICLE_POOL } from '../game/constants';

interface Particle {
  sprite: Sprite;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gravity: number;
  active: boolean;
}

export class ParticleSystem extends Container {
  private pool: Particle[] = [];
  private textures: Texture[];

  constructor(textures: Texture[]) {
    super();
    this.textures = textures;

    for (let i = 0; i < PARTICLE_POOL; i++) {
      const sprite = new Sprite(textures[0]);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.addChild(sprite);
      this.pool.push({
        sprite,
        vx: 0, vy: 0,
        life: 0, maxLife: 0,
        gravity: 0,
        active: false,
      });
    }
  }

  private acquire(): Particle {
    // Find inactive
    for (const p of this.pool) {
      if (!p.active) return p;
    }
    // Force-reclaim oldest
    let oldest = this.pool[0];
    for (const p of this.pool) {
      if (p.life / p.maxLife > oldest.life / oldest.maxLife) {
        oldest = p;
      }
    }
    oldest.active = false;
    oldest.sprite.visible = false;
    return oldest;
  }

  burst(x: number, y: number, count: number, opts: {
    speed?: number;
    life?: number;
    gravity?: number;
    spread?: number;
    texIndex?: number;
  } = {}) {
    const { speed = 200, life = 0.5, gravity = 400, spread = Math.PI * 2, texIndex } = opts;

    for (let i = 0; i < count; i++) {
      const p = this.acquire();
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      const spd = speed * (0.5 + Math.random() * 0.5);

      p.active = true;
      p.sprite.visible = true;
      p.sprite.x = x + (Math.random() - 0.5) * 4;
      p.sprite.y = y + (Math.random() - 0.5) * 4;
      p.sprite.texture = this.textures[texIndex ?? (Math.random() * this.textures.length | 0)];
      p.sprite.alpha = 1;
      p.sprite.scale.set(0.8 + Math.random() * 0.6);
      p.sprite.rotation = Math.random() * Math.PI * 2;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.life = 0;
      p.maxLife = life * (0.7 + Math.random() * 0.6);
      p.gravity = gravity;
    }
  }

  update(dt: number) {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.sprite.visible = false;
        continue;
      }
      p.vy += p.gravity * dt;
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      p.sprite.rotation += dt * 3;

      const t = p.life / p.maxLife;
      p.sprite.alpha = 1 - t * t;
      p.sprite.scale.set((0.8 + Math.random() * 0.2) * (1 - t * 0.5));
    }
  }

  reset() {
    for (const p of this.pool) {
      p.active = false;
      p.sprite.visible = false;
    }
  }
}
