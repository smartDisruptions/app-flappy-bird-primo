import { Container, Text, Graphics } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, MEDAL_BRONZE, MEDAL_SILVER, MEDAL_GOLD, C } from '../game/constants';

export class DeathScreen extends Container {
  private panel: Container;
  private titleText: Text;
  private scoreText: Text;
  private bestText: Text;
  private medalText: Text;
  private retryText: Text;
  private shareText: Text;
  private panelBg: Graphics;
  private slideTimer = 0;
  private slideIn = false;
  private targetY: number;
  private currentScore = 0;

  constructor() {
    super();
    this.visible = false;

    this.panel = new Container();
    this.addChild(this.panel);

    // Panel background
    this.panelBg = new Graphics();
    this.panel.addChild(this.panelBg);

    this.titleText = new Text({
      text: 'GAME OVER',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 16,
        fill: 0xFF6B35,
        stroke: { color: 0x2D2D2D, width: 3 },
        align: 'center',
      },
    });
    this.titleText.anchor.set(0.5);
    this.panel.addChild(this.titleText);

    this.scoreText = new Text({
      text: 'SCORE: 0',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 2 },
      },
    });
    this.scoreText.anchor.set(0.5);
    this.panel.addChild(this.scoreText);

    this.bestText = new Text({
      text: 'BEST: 0',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        fill: 0xFFE66D,
        stroke: { color: 0x2D2D2D, width: 2 },
      },
    });
    this.bestText.anchor.set(0.5);
    this.panel.addChild(this.bestText);

    this.medalText = new Text({
      text: '',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 20,
        fill: 0xFFFFFF,
      },
    });
    this.medalText.anchor.set(0.5);
    this.panel.addChild(this.medalText);

    this.retryText = new Text({
      text: 'TAP TO RETRY',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 9,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 2 },
      },
    });
    this.retryText.anchor.set(0.5);
    this.panel.addChild(this.retryText);

    this.shareText = new Text({
      text: '[SHARE]',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 8,
        fill: 0x7EC8E3,
        stroke: { color: 0x2D2D2D, width: 2 },
      },
    });
    this.shareText.anchor.set(0.5);
    this.shareText.eventMode = 'static';
    this.shareText.cursor = 'pointer';
    this.shareText.on('pointerdown', () => this.share());
    this.panel.addChild(this.shareText);

    this.targetY = GAME_HEIGHT * 0.35;
    this.layoutPanel();
  }

  private layoutPanel() {
    const pw = 200, ph = 180;
    const cx = GAME_WIDTH / 2;

    this.panelBg.clear();
    // Shadow
    this.panelBg.roundRect(cx - pw / 2 + 3, 3, pw, ph, 8).fill({ color: 0x000000, alpha: 0.3 });
    // Main panel
    this.panelBg.roundRect(cx - pw / 2, 0, pw, ph, 8).fill({ color: 0x533E2D, alpha: 0.92 });
    // Inner panel
    this.panelBg.roundRect(cx - pw / 2 + 4, 4, pw - 8, ph - 8, 6).fill({ color: 0x3D2B1F, alpha: 0.5 });

    this.titleText.x = cx;
    this.titleText.y = 24;

    this.medalText.x = cx - 50;
    this.medalText.y = 70;

    this.scoreText.x = cx + 10;
    this.scoreText.y = 58;

    this.bestText.x = cx + 10;
    this.bestText.y = 80;

    this.retryText.x = cx;
    this.retryText.y = 120;

    this.shareText.x = cx;
    this.shareText.y = 150;
  }

  show(score: number, best: number) {
    this.visible = true;
    this.currentScore = score;
    this.scoreText.text = `SCORE: ${score}`;
    this.bestText.text = `BEST: ${best}`;

    // Medal
    if (score >= MEDAL_GOLD) this.medalText.text = '🥇';
    else if (score >= MEDAL_SILVER) this.medalText.text = '🥈';
    else if (score >= MEDAL_BRONZE) this.medalText.text = '🥉';
    else this.medalText.text = '';

    this.slideIn = true;
    this.slideTimer = 0;
    this.panel.y = GAME_HEIGHT;
  }

  hide() {
    this.visible = false;
    this.slideIn = false;
  }

  update(dt: number) {
    if (!this.visible) return;
    if (this.slideIn) {
      this.slideTimer += dt;
      const t = Math.min(1, this.slideTimer / 0.4);
      // Elastic ease
      const ease = t < 1 ? 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 0.5) : 1;
      this.panel.y = GAME_HEIGHT + (this.targetY - GAME_HEIGHT) * ease;
      if (t >= 1) this.slideIn = false;
    }

    // Pulse retry text
    this.retryText.alpha = 0.5 + 0.5 * Math.sin(Date.now() / 400);
  }

  private share() {
    const url = new URL(window.location.href);
    url.searchParams.set('score', String(this.currentScore));
    const text = `I scored ${this.currentScore} in Flappy Bird Primo! Can you beat me? ${url.toString()}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.shareText.text = '[COPIED!]';
        setTimeout(() => { this.shareText.text = '[SHARE]'; }, 1500);
      });
    }
  }
}
