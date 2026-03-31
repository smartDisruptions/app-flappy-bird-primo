type Handler = (...args: any[]) => void;

export class EventBus {
  private map = new Map<string, Handler[]>();

  on(event: string, fn: Handler) {
    if (!this.map.has(event)) this.map.set(event, []);
    this.map.get(event)!.push(fn);
  }

  off(event: string, fn: Handler) {
    const arr = this.map.get(event);
    if (arr) {
      const i = arr.indexOf(fn);
      if (i !== -1) arr.splice(i, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    const arr = this.map.get(event);
    if (arr) for (const fn of arr) fn(...args);
  }
}
