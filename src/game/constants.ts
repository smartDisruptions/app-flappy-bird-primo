// ── Dimensions ──
export const GAME_WIDTH = 288;
export const GAME_HEIGHT = 512;

// ── Bird ──
export const BIRD_WIDTH = 34;
export const BIRD_HEIGHT = 24;
export const BIRD_HITBOX_W = 27;
export const BIRD_HITBOX_H = 19;
export const BIRD_X = 80;
export const GRAVITY = 1800;        // px/s²
export const FLAP_VELOCITY = -480;  // px/s
export const MAX_VELOCITY = 600;    // px/s
export const ROTATION_UP = -0.45;   // rad
export const ROTATION_DOWN = Math.PI / 2;
export const ROTATION_SPEED = 3.0;  // rad/s

// ── Pipes ──
export const PIPE_WIDTH = 52;
export const PIPE_CAP_W = 60;
export const PIPE_CAP_H = 24;
export const PIPE_GAP = 120;
export const PIPE_SPEED = 160;      // px/s
export const PIPE_SPAWN_INTERVAL = 1.5; // s
export const PIPE_MIN_Y = 80;
export const PIPE_MAX_Y = GAME_HEIGHT - 112 - 80;
export const PIPE_MAX_GAP_DELTA = 200;
export const FIRST_PIPE_GAP_Y = GAME_HEIGHT * 0.45;

// ── Ground ──
export const GROUND_HEIGHT = 112;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;
export const GROUND_SPEED = PIPE_SPEED;

// ── Near-miss ──
export const NEAR_MISS_THRESHOLD = 15;

// ── Timing ──
export const DT_MAX = 0.05;
export const DEATH_FLASH_MS = 50;
export const DEATH_SHAKE_MS = 300;
export const DEATH_PANEL_MS = 400;
export const DEATH_LOCKOUT_MS = 800;
export const DEATH_FREEZE_FRAMES = 3;

// ── Slow-mo ──
export const SLOW_MO_SCALE = 0.5;
export const SLOW_MO_DURATION = 0.3;

// ── Score ──
export const SCORE_PULSE_SCALE = 1.3;
export const SCORE_PULSE_MS = 200;

// ── Medals ──
export const MEDAL_BRONZE = 10;
export const MEDAL_SILVER = 25;
export const MEDAL_GOLD = 50;

// ── Particles ──
export const PARTICLE_POOL = 100;
export const FLAP_PARTICLES = 3;
export const DEATH_PARTICLES = 20;

// ── Palette (warm pastel) ──
export const C = {
  skyTop:     0x7EC8E3,
  skyBottom:  0xFFECD2,
  bird:       0xFFB07C,
  birdWing:   0xFF9A5C,
  birdBelly:  0xFFD4B8,
  birdBeak:   0xFF6B35,
  birdBeakLo: 0xE85D3A,
  birdEye:    0xFFFFFF,
  birdPupil:  0x333333,
  birdOutline:0x533E2D,
  pipe:       0x8FB996,
  pipeHi:     0xA8D5AF,
  pipeSh:     0x6B9B73,
  pipeCap:    0x7AAD82,
  pipeCapHi:  0x9CC8A4,
  pipeCapSh:  0x5F8A68,
  groundTop:  0x8BC34A,
  groundMid:  0xDED895,
  groundBot:  0xC4A265,
  groundLine: 0xE8D5A3,
  cloud:      0xFFFFFF,
  cloudSh:    0xE8F0FF,
  textWhite:  0xFFFFFF,
  outline:    0x2D2D2D,
  flashWhite: 0xFFFFFF,
  flashRed:   0xFF3333,
  feather1:   0xFFB07C,
  feather2:   0xFFD4B8,
  feather3:   0xFF9A5C,
  spark:      0xFFE66D,
} as const;
