// ============================================
// BlueFox Stats v0.1 - Global Error Handler
// ============================================

const BlueFoxErrorHandler = {
  /**
   * Initialize error handlers
   */
  init() {
    // Handle uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.handleError('Uncaught Error', event.error);
      });

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError('Unhandled Promise Rejection', event.reason);
      });
    }
  },

  /**
   * Handle errors with logging and user notification
   */
  handleError(title, error) {
    const errorObj = this.parseError(error);
    
    BlueFoxLogger.error(title, errorObj);

    // Try to notify user if possible
    try {
      this.notifyUser(title, errorObj.message);
    } catch (e) {
      // Silent fail - we don't want error handlers causing more errors
    }
  },

  /**
   * Parse error to structured format
   */
  parseError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }
    if (typeof error === 'string') {
      return {
        name: 'Error',
        message: error,
        stack: null
      };
    }
    return {
      name: 'Unknown Error',
      message: JSON.stringify(error),
      stack: null
    };
  },

  /**
   * Notify user of error via UI
   */
  notifyUser(title, message) {
    // This could be extended to show toast notifications, etc.
    if (typeof BlueFoxLogger !== 'undefined') {
      BlueFoxLogger.warn(`User notification: ${title} - ${message}`);
    }
  },

  /**
   * Safe async wrapper
   */
  async safeAsync(fn, context = null) {
    try {
      return await fn.call(context);
    } catch (error) {
      this.handleError('Async operation failed', error);
      throw error;
    }
  },

  /**
   * Safe function wrapper
   */
  safe(fn, fallback = null) {
    try {
      return fn();
    } catch (error) {
      this.handleError('Function execution failed', error);
      return fallback;
    }
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      BlueFoxErrorHandler.init();
    });
  } else {
    BlueFoxErrorHandler.init();
  }
}

if (typeof window !== 'undefined') {
  window.BlueFoxErrorHandler = BlueFoxErrorHandler;
}
