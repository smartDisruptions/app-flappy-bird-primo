import { Container, Text } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../game/constants';

export class StartScreen extends Container {
  private title: Text;
  private prompt: Text;
  private bestLabel: Text;
  private elapsed = 0;

  constructor() {
    super();

    this.title = new Text({
      text: 'FLAPPY BIRD\n   PRIMO',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 18,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 4 },
        align: 'center',
        lineHeight: 28,
      },
    });
    this.title.anchor.set(0.5);
    this.title.x = GAME_WIDTH / 2;
    this.title.y = GAME_HEIGHT * 0.22;
    this.addChild(this.title);

    this.prompt = new Text({
      text: 'TAP TO PLAY',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 11,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 3 },
        align: 'center',
      },
    });
    this.prompt.anchor.set(0.5);
    this.prompt.x = GAME_WIDTH / 2;
    this.prompt.y = GAME_HEIGHT * 0.58;
    this.addChild(this.prompt);

    this.bestLabel = new Text({
      text: '',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        fill: 0xFFE66D,
        stroke: { color: 0x2D2D2D, width: 2 },
        align: 'center',
      },
    });
    this.bestLabel.anchor.set(0.5);
    this.bestLabel.x = GAME_WIDTH / 2;
    this.bestLabel.y = GAME_HEIGHT * 0.28 + 30;
    this.addChild(this.bestLabel);
  }

  show(bestScore: number | null) {
    this.visible = true;
    this.elapsed = 0;
    if (bestScore !== null && bestScore > 0) {
      this.bestLabel.text = `BEST: ${bestScore}`;
      this.bestLabel.visible = true;
    } else {
      this.bestLabel.visible = false;
    }
  }

  hide() {
    this.visible = false;
  }

  update(dt: number) {
    if (!this.visible) return;
    this.elapsed += dt;
    // Pulse tap prompt
    this.prompt.alpha = 0.5 + 0.5 * Math.sin(this.elapsed * Math.PI * 2 / 0.8);
  }
}
