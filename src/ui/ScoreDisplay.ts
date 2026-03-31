import { Container, Text } from 'pixi.js';
import { GAME_WIDTH, SCORE_PULSE_SCALE, SCORE_PULSE_MS } from '../game/constants';

export class ScoreDisplay extends Container {
  private textLabel: Text;
  private pulseTimer = 0;
  private pulsing = false;
  private _score = 0;

  constructor() {
    super();
    this.textLabel = new Text({
      text: '0',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 32,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 4 },
        align: 'center',
      },
    });
    this.textLabel.anchor.set(0.5, 0);
    this.textLabel.x = GAME_WIDTH / 2;
    this.textLabel.y = 20;
    this.addChild(this.textLabel);
  }

  get score() { return this._score; }

  setScore(v: number) {
    this._score = v;
    this.textLabel.text = String(v);
    this.pulsing = true;
    this.pulseTimer = 0;
  }

  update(dt: number) {
    if (!this.pulsing) return;
    this.pulseTimer += dt;
    const t = this.pulseTimer / (SCORE_PULSE_MS / 1000);
    if (t >= 1) {
      this.pulsing = false;
      this.textLabel.scale.set(1);
      return;
    }
    const s = 1 + (SCORE_PULSE_SCALE - 1) * Math.sin(t * Math.PI);
    this.textLabel.scale.set(s);
  }

  reset() {
    this._score = 0;
    this.textLabel.text = '0';
    this.textLabel.scale.set(1);
    this.pulsing = false;
  }
}
