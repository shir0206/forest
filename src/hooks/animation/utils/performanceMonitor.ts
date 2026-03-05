/**
 * Performance monitoring utilities for animation hooks
 */

/**
 * Frame rate monitor to track animation smoothness
 */
export class FrameRateMonitor {
  private lastTime: number;
  private frames: number;
  private currentFps: number;
  private rafId: number | null = null;

  constructor() {
    this.lastTime = performance.now();
    this.frames = 0;
    this.currentFps = 60;
  }

  start(): void {
    if (this.rafId !== null) return;

    const measureFps = () => {
      this.frames++;
      const now = performance.now();

      if (now - this.lastTime >= 1000) {
        this.currentFps = this.frames;
        this.frames = 0;
        this.lastTime = now;
      }

      this.rafId = requestAnimationFrame(measureFps);
    };

    this.rafId = requestAnimationFrame(measureFps);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getFps(): number {
    return this.currentFps;
  }
}

/**
 * Memory usage tracker for detecting memory leaks
 */
export class MemoryMonitor {
  private memoryUsage: number | null = null;
  private intervalId: number | null = null;

  start(intervalMs: number = 5000): void {
    if (this.intervalId !== null) return;

    const checkMemory = () => {
      if ("memory" in performance) {
        const mem = (performance as any).memory;
        this.memoryUsage = mem.usedJSHeapSize / 1024 / 1024; // MB
      }
    };

    this.intervalId = window.setInterval(checkMemory, intervalMs);
    checkMemory(); // Initial check
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getMemoryUsage(): number | null {
    return this.memoryUsage;
  }
}

/**
 * Animation performance tracker
 */
export class AnimationPerformanceTracker {
  private frameTimes: number[] = [];
  private maxFrameTimes: number = 60; // Keep last 60 frame times (~1 second at 60fps)

  recordFrameTime(frameTime: number): void {
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxFrameTimes) {
      this.frameTimes.shift();
    }
  }

  getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((acc, time) => acc + time, 0);
    return sum / this.frameTimes.length;
  }

  getMinFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.min(...this.frameTimes);
  }

  getMaxFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    return Math.max(...this.frameTimes);
  }

  getFrameTimeVariance(): number {
    if (this.frameTimes.length === 0) return 0;

    const avg = this.getAverageFrameTime();
    const variance =
      this.frameTimes.reduce((acc, time) => {
        return acc + Math.pow(time - avg, 2);
      }, 0) / this.frameTimes.length;

    return Math.sqrt(variance);
  }

  clear(): void {
    this.frameTimes = [];
  }
}

/**
 * Hook for monitoring animation performance
 */
export function usePerformanceMonitor() {
  const fpsMonitor = new FrameRateMonitor();
  const memoryMonitor = new MemoryMonitor();
  const animationTracker = new AnimationPerformanceTracker();

  return {
    fpsMonitor,
    memoryMonitor,
    animationTracker,
  };
}
