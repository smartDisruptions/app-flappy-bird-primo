import { Texture } from 'pixi.js';
import { BIRD_WIDTH, BIRD_HEIGHT, PIPE_WIDTH, PIPE_CAP_W, PIPE_CAP_H, GROUND_HEIGHT, C } from '../game/constants';

function hex(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [cv, ctx];
}

function fillEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: number) {
  ctx.fillStyle = hex(color);
  for (let y = -ry; y <= ry; y++) {
    const xSpan = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    ctx.fillRect(cx - xSpan, cy + y, xSpan * 2 + 1, 1);
  }
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: number) {
  ctx.fillStyle = hex(color);
  ctx.fillRect(x, y, w, h);
}

function texFromCanvas(cv: HTMLCanvasElement): Texture {
  const tex = Texture.from(cv);
  tex.source.scaleMode = 'nearest';
  return tex;
}

// ── Bird frames ──
function makeBirdFrame(wingY: number): Texture {
  const [cv, ctx] = makeCanvas(BIRD_WIDTH, BIRD_HEIGHT);
  const cx = 14, cy = 12;

  // Outline
  fillEllipse(ctx, cx, cy, 12, 10, C.birdOutline);
  // Body
  fillEllipse(ctx, cx, cy, 11, 9, C.bird);
  // Belly
  fillEllipse(ctx, cx - 1, cy + 3, 8, 5, C.birdBelly);
  // Wing
  fillEllipse(ctx, cx - 4, wingY, 6, 3, C.birdWing);
  // Eye white
  fillEllipse(ctx, cx + 8, cy - 3, 4, 4, C.birdEye);
  // Pupil
  fillEllipse(ctx, cx + 9, cy - 3, 2, 2, C.birdPupil);
  // Eye highlight
  rect(ctx, cx + 8, cy - 5, 1, 1, 0xFFFFFF);
  // Upper beak
  rect(ctx, 26, cy - 1, 6, 3, C.birdBeak);
  rect(ctx, 27, cy - 2, 4, 1, C.birdBeak);
  // Lower beak
  rect(ctx, 26, cy + 2, 5, 2, C.birdBeakLo);

  return texFromCanvas(cv);
}

// ── Pipe body (1px tall tile) ──
function makePipeBody(): Texture {
  const [cv, ctx] = makeCanvas(PIPE_WIDTH, 2);
  rect(ctx, 0, 0, PIPE_WIDTH, 2, C.pipe);
  rect(ctx, 2, 0, 8, 2, C.pipeHi);
  rect(ctx, PIPE_WIDTH - 8, 0, 6, 2, C.pipeSh);
  return texFromCanvas(cv);
}

// ── Pipe cap ──
function makePipeCap(): Texture {
  const [cv, ctx] = makeCanvas(PIPE_CAP_W, PIPE_CAP_H);
  // Shadow base
  rect(ctx, 0, 0, PIPE_CAP_W, PIPE_CAP_H, C.pipeCapSh);
  // Main cap
  rect(ctx, 1, 1, PIPE_CAP_W - 2, PIPE_CAP_H - 2, C.pipeCap);
  // Highlight
  rect(ctx, 3, 2, 10, PIPE_CAP_H - 4, C.pipeCapHi);
  // Top/bottom border
  rect(ctx, 0, 0, PIPE_CAP_W, 2, C.pipeSh);
  rect(ctx, 0, PIPE_CAP_H - 2, PIPE_CAP_W, 2, C.pipeSh);
  return texFromCanvas(cv);
}

// ── Ground tile ──
function makeGround(): Texture {
  const w = 288;
  const [cv, ctx] = makeCanvas(w, GROUND_HEIGHT);
  // Dirt body
  rect(ctx, 0, 0, w, GROUND_HEIGHT, C.groundMid);
  // Green grass top
  rect(ctx, 0, 0, w, 4, C.groundTop);
  // Light line
  rect(ctx, 0, 4, w, 2, C.groundLine);
  // Bottom darker
  rect(ctx, 0, GROUND_HEIGHT - 20, w, 20, C.groundBot);
  // Dithered dirt pattern
  for (let x = 0; x < w; x += 12) {
    rect(ctx, x, 10 + (x % 24 === 0 ? 0 : 6), 4, 4, C.groundBot);
    rect(ctx, x + 6, 20 + (x % 36 === 0 ? 4 : 0), 3, 3, C.groundLine);
  }
  return texFromCanvas(cv);
}

// ── Cloud ──
function makeCloud(w: number, h: number): Texture {
  const [cv, ctx] = makeCanvas(w, h);
  const cx = w / 2, cy = h / 2;
  fillEllipse(ctx, cx, cy, (w / 2) | 0, (h / 2) | 0, C.cloudSh);
  fillEllipse(ctx, cx, cy - 1, ((w / 2) - 1) | 0, ((h / 2) - 1) | 0, C.cloud);
  return texFromCanvas(cv);
}

// ── Small particle textures ──
function makeParticle(color: number, size: number): Texture {
  const [cv, ctx] = makeCanvas(size, size);
  fillEllipse(ctx, (size / 2) | 0, (size / 2) | 0, (size / 2 - 1) | 0, (size / 2 - 1) | 0, color);
  return texFromCanvas(cv);
}

export class SpriteSheet {
  birdFrames: Texture[];
  pipeBody: Texture;
  pipeCap: Texture;
  ground: Texture;
  clouds: Texture[];
  feathers: Texture[];
  spark: Texture;

  constructor() {
    this.birdFrames = [
      makeBirdFrame(8),   // wing up
      makeBirdFrame(12),  // wing mid
      makeBirdFrame(16),  // wing down
    ];
    this.pipeBody = makePipeBody();
    this.pipeCap = makePipeCap();
    this.ground = makeGround();
    this.clouds = [
      makeCloud(48, 20),
      makeCloud(64, 24),
      makeCloud(36, 16),
    ];
    this.feathers = [
      makeParticle(C.feather1, 6),
      makeParticle(C.feather2, 5),
      makeParticle(C.feather3, 4),
    ];
    this.spark = makeParticle(C.spark, 4);
  }
}
