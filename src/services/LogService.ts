export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

interface LogFilter {
  level?: LogLevel[];
  context?: string[];
  startDate?: number;
  endDate?: number;
  search?: string;
}

class LogServiceClass {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private logLevel: LogLevel = 'info';
  private listeners: ((entry: LogEntry) => void)[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Set log level based on environment
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const debugMode = urlParams.get('debug') === 'true' || 
                       localStorage.getItem('debug') === 'true';
      
      this.logLevel = debugMode ? 'debug' : 'info';
    }
  }

  // Log methods
  debug(message: string, context?: string, data?: any): void {
    this.log('debug', message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log('info', message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log('warn', message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log('error', message, context, data);
  }

  // Generic log method
  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level,
      message,
      context,
      data,
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    this.addEntry(entry);
    this.notifyListeners(entry);
    this.consoleLog(entry);
  }

  // Add log entry
  private addEntry(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  // Console logging
  private consoleLog(entry: LogEntry): void {
    const prefix = `[${new Date(entry.timestamp).toISOString()}] ${entry.level.toUpperCase()}`;
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const message = `${prefix}${contextStr}: ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.data);
        break;
      case 'info':
        console.info(message, entry.data);
        break;
      case 'warn':
        console.warn(message, entry.data);
        break;
      case 'error':
        console.error(message, entry.data);
        break;
    }
  }

  // Get logs with filtering
  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level && filter.level.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.level!.includes(log.level));
      }

      if (filter.context && filter.context.length > 0) {
        filteredLogs = filteredLogs.filter(log => 
          log.context && filter.context!.includes(log.context)
        );
      }

      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!);
      }

      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
          log.message.toLowerCase().includes(searchLower) ||
          (log.context && log.context.toLowerCase().includes(searchLower))
        );
      }
    }

    return filteredLogs;
  }

  // Get logs by context
  getLogsByContext(context: string): LogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get recent logs
  getRecentLogs(minutes: number = 5): LogEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp >= cutoff);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    console.clear();
  }

  // Export logs
  exportLogs(filter?: LogFilter): string {
    const logs = this.getLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  // Download logs as file
  downloadLogs(filter?: LogFilter): void {
    const logs = this.exportLogs(filter);
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatvendas-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Set log level
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('Log level changed', 'LogService', { newLevel: level });
  }

  // Get current log level
  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  // Subscribe to log events
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get log statistics
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byContext: Record<string, number>;
    sessionId: string;
    oldestLog: number | null;
    newestLog: number | null;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0
    };

    const byContext: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level]++;
      
      if (log.context) {
        byContext[log.context] = (byContext[log.context] || 0) + 1;
      }
    });

    return {
      total: this.logs.length,
      byLevel,
      byContext,
      sessionId: this.sessionId,
      oldestLog: this.logs.length > 0 ? Math.min(...this.logs.map(l => l.timestamp)) : null,
      newestLog: this.logs.length > 0 ? Math.max(...this.logs.map(l => l.timestamp)) : null
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const LogService = new LogServiceClass();

// Convenience logger with context
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: any) => LogService.debug(message, context, data),
    info: (message: string, data?: any) => LogService.info(message, context, data),
    warn: (message: string, data?: any) => LogService.warn(message, context, data),
    error: (message: string, data?: any) => LogService.error(message, context, data)
  };
}