export interface ErrorInfo {
  message: string;
  code?: string;
  status?: number;
  details?: any;
  timestamp: number;
  context?: string;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: any;
  public readonly timestamp: number;
  public readonly context?: string;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: any,
    context?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = Date.now();
    this.context = context;
  }

  toJSON(): ErrorInfo {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      context: this.context
    };
  }
}

export class NetworkError extends AppError {
  constructor(message: string, status?: number, details?: any) {
    super(message, 'NETWORK_ERROR', status, details, 'Network');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details, 'Validation');
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', 401, details, 'Authentication');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'NOT_FOUND', 404, details, 'NotFound');
  }
}

export class ServerError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'SERVER_ERROR', 500, details, 'Server');
  }
}

// Error Logger
class ErrorLogger {
  private logs: ErrorInfo[] = [];
  private maxLogs = 100;

  log(error: Error | AppError, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      timestamp: Date.now(),
      context
    };

    if (error instanceof AppError) {
      errorInfo.code = error.code;
      errorInfo.status = error.status;
      errorInfo.details = error.details;
      errorInfo.context = error.context || context;
    }

    this.logs.unshift(errorInfo);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error logged:', errorInfo);
    }
  }

  getLogs(): ErrorInfo[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogsByContext(context: string): ErrorInfo[] {
    return this.logs.filter(log => log.context === context);
  }
}

export const errorLogger = new ErrorLogger();

// Error Handler Utility
export function handleError(error: unknown, context?: string): AppError {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Try to determine error type based on message or properties
    if (error.message.includes('fetch') || error.message.includes('network')) {
      appError = new NetworkError(error.message);
    } else if (error.message.includes('validation') || error.message.includes('invalid')) {
      appError = new ValidationError(error.message);
    } else if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
      appError = new AuthError(error.message);
    } else if (error.message.includes('not found')) {
      appError = new NotFoundError(error.message);
    } else {
      appError = new ServerError(error.message);
    }
  } else {
    appError = new ServerError('Erro desconhecido', 'UNKNOWN_ERROR', 500, error);
  }

  errorLogger.log(appError, context);
  return appError;
}

// Retry utility
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  retryCondition?: (error: Error) => boolean;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    retryCondition = (error) => error instanceof NetworkError
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry if condition is not met or it's the last attempt
      if (!retryCondition(lastError) || attempt === maxAttempts) {
        throw handleError(lastError, 'Retry');
      }

      // Calculate delay
      const currentDelay = backoff === 'exponential' 
        ? delay * Math.pow(2, attempt - 1)
        : delay * attempt;

      console.warn(`🔄 Retry attempt ${attempt}/${maxAttempts} after ${currentDelay}ms`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw handleError(lastError!, 'Retry');
}