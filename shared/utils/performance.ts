// Performance monitoring and optimization utilities

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
  memoryUsage?: number;
  timestamp: number;
}

// Performance observer for monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric({
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              timestamp: Date.now()
            });
          }
        });
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        });
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  getMemoryUsage(): number | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Performance measurement utilities
export const measurePerformance = {
  // Measure function execution time
  measureFunction: <T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();

      console.log(`${name || fn.name} took ${end - start}ms`);

      return result;
    }) as T;
  },

  // Measure async function execution time
  measureAsyncFunction: <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name?: string
  ): T => {
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();

      console.log(`${name || fn.name} took ${end - start}ms`);

      return result;
    }) as T;
  },

  // Measure component render time
  measureRender: (componentName: string) => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      console.log(`${componentName} render took ${end - start}ms`);
    };
  }
};

// Bundle size analysis utilities
export const bundleAnalysis = {
  // Estimate bundle size impact of imports
  estimateImportSize: (moduleName: string): Promise<number> => {
    return new Promise((resolve) => {
      // Skip dynamic import in SSR or if module name is invalid
      if (typeof window === 'undefined' || !moduleName || moduleName.includes('<dynamic>')) {
        resolve(0);
        return;
      }

      const start = performance.now();
      
      // Use a safer approach - just resolve with 0 for now to avoid build issues
      // In a real implementation, this would need proper module resolution
      resolve(0);
    });
  },

  // Get current bundle information
  getBundleInfo: () => {
    if (typeof window === 'undefined') return null;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    return {
      scriptCount: scripts.length,
      stylesheetCount: stylesheets.length,
      scripts: scripts.map(script => ({
        src: (script as HTMLScriptElement).src,
        async: (script as HTMLScriptElement).async,
        defer: (script as HTMLScriptElement).defer
      })),
      stylesheets: stylesheets.map(link => ({
        href: (link as HTMLLinkElement).href
      }))
    };
  }
};

// React performance utilities
export const reactPerformance = {
  // HOC for measuring component performance
  withPerformanceMonitoring: <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    componentName?: string
  ) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name;

    return React.memo((props: P) => {
      const renderEnd = measurePerformance.measureRender(name);

      React.useEffect(() => {
        renderEnd();
      });

      return React.createElement(WrappedComponent, props);
    });
  },

  // Hook for measuring component lifecycle
  usePerformanceMonitoring: (componentName: string) => {
    const [renderTime, setRenderTime] = React.useState<number>(0);
    const renderStart = React.useRef<number>(0);

    React.useLayoutEffect(() => {
      renderStart.current = performance.now();
    });

    React.useEffect(() => {
      const end = performance.now();
      const time = end - renderStart.current;
      setRenderTime(time);

      console.log(`${componentName} render time: ${time}ms`);
    });

    return { renderTime };
  }
};

// Memory management utilities
export const memoryManagement = {
  // Force garbage collection (if available)
  forceGC: () => {
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  },

  // Monitor memory usage
  getMemoryInfo: () => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
      totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      usage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100) // %
    };
  },

  // Check for memory leaks
  checkMemoryLeaks: (threshold: number = 50) => {
    const info = memoryManagement.getMemoryInfo();
    if (info && info.usage > threshold) {
      console.warn(`High memory usage detected: ${info.usage}%`);
      return true;
    }
    return false;
  }
};

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React import for the performance utilities
import React from 'react';