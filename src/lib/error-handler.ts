import { toast } from 'sonner';

interface ErrorDetails {
  message: string;
  code?: string;
  context?: Record<string, any>;
}

class AppError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor({ message, code = 'UNKNOWN_ERROR', context }: ErrorDetails) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
  }
}

export const errorHandler = {
  handle(error: unknown, fallbackMessage = 'An unexpected error occurred'): void {
    console.error('Error caught by handler:', error);

    if (error instanceof AppError) {
      // Handle known application errors
      toast.error(error.message, {
        description: error.context?.description,
      });

      // Log to monitoring service if needed
      if (process.env.NODE_ENV === 'production') {
        // TODO: Add proper error logging service
        console.error('Production error:', {
          code: error.code,
          message: error.message,
          context: error.context,
        });
      }
    } else if (error instanceof Error) {
      // Handle standard errors
      toast.error(error.message || fallbackMessage);
    } else {
      // Handle unknown errors
      toast.error(fallbackMessage);
    }
  },

  async handleAsync<T>(
    promise: Promise<T>,
    {
      loading = 'Loading...',
      success = 'Operation completed successfully',
      error = 'An error occurred',
    }: {
      loading?: string;
      success?: string;
      error?: string;
    } = {}
  ): Promise<T | null> {
    try {
      if (loading) {
        toast.loading(loading);
      }

      const result = await promise;

      if (success) {
        toast.success(success);
      }

      return result;
    } catch (err) {
      this.handle(err, error);
      return null;
    }
  },

  createError(details: ErrorDetails): AppError {
    return new AppError(details);
  },
};