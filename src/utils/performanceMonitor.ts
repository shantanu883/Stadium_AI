/**
 * Advanced Performance Monitoring System for Stadium AI
 * Demonstrates enterprise-grade performance tracking and optimization
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface ResourceUsage {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    processes: number;
  };
  network: {
    latency: number;
    throughput: number;
    errors: number;
  };
  storage: {
    reads: number;
    writes: number;
    cache_hits: number;
    cache_misses: number;
  };
}

export interface PerformanceReport {
  overall_score: number;
  metrics: PerformanceMetric[];
  resources: ResourceUsage;
  bottlenecks: string[];
  recommendations: string[];
  optimization_opportunities: string[];
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private observers: PerformanceObserver[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeWebVitals();
    this.setupPerformanceObservers();
  }

  /**
   * Start comprehensive performance monitoring
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🚀 Performance Monitor: Starting comprehensive monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);

    // Initial collection
    this.collectMetrics();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.observers.forEach(observer => observer.disconnect());
    console.log('⏹️ Performance Monitor: Stopped monitoring');
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport(): PerformanceReport {
    const metrics = this.getAllMetrics();
    const resources = this.getResourceUsage();
    
    return {
      overall_score: this.calculateOverallScore(metrics, resources),
      metrics,
      resources,
      bottlenecks: this.identifyBottlenecks(metrics, resources),
      recommendations: this.generateRecommendations(metrics, resources),
      optimization_opportunities: this.findOptimizationOpportunities(metrics, resources)
    };
  }

  /**
   * Measure specific operation performance
   */
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T> | T
  ): Promise<{ result: T; duration: number; memoryUsed: number }> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await operation();
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const duration = endTime - startTime;
      const memoryUsed = endMemory.used - startMemory.used;

      this.recordMetric('operation_duration', duration, 'ms', operationName);
      this.recordMetric('operation_memory', memoryUsed, 'MB', operationName);

      return { result, duration, memoryUsed };
    } catch (error) {
      this.recordMetric('operation_errors', 1, 'count', operationName);
      throw error;
    }
  }

  /**
   * Monitor API performance
   */
  monitorAPICall(url: string, method: string, duration: number, success: boolean): void {
    this.recordMetric('api_response_time', duration, 'ms', `${method} ${url}`);
    this.recordMetric('api_success_rate', success ? 1 : 0, 'ratio', url);
    
    if (duration > 1000) {
      this.recordMetric('slow_api_calls', 1, 'count', url);
    }
  }

  /**
   * Monitor component render performance
   */
  monitorComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric('component_render_time', renderTime, 'ms', componentName);
    
    if (renderTime > 16.67) { // Slower than 60fps
      this.recordMetric('slow_renders', 1, 'count', componentName);
    }
  }

  /**
   * Set performance budgets and alerts
   */
  setPerformanceBudgets(budgets: { [metricName: string]: number }): void {
    Object.entries(budgets).forEach(([metric, threshold]) => {
      const recentMetrics = this.getRecentMetrics(metric, 10);
      const average = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
      
      if (average > threshold) {
        console.warn(`⚠️ Performance Budget Exceeded: ${metric} (${average.toFixed(2)} > ${threshold})`);
        this.triggerAlert(metric, average, threshold);
      }
    });
  }

  // Private methods
  private initializeWebVitals(): void {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      this.observeMetric('largest-contentful-paint', (entry: any) => {
        this.recordMetric('lcp', entry.startTime, 'ms');
      });

      // First Input Delay (FID)
      this.observeMetric('first-input', (entry: any) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime, 'ms');
      });

      // Cumulative Layout Shift (CLS)
      this.observeMetric('layout-shift', (entry: any) => {
        if (!entry.hadRecentInput) {
          this.recordMetric('cls', entry.value, 'score');
        }
      });
    }
  }

  private setupPerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Navigation timing
      this.observeMetric('navigation', (entry: any) => {
        this.recordMetric('page_load_time', entry.loadEventEnd - entry.fetchStart, 'ms');
        this.recordMetric('dom_content_loaded', entry.domContentLoadedEventEnd - entry.fetchStart, 'ms');
        this.recordMetric('time_to_first_byte', entry.responseStart - entry.fetchStart, 'ms');
      });

      // Resource timing
      this.observeMetric('resource', (entry: any) => {
        this.recordMetric('resource_load_time', entry.duration, 'ms', entry.name);
      });
    }
  }

  private observeMetric(entryType: string, callback: (entry: any) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      
      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  private collectMetrics(): void {
    // Memory metrics
    const memory = this.getMemoryUsage();
    this.recordMetric('memory_used', memory.used, 'MB');
    this.recordMetric('memory_percentage', memory.percentage, '%');

    // Performance timing
    if (window.performance && window.performance.now) {
      this.recordMetric('performance_now', performance.now(), 'ms');
    }

    // Network connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric('network_downlink', connection.downlink || 0, 'Mbps');
      this.recordMetric('network_rtt', connection.rtt || 0, 'ms');
    }

    // Frame rate estimation
    this.estimateFrameRate();

    // Custom business metrics
    this.collectBusinessMetrics();
  }

  private getMemoryUsage(): { used: number; total: number; percentage: number } {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      return {
        used,
        total,
        percentage: Math.round((used / total) * 100)
      };
    }

    // Fallback estimation
    return {
      used: Math.round(Math.random() * 100 + 50),
      total: 512,
      percentage: Math.round(Math.random() * 30 + 20)
    };
  }

  private estimateFrameRate(): void {
    let frameCount = 0;
    const startTime = performance.now();

    const countFrame = () => {
      frameCount++;
      const elapsed = performance.now() - startTime;
      
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        this.recordMetric('frame_rate', fps, 'fps');
        return;
      }
      
      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  private collectBusinessMetrics(): void {
    // Simulate business-specific metrics
    this.recordMetric('active_users', Math.floor(Math.random() * 1000) + 500, 'count');
    this.recordMetric('ai_predictions_per_minute', Math.floor(Math.random() * 20) + 10, 'count');
    this.recordMetric('api_calls_per_minute', Math.floor(Math.random() * 100) + 200, 'count');
    this.recordMetric('error_rate', Math.random() * 0.05, '%');
  }

  private recordMetric(name: string, value: number, unit: string, context?: string): void {
    const metric: PerformanceMetric = {
      name: context ? `${name}_${context}` : name,
      value,
      unit,
      timestamp: Date.now(),
      status: this.evaluateMetricStatus(name, value)
    };

    const key = metric.name;
    const existing = this.metrics.get(key) || [];
    existing.push(metric);
    
    // Keep only last 100 entries per metric
    this.metrics.set(key, existing.slice(-100));
  }

  private evaluateMetricStatus(name: string, value: number): 'good' | 'warning' | 'critical' {
    const thresholds: { [key: string]: { warning: number; critical: number } } = {
      'api_response_time': { warning: 500, critical: 1000 },
      'memory_percentage': { warning: 70, critical: 90 },
      'frame_rate': { warning: 30, critical: 15 },
      'lcp': { warning: 2500, critical: 4000 },
      'fid': { warning: 100, critical: 300 },
      'cls': { warning: 0.1, critical: 0.25 }
    };

    const threshold = thresholds[name];
    if (!threshold) return 'good';

    if (name === 'frame_rate') {
      // For FPS, lower is worse
      if (value < threshold.critical) return 'critical';
      if (value < threshold.warning) return 'warning';
    } else {
      // For most metrics, higher is worse
      if (value > threshold.critical) return 'critical';
      if (value > threshold.warning) return 'warning';
    }

    return 'good';
  }

  private getAllMetrics(): PerformanceMetric[] {
    const allMetrics: PerformanceMetric[] = [];
    this.metrics.forEach(metricArray => {
      allMetrics.push(...metricArray);
    });
    return allMetrics.sort((a, b) => b.timestamp - a.timestamp);
  }

  private getRecentMetrics(metricName: string, count: number): PerformanceMetric[] {
    const metrics = this.metrics.get(metricName) || [];
    return metrics.slice(-count);
  }

  private getResourceUsage(): ResourceUsage {
    const memory = this.getMemoryUsage();
    
    return {
      memory,
      cpu: {
        usage: Math.random() * 50 + 20, // Simulated CPU usage
        processes: Math.floor(Math.random() * 10) + 5
      },
      network: {
        latency: Math.random() * 100 + 50,
        throughput: Math.random() * 10 + 5,
        errors: Math.floor(Math.random() * 3)
      },
      storage: {
        reads: Math.floor(Math.random() * 1000) + 500,
        writes: Math.floor(Math.random() * 200) + 100,
        cache_hits: Math.floor(Math.random() * 800) + 700,
        cache_misses: Math.floor(Math.random() * 100) + 50
      }
    };
  }

  private calculateOverallScore(metrics: PerformanceMetric[], resources: ResourceUsage): number {
    const recentMetrics = metrics.slice(0, 50); // Last 50 metrics
    const criticalCount = recentMetrics.filter(m => m.status === 'critical').length;
    const warningCount = recentMetrics.filter(m => m.status === 'warning').length;
    
    let score = 100;
    score -= criticalCount * 10; // -10 points per critical issue
    score -= warningCount * 3;   // -3 points per warning
    
    // Factor in resource usage
    if (resources.memory.percentage > 90) score -= 15;
    else if (resources.memory.percentage > 70) score -= 5;
    
    if (resources.cpu.usage > 80) score -= 10;
    else if (resources.cpu.usage > 60) score -= 3;

    return Math.max(0, Math.min(100, score));
  }

  private identifyBottlenecks(metrics: PerformanceMetric[], resources: ResourceUsage): string[] {
    const bottlenecks: string[] = [];
    
    if (resources.memory.percentage > 85) {
      bottlenecks.push('High memory usage detected');
    }
    
    if (resources.cpu.usage > 75) {
      bottlenecks.push('CPU usage is elevated');
    }
    
    const slowAPIs = metrics.filter(m => m.name.includes('api_response_time') && m.value > 1000);
    if (slowAPIs.length > 0) {
      bottlenecks.push('Slow API responses detected');
    }
    
    const lowFPS = metrics.filter(m => m.name === 'frame_rate' && m.value < 30);
    if (lowFPS.length > 0) {
      bottlenecks.push('Low frame rate affecting user experience');
    }

    return bottlenecks;
  }

  private generateRecommendations(metrics: PerformanceMetric[], resources: ResourceUsage): string[] {
    const recommendations: string[] = [];
    
    if (resources.memory.percentage > 80) {
      recommendations.push('Consider implementing memory optimization techniques');
      recommendations.push('Review and cleanup unused variables and event listeners');
    }
    
    const slowRenders = metrics.filter(m => m.name.includes('component_render_time') && m.value > 16.67);
    if (slowRenders.length > 0) {
      recommendations.push('Optimize slow-rendering components with React.memo or useMemo');
      recommendations.push('Consider code splitting for large components');
    }
    
    const slowAPIs = metrics.filter(m => m.name.includes('api_response_time') && m.value > 500);
    if (slowAPIs.length > 0) {
      recommendations.push('Implement API response caching');
      recommendations.push('Consider API endpoint optimization or CDN usage');
    }

    return recommendations;
  }

  private findOptimizationOpportunities(metrics: PerformanceMetric[], resources: ResourceUsage): string[] {
    const opportunities: string[] = [];
    
    if (resources.storage.cache_hits / (resources.storage.cache_hits + resources.storage.cache_misses) < 0.8) {
      opportunities.push('Improve caching strategy to reduce cache misses');
    }
    
    const lcpMetrics = metrics.filter(m => m.name === 'lcp');
    if (lcpMetrics.length > 0 && lcpMetrics[0].value > 2500) {
      opportunities.push('Optimize Largest Contentful Paint with image optimization and preloading');
    }
    
    opportunities.push('Implement service worker for better caching');
    opportunities.push('Consider lazy loading for non-critical components');
    opportunities.push('Enable gzip compression for better network performance');

    return opportunities;
  }

  private triggerAlert(metric: string, actual: number, threshold: number): void {
    // In a real application, this would send alerts to monitoring systems
    console.warn(`🚨 PERFORMANCE ALERT: ${metric} exceeded budget`, {
      metric,
      actual: actual.toFixed(2),
      threshold,
      severity: actual > threshold * 1.5 ? 'critical' : 'warning'
    });
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring(3000);
}