import { Container, Graphics, Text } from 'pixi.js';
import { EventBus } from './EventBus';
import { Bird } from './Bird';
import { PipeManager } from './Pipe';
import { Ground } from './Ground';
import { CollisionSystem } from './CollisionSystem';
import { Background } from '../rendering/Background';
import { SpriteSheet } from '../rendering/SpriteSheet';
import { ParticleSystem } from '../effects/ParticleSystem';
import { ScreenShake } from '../effects/ScreenShake';
import { SlowMotion } from '../effects/SlowMotion';
import { ScreenFlash } from '../effects/ScreenFlash';
import { TextPopup } from '../effects/TextPopup';
import { Haptics } from '../effects/Haptics';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { StartScreen } from '../ui/StartScreen';
import { DeathScreen } from '../ui/DeathScreen';
import {
  GAME_WIDTH, GAME_HEIGHT, DT_MAX, FLAP_VELOCITY,
  DEATH_FLASH_MS, DEATH_SHAKE_MS, DEATH_PANEL_MS, DEATH_LOCKOUT_MS,
  DEATH_FREEZE_FRAMES, DEATH_PARTICLES, FLAP_PARTICLES,
  GROUND_Y,
} from './constants';

export type GameState = 'start' | 'playing' | 'dead' | 'paused';

export class Game {
  state: GameState = 'start';
  worldContainer: Container;
  uiContainer: Container;

  private events: EventBus;
  private bird: Bird;
  private pipes: PipeManager;
  private ground: Ground;
  private background: Background;
  private collision: CollisionSystem;
  private particles: ParticleSystem;
  private shake: ScreenShake;
  private slowMo: SlowMotion;
  private flash: ScreenFlash;
  private textPopup: TextPopup;
  private haptics: Haptics;
  private scoreDisplay: ScoreDisplay;
  private startScreen: StartScreen;
  private deathScreen: DeathScreen;
  private pauseOverlay: Container;

  private scoreValue = 0;
  private bestScore: number;
  private deathTimer = 0;
  private deathPanelShown = false;
  private inputLocked = false;
  private freezeFrames = 0;
  private idleTime = 0;
  private prevState: GameState = 'start';

  constructor(sprites: SpriteSheet) {
    this.events = new EventBus();
    this.worldContainer = new Container();
    this.uiContainer = new Container();

    // Best score from localStorage
    this.bestScore = this.loadBest();

    // Check challenge URL
    const params = new URLSearchParams(window.location.search);
    const challengeScore = params.get('score');

    // Build world (z-order matters)
    this.background = new Background(sprites.clouds);
    this.worldContainer.addChild(this.background);

    this.pipes = new PipeManager(sprites.pipeBody, sprites.pipeCap);
    this.worldContainer.addChild(this.pipes);

    this.ground = new Ground(sprites.ground);
    this.worldContainer.addChild(this.ground);

    this.bird = new Bird(sprites.birdFrames);
    this.worldContainer.addChild(this.bird);

    this.particles = new ParticleSystem([...sprites.feathers, sprites.spark]);
    this.worldContainer.addChild(this.particles);

    this.textPopup = new TextPopup();
    this.worldContainer.addChild(this.textPopup);

    // Systems
    this.collision = new CollisionSystem(this.events);
    this.shake = new ScreenShake(this.worldContainer);
    this.slowMo = new SlowMotion();
    this.flash = new ScreenFlash();
    this.haptics = new Haptics();
    this.uiContainer.addChild(this.flash);

    // UI
    this.scoreDisplay = new ScoreDisplay();
    this.scoreDisplay.visible = false;
    this.uiContainer.addChild(this.scoreDisplay);

    this.startScreen = new StartScreen();
    this.uiContainer.addChild(this.startScreen);

    this.deathScreen = new DeathScreen();
    this.uiContainer.addChild(this.deathScreen);

    // Pause overlay
    this.pauseOverlay = new Container();
    this.pauseOverlay.visible = false;
    const pauseBg = new Graphics();
    pauseBg.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill({ color: 0x000000, alpha: 0.5 });
    this.pauseOverlay.addChild(pauseBg);
    const pauseText = new Text({
      text: 'PAUSED',
      style: {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 20,
        fill: 0xFFFFFF,
        stroke: { color: 0x2D2D2D, width: 4 },
      },
    });
    pauseText.anchor.set(0.5);
    pauseText.x = GAME_WIDTH / 2;
    pauseText.y = GAME_HEIGHT / 2;
    this.pauseOverlay.addChild(pauseText);
    this.uiContainer.addChild(this.pauseOverlay);

    // Event handlers
    this.events.on('collision', () => this.onDeath());
    this.events.on('score', () => this.onScore());
    this.events.on('near-miss', (x: number, y: number) => this.onNearMiss(x, y));

    // Visibility API
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') {
        this.prevState = 'playing';
        this.state = 'paused';
        this.pauseOverlay.visible = true;
      } else if (!document.hidden && this.state === 'paused') {
        this.state = this.prevState;
        this.pauseOverlay.visible = false;
      }
    });

    // Show start
    this.startScreen.show(challengeScore ? parseInt(challengeScore) : this.bestScore);
    this.bird.reset();
  }

  handleInput() {
    if (this.inputLocked) return;

    switch (this.state) {
      case 'start':
        this.state = 'playing';
        this.startScreen.hide();
        this.scoreDisplay.visible = true;
        this.scoreDisplay.reset();
        this.bird.reset();
        this.bird.flap();
        this.emitFlapParticles();
        this.haptics.flap();
        this.pipes.reset();
        this.scoreValue = 0;
        break;
      case 'playing':
        this.bird.flap();
        this.emitFlapParticles();
        this.haptics.flap();
        break;
      case 'dead':
        this.restart();
        break;
      case 'paused':
        this.state = this.prevState;
        this.pauseOverlay.visible = false;
        break;
    }
  }

  update(rawDt: number) {
    const dt = Math.min(rawDt, DT_MAX);

    if (this.state === 'paused') return;

    // Death freeze frames
    if (this.freezeFrames > 0) {
      this.freezeFrames--;
      this.deathTimer += dt;
      this.checkDeathTimeline();
      return;
    }

    const scaledDt = dt * this.slowMo.timeScale;

    switch (this.state) {
      case 'start':
        this.idleTime += dt;
        this.bird.idleBounce(this.idleTime);
        this.background.update(dt);
        this.ground.update(dt);
        this.startScreen.update(dt);
        break;

      case 'playing':
        this.bird.update(scaledDt);
        this.pipes.update(scaledDt);
        this.ground.update(scaledDt);
        this.collision.check(this.bird, this.pipes);
        this.background.update(scaledDt);
        this.particles.update(scaledDt);
        this.textPopup.update(scaledDt);
        this.scoreDisplay.update(dt);
        this.slowMo.update(dt);
        break;

      case 'dead':
        this.deathTimer += dt;
        this.bird.update(dt);
        this.particles.update(dt);
        this.flash.update(dt);
        this.shake.update(dt);
        this.textPopup.update(dt);
        this.deathScreen.update(dt);
        this.checkDeathTimeline();
        break;
    }
  }

  private onDeath() {
    if (this.state === 'dead') return;
    this.state = 'dead';
    this.inputLocked = true;
    this.deathTimer = 0;
    this.deathPanelShown = false;

    // Freeze frames
    this.freezeFrames = DEATH_FREEZE_FRAMES;
    this.slowMo.forceNormal();

    // Effects
    this.bird.tumble();
    this.flash.trigger();
    this.shake.trigger(DEATH_SHAKE_MS, 6);

    this.haptics.death();

    // Death explosion particles
    this.particles.burst(this.bird.x, this.bird.y, DEATH_PARTICLES, {
      speed: 300,
      life: 0.8,
      gravity: 500,
      spread: Math.PI * 2,
    });

    // Save best
    if (this.scoreValue > this.bestScore) {
      this.bestScore = this.scoreValue;
      this.saveBest(this.bestScore);
    }
  }

  private checkDeathTimeline() {
    if (this.deathTimer * 1000 >= DEATH_PANEL_MS && !this.deathPanelShown) {
      this.deathPanelShown = true;
      this.deathScreen.show(this.scoreValue, this.bestScore);
      this.scoreDisplay.visible = false;
    }
    if (this.deathTimer * 1000 >= DEATH_LOCKOUT_MS) {
      this.inputLocked = false;
    }
  }

  private onScore() {
    this.scoreValue++;
    this.scoreDisplay.setScore(this.scoreValue);
    this.haptics.score();
  }

  private onNearMiss(x: number, y: number) {
    this.slowMo.trigger();
    this.textPopup.trigger(x, y);
    this.haptics.nearMiss();
  }

  private emitFlapParticles() {
    this.particles.burst(
      this.bird.x - 10, this.bird.y + 5,
      FLAP_PARTICLES,
      { speed: 80, life: 0.3, gravity: 200, spread: Math.PI * 0.8 },
    );
  }

  private restart() {
    this.state = 'start';
    this.bird.reset();
    this.pipes.reset();
    this.ground.reset();
    this.background.reset();
    this.particles.reset();
    this.shake.reset();
    this.slowMo.reset();
    this.flash.reset();
    this.textPopup.reset();
    this.scoreDisplay.reset();
    this.scoreDisplay.visible = false;
    this.deathScreen.hide();
    this.startScreen.show(this.bestScore);
    this.scoreValue = 0;
    this.idleTime = 0;
    this.inputLocked = false;
  }

  private loadBest(): number {
    try {
      return parseInt(localStorage.getItem('flappy-primo-best') || '0') || 0;
    } catch { return 0; }
  }

  private saveBest(v: number) {
    try { localStorage.setItem('flappy-primo-best', String(v)); } catch {}
  }
}
