interface PerformanceMetric {
  name: string;
  startTime: number;
  duration: number;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private marks: Record<string, number> = {};

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  mark(name: string): void {
    this.marks[name] = performance.now();
  }

  measure(name: string, startMark: string, context?: Record<string, any>): void {
    const startTime = this.marks[startMark];
    if (!startTime) {
      console.warn(`Start mark "${startMark}" not found`);
      return;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      startTime,
      duration,
      context,
    });

    // Clean up the mark
    delete this.marks[startMark];

    // Log if duration exceeds threshold
    if (duration > 1000) {
      console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  clearMetrics(): void {
    this.metrics = [];
    this.marks = {};
  }

  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.metrics.push({
        name,
        startTime: start,
        duration,
        context,
      });

      if (duration > 1000) {
        console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
      }
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();