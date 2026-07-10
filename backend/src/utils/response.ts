// Standardized API Response Helper
// Follows API.md Response Standards: success, data, metadata, error

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
    [key: string]: unknown;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ResponseHelper {
  static success<T>(
    data: T,
    messageOrMetadata?: string | Partial<ApiResponse['metadata']>
  ): ApiResponse<T> {
    // If second argument is a string, treat it as a message in metadata
    const metadata: Partial<ApiResponse['metadata']> = {};
    if (typeof messageOrMetadata === 'string') {
      metadata.message = messageOrMetadata;
    } else if (messageOrMetadata) {
      Object.assign(metadata, messageOrMetadata);
    }

    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0',
        ...metadata,
      },
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMetadata,
    metadata?: Partial<ApiResponse['metadata']>
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0',
        ...metadata,
        pagination,
      },
    };
  }

  static error(code: string, message: string, details?: unknown): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };
  }

  static created<T>(data: T, metadata?: Partial<ApiResponse['metadata']>): ApiResponse<T> {
    return this.success(data, metadata);
  }

  static noContent(): ApiResponse {
    return {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0',
      },
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Alias for backward compatibility with existing controllers
// These MUST be defined AFTER the class declaration
export const successResponse = ResponseHelper.success;
export const errorResponse = ResponseHelper.error;
