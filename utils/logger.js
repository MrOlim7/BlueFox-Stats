// ============================================
// BlueFox Stats v0.1 - Centralized Logger
// ============================================

const BlueFoxLogger = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  
  logLevel: 1, // INFO by default
  enableConsole: true,
  logs: [],
  maxLogs: 100,

  /**
   * Set the logging level
   */
  setLevel(level) {
    this.logLevel = level;
  },

  /**
   * Log debug message
   */
  debug(message, data = null) {
    this._log('DEBUG', message, data, this.DEBUG, '#7c3aed');
  },

  /**
   * Log info message
   */
  info(message, data = null) {
    this._log('INFO', message, data, this.INFO, '#3b82f6');
  },

  /**
   * Log warning
   */
  warn(message, data = null) {
    this._log('WARN', message, data, this.WARN, '#f59e0b');
  },

  /**
   * Log error
   */
  error(message, error = null) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;
    this._log('ERROR', message, errorData, this.ERROR, '#ef4444');
  },

  /**
   * Internal logging method
   */
  _log(label, message, data, level, color) {
    if (level < this.logLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: label,
      message,
      data
    };

    // Store in memory
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Log to console
    if (this.enableConsole) {
      const prefix = `%c[🦊 BlueFox ${label}]`;
      const style = `color: ${color}; font-weight: bold;`;
      if (data) {
        console.log(prefix, style, message, data);
      } else {
        console.log(prefix, style, message);
      }
    }
  },

  /**
   * Get all logs
   */
  getLogs(level = null) {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  },

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  },

  /**
   * Export logs as JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
};

// Add to window for access
if (typeof window !== 'undefined') {
  window.BlueFoxLogger = BlueFoxLogger;
}
