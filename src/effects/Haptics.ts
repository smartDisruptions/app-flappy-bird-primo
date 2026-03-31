/**
 * Haptic feedback using the Vibration API.
 * Falls back silently on devices/browsers that don't support it.
 */
export class Haptics {
  private supported: boolean;

  constructor() {
    this.supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  private vibrate(pattern: number | number[]) {
    if (this.supported) {
      navigator.vibrate(pattern);
    }
  }

  /** Light tap for flap input */
  flap() {
    this.vibrate(10);
  }

  /** Medium pulse for scoring */
  score() {
    this.vibrate(20);
  }

  /** Quick double-tap for near miss */
  nearMiss() {
    this.vibrate([15, 30, 15]);
  }

  /** Heavy rumble for death/collision */
  death() {
    this.vibrate([30, 50, 80, 50, 30]);
  }
}
