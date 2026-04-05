// ============================================
// BlueFox Stats v0.1 - Cache Manager
// ============================================

const BlueFoxCache = {
  store: new Map(),
  maxSize: 100,

  /**
   * Set a value in cache with optional TTL (in minutes)
   */
  set(key, value, ttlMinutes = 15) {
    if (this.store.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }

    this.store.set(key, {
      value,
      expires: Date.now() + (ttlMinutes * 60000),
      created: Date.now()
    });

    BlueFoxLogger.debug(`Cache SET: ${key} (TTL: ${ttlMinutes}m)`);
  },

  /**
   * Get a value from cache
   */
  get(key) {
    const item = this.store.get(key);
    
    if (!item) {
      BlueFoxLogger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // Check expiration
    if (Date.now() > item.expires) {
      this.store.delete(key);
      BlueFoxLogger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    BlueFoxLogger.debug(`Cache HIT: ${key}`);
    return item.value;
  },

  /**
   * Check if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  },

  /**
   * Clear specific key
   */
  remove(key) {
    this.store.delete(key);
    BlueFoxLogger.debug(`Cache REMOVED: ${key}`);
  },

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
    BlueFoxLogger.info('Cache cleared');
  },

  /**
   * Get cache statistics
   */
  getStats() {
    let expired = 0;
    let active = 0;
    const now = Date.now();

    for (const [key, item] of this.store.entries()) {
      if (now > item.expires) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries: active,
      expiredEntries: expired,
      maxSize: this.maxSize,
      usagePercent: Math.round((this.store.size / this.maxSize) * 100)
    };
  }
};

if (typeof window !== 'undefined') {
  window.BlueFoxCache = BlueFoxCache;
}
