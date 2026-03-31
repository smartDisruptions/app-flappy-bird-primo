import { Application, TextureSource } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from './game/constants';
import { SpriteSheet } from './rendering/SpriteSheet';
import { Game } from './game/Game';

async function boot() {
  // Global nearest-neighbor for pixel art
  TextureSource.defaultOptions.scaleMode = 'nearest';

  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x7EC8E3,
    antialias: false,
    roundPixels: true,
    resolution: 1,
  });

  document.body.appendChild(app.canvas);

  // Responsive scaling
  function resize() {
    const { innerWidth: vw, innerHeight: vh } = window;
    const ratio = GAME_WIDTH / GAME_HEIGHT;
    let w: number, h: number;
    if (vw / vh < ratio) {
      w = vw;
      h = vw / ratio;
    } else {
      h = vh;
      w = vh * ratio;
    }
    app.canvas.style.width = `${w}px`;
    app.canvas.style.height = `${h}px`;
  }
  window.addEventListener('resize', resize);
  resize();

  // Generate sprites
  const sprites = new SpriteSheet();

  // Create game
  const game = new Game(sprites);
  app.stage.addChild(game.worldContainer);
  app.stage.addChild(game.uiContainer);
  if (import.meta.env.DEV) {
    (window as any).__game = game;
    (window as any).__app = app;
  }

  // Input
  const onInput = (e: Event) => {
    e.preventDefault();
    game.handleInput();
  };
  app.canvas.addEventListener('pointerdown', onInput);
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      game.handleInput();
    }
  });

  // Game loop
  app.ticker.add((ticker) => {
    const dt = ticker.deltaMS / 1000;
    game.update(dt);
  });

  // FPS overlay (debug)
  if (window.location.hash === '#debug') {
    const fpsDiv = document.createElement('div');
    fpsDiv.style.cssText = 'position:fixed;top:4px;left:4px;color:#0f0;font:12px monospace;z-index:999;pointer-events:none';
    document.body.appendChild(fpsDiv);
    setInterval(() => {
      fpsDiv.textContent = `${Math.round(app.ticker.FPS)} FPS`;
    }, 500);
  }
}

boot().catch(console.error);
