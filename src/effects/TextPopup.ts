import { Container, Text } from 'pixi.js';

export class TextPopup extends Container {
  private textLabel: Text;
  private elapsed = 0;
  private duration = 0.3;
  private active = false;

  constructor() {
    super();
    this.textLabel = new Text({
      text: 'CLOSE!',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        fill: 0xFFE66D,
        stroke: { color: 0x2D2D2D, width: 3 },
      },
    });
    this.textLabel.anchor.set(0.5);
    this.addChild(this.textLabel);
    this.visible = false;
  }

  trigger(x: number, y: number) {
    this.x = x;
    this.y = y - 20;
    this.elapsed = 0;
    this.active = true;
    this.visible = true;
    this.alpha = 1;
    this.scale.set(0.5);
  }

  update(dt: number) {
    if (!this.active) return;
    this.elapsed += dt;
    const t = Math.min(1, this.elapsed / this.duration);

    // Scale up then fade
    if (t < 0.4) {
      this.scale.set(0.5 + t * 2.5);
    } else {
      this.scale.set(1.5);
      this.alpha = 1 - (t - 0.4) / 0.6;
    }

    this.y -= 30 * dt;

    if (t >= 1) {
      this.active = false;
      this.visible = false;
    }
  }

  reset() {
    this.active = false;
    this.visible = false;
  }
}
