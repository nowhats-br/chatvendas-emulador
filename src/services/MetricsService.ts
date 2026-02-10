interface Metric {
  id: string;
  name: string;
  value: number;
  timestamp: number;
  type: 'counter' | 'gauge' | 'histogram';
  tags?: Record<string, string>;
}

interface MetricHistory {
  timestamp: number;
  value: number;
}

class MetricsServiceClass {
  private metrics = new Map<string, Metric>();
  private history = new Map<string, MetricHistory[]>();
  private maxHistorySize = 100;
  private listeners = new Map<string, Function[]>();

  // Increment a counter metric
  increment(name: string, value = 1, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    const existing = this.metrics.get(key);
    
    const metric: Metric = {
      id: key,
      name,
      value: (existing?.value || 0) + value,
      timestamp: Date.now(),
      type: 'counter',
      tags
    };

    this.metrics.set(key, metric);
    this.addToHistory(key, metric.value);
    this.notifyListeners(name, metric);
  }

  // Set a gauge metric
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    
    const metric: Metric = {
      id: key,
      name,
      value,
      timestamp: Date.now(),
      type: 'gauge',
      tags
    };

    this.metrics.set(key, metric);
    this.addToHistory(key, value);
    this.notifyListeners(name, metric);
  }

  // Record a histogram value
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    
    const metric: Metric = {
      id: key,
      name,
      value,
      timestamp: Date.now(),
      type: 'histogram',
      tags
    };

    this.metrics.set(key, metric);
    this.addToHistory(key, value);
    this.notifyListeners(name, metric);
  }

  // Get current metric value
  get(name: string, tags?: Record<string, string>): Metric | null {
    const key = this.getMetricKey(name, tags);
    return this.metrics.get(key) || null;
  }

  // Get all metrics
  getAll(): Metric[] {
    return Array.from(this.metrics.values());
  }

  // Get metrics by name pattern
  getByPattern(pattern: RegExp): Metric[] {
    return this.getAll().filter(metric => pattern.test(metric.name));
  }

  // Get metric history
  getHistory(name: string, tags?: Record<string, string>): MetricHistory[] {
    const key = this.getMetricKey(name, tags);
    return this.history.get(key) || [];
  }

  // Subscribe to metric changes
  subscribe(name: string, callback: (metric: Metric) => void): () => void {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, []);
    }
    
    this.listeners.get(name)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(name);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
    this.history.clear();
  }

  // Get performance metrics
  getPerformanceMetrics(): Record<string, any> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    const recentMetrics = this.getAll().filter(
      metric => metric.timestamp > oneMinuteAgo
    );

    return {
      totalMetrics: this.metrics.size,
      recentMetrics: recentMetrics.length,
      memoryUsage: this.getMemoryUsage(),
      uptime: this.getUptime()
    };
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags || Object.keys(tags).length === 0) {
      return name;
    }
    
    const tagString = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(',');
    
    return `${name}{${tagString}}`;
  }

  private addToHistory(key: string, value: number): void {
    if (!this.history.has(key)) {
      this.history.set(key, []);
    }
    
    const history = this.history.get(key)!;
    history.push({
      timestamp: Date.now(),
      value
    });
    
    // Keep only recent history
    if (history.length > this.maxHistorySize) {
      history.splice(0, history.length - this.maxHistorySize);
    }
  }

  private notifyListeners(name: string, metric: Metric): void {
    const listeners = this.listeners.get(name);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(metric);
        } catch (error) {
          console.error('Error in metric listener:', error);
        }
      });
    }
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      return (window.performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private getUptime(): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      return window.performance.now();
    }
    return 0;
  }
}

export const MetricsService = new MetricsServiceClass();

// Common metrics helpers
export const Metrics = {
  // Instance metrics
  instanceConnected: (instanceId: string) => 
    MetricsService.increment('instances.connected', 1, { instanceId }),
  
  instanceDisconnected: (instanceId: string) => 
    MetricsService.increment('instances.disconnected', 1, { instanceId }),
  
  instanceError: (instanceId: string, error: string) => 
    MetricsService.increment('instances.errors', 1, { instanceId, error }),

  // Message metrics
  messageSent: (instanceId: string) => 
    MetricsService.increment('messages.sent', 1, { instanceId }),
  
  messageReceived: (instanceId: string) => 
    MetricsService.increment('messages.received', 1, { instanceId }),
  
  messageError: (instanceId: string, error: string) => 
    MetricsService.increment('messages.errors', 1, { instanceId, error }),

  // Performance metrics
  apiResponseTime: (endpoint: string, duration: number) => 
    MetricsService.histogram('api.response_time', duration, { endpoint }),
  
  componentRenderTime: (component: string, duration: number) => 
    MetricsService.histogram('component.render_time', duration, { component }),

  // User interaction metrics
  userAction: (action: string, component: string) => 
    MetricsService.increment('user.actions', 1, { action, component }),
  
  pageView: (page: string) => 
    MetricsService.increment('user.page_views', 1, { page }),

  // System metrics
  activeConnections: (count: number) => 
    MetricsService.gauge('system.active_connections', count),
  
  memoryUsage: (bytes: number) => 
    MetricsService.gauge('system.memory_usage', bytes),
  
  cpuUsage: (percentage: number) => 
    MetricsService.gauge('system.cpu_usage', percentage)
};