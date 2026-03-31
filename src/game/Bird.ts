import { Container, Sprite, Texture } from 'pixi.js';
import {
  BIRD_WIDTH, BIRD_HEIGHT, BIRD_HITBOX_W, BIRD_HITBOX_H,
  BIRD_X, GRAVITY, FLAP_VELOCITY, MAX_VELOCITY,
  ROTATION_UP, ROTATION_DOWN, ROTATION_SPEED, GAME_HEIGHT, GROUND_Y,
} from './constants';

export class Bird extends Container {
  vy = 0;
  private sprite: Sprite;
  private frames: Texture[];
  private frameIndex = 1;
  private animTimer = 0;
  private _tumbling = false;

  constructor(frames: Texture[]) {
    super();
    this.frames = frames;
    this.sprite = new Sprite(frames[1]);
    this.sprite.anchor.set(0.5);
    this.sprite.width = BIRD_WIDTH;
    this.sprite.height = BIRD_HEIGHT;
    this.addChild(this.sprite);
    this.reset();
  }

  reset() {
    this.x = BIRD_X;
    this.y = GAME_HEIGHT * 0.4;
    this.vy = 0;
    this.rotation = 0;
    this._tumbling = false;
    this.frameIndex = 1;
    this.sprite.texture = this.frames[1];
    this.visible = true;
  }

  flap() {
    if (this._tumbling) return;
    this.vy = FLAP_VELOCITY;
    this.rotation = ROTATION_UP;
    this.frameIndex = 0;
    this.sprite.texture = this.frames[0];
    this.animTimer = 0;
  }

  tumble() {
    this._tumbling = true;
    this.vy = FLAP_VELOCITY * 0.6;
  }

  get isTumbling() { return this._tumbling; }

  update(dt: number) {
    // Gravity
    this.vy = Math.min(this.vy + GRAVITY * dt, MAX_VELOCITY);
    this.y += this.vy * dt;

    // Clamp to ground
    if (this.y > GROUND_Y - BIRD_HEIGHT / 2) {
      this.y = GROUND_Y - BIRD_HEIGHT / 2;
      this.vy = 0;
    }

    // Rotation
    if (this._tumbling) {
      this.rotation += 10 * dt;
    } else if (this.vy < 0) {
      this.rotation = ROTATION_UP;
    } else {
      this.rotation = Math.min(this.rotation + ROTATION_SPEED * dt, ROTATION_DOWN);
    }

    // Wing animation
    if (!this._tumbling) {
      this.animTimer += dt;
      if (this.animTimer > 0.1) {
        this.animTimer = 0;
        this.frameIndex = (this.frameIndex + 1) % 3;
        this.sprite.texture = this.frames[this.frameIndex];
      }
    }
  }

  // Idle bounce for start screen
  idleBounce(time: number) {
    this.y = GAME_HEIGHT * 0.4 + Math.sin(time * Math.PI * 2) * 4;
    this.rotation = 0;
    this.animTimer += 0.016;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      this.frameIndex = (this.frameIndex + 1) % 3;
      this.sprite.texture = this.frames[this.frameIndex];
    }
  }

  getHitbox() {
    const offX = (BIRD_WIDTH - BIRD_HITBOX_W) / 2;
    const offY = (BIRD_HEIGHT - BIRD_HITBOX_H) / 2;
    return {
      x: this.x - BIRD_WIDTH / 2 + offX,
      y: this.y - BIRD_HEIGHT / 2 + offY,
      width: BIRD_HITBOX_W,
      height: BIRD_HITBOX_H,
    };
  }
}
