/**
 * ResourceManager - Manages tracking and cleanup of emulator resources
 * 
 * This class provides centralized resource management for Android emulator instances,
 * ensuring proper cleanup of VNC connections, WebSocket proxies, ADB connections,
 * and other resources even when individual cleanup operations fail.
 * 
 * Requirements: 1.4, 2.1, 2.2, 2.3, 2.4, 2.5
 */

export class ResourceManager {
  constructor() {
    // Map of instanceId -> array of resources
    this.resources = new Map();
    
    // Track cleanup statistics for monitoring
    this.stats = {
      totalCleanups: 0,
      successfulCleanups: 0,
      failedCleanups: 0,
      resourcesTracked: 0
    };
  }

  /**
   * Register a resource for tracking
   * @param {string} instanceId - The emulator instance ID
   * @param {Resource} resource - The resource to track
   */
  registerResource(instanceId, resource) {
    if (!instanceId || !resource) {
      throw new Error('instanceId and resource are required');
    }

    if (!resource.type || !resource.id || typeof resource.cleanup !== 'function') {
      throw new Error('Resource must have type, id, and cleanup function');
    }

    if (!this.resources.has(instanceId)) {
      this.resources.set(instanceId, []);
    }

    const resources = this.resources.get(instanceId);
    
    // Avoid duplicate registration
    const exists = resources.some(r => r.type === resource.type && r.id === resource.id);
    if (!exists) {
      resources.push(resource);
      this.stats.resourcesTracked++;
      console.log(`📝 ResourceManager: Registered ${resource.type} resource "${resource.id}" for instance ${instanceId}`);
    }
  }

  /**
   * Clean up all resources for an instance
   * @param {string} instanceId - The emulator instance ID
   * @returns {Promise<CleanupResult>} Result of cleanup operation
   */
  async cleanupInstance(instanceId) {
    console.log(`🧹 ResourceManager: Starting cleanup for instance ${instanceId}`);
    
    const resources = this.resources.get(instanceId);
    
    if (!resources || resources.length === 0) {
      console.log(`ℹ️ ResourceManager: No resources to clean up for instance ${instanceId}`);
      return {
        success: true,
        errors: [],
        cleanedResources: []
      };
    }

    const errors = [];
    const cleanedResources = [];
    
    this.stats.totalCleanups++;

    // Clean up each resource, continuing even if some fail
    for (const resource of resources) {
      try {
        await this.cleanupResource(resource);
        cleanedResources.push(`${resource.type}:${resource.id}`);
        console.log(`✅ ResourceManager: Cleaned up ${resource.type} resource "${resource.id}"`);
      } catch (error) {
        const errorMsg = `Failed to cleanup ${resource.type} resource "${resource.id}": ${error.message}`;
        errors.push(errorMsg);
        console.error(`❌ ResourceManager: ${errorMsg}`);
        
        // Log full error details for debugging
        console.error(`   Error details:`, error);
        
        this.stats.failedCleanups++;
      }
    }

    // Remove instance from tracking after cleanup attempt
    this.resources.delete(instanceId);
    
    const success = errors.length === 0;
    if (success) {
      this.stats.successfulCleanups++;
    }

    const result = {
      success,
      errors,
      cleanedResources
    };

    console.log(`${success ? '✅' : '⚠️'} ResourceManager: Cleanup completed for instance ${instanceId}`);
    console.log(`   Cleaned: ${cleanedResources.length} resources`);
    console.log(`   Errors: ${errors.length}`);

    return result;
  }

  /**
   * Clean up a single resource
   * @param {Resource} resource - The resource to clean up
   * @returns {Promise<void>}
   */
  async cleanupResource(resource) {
    if (!resource || typeof resource.cleanup !== 'function') {
      throw new Error('Invalid resource: must have cleanup function');
    }

    try {
      await resource.cleanup();
    } catch (error) {
      // Re-throw with more context
      throw new Error(`Resource cleanup failed: ${error.message}`);
    }
  }

  /**
   * Get all resources for an instance
   * @param {string} instanceId - The emulator instance ID
   * @returns {Array<Resource>} Array of resources
   */
  getResources(instanceId) {
    return this.resources.get(instanceId) || [];
  }

  /**
   * Get cleanup statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Check if an instance has any tracked resources
   * @param {string} instanceId - The emulator instance ID
   * @returns {boolean} True if instance has tracked resources
   */
  hasResources(instanceId) {
    const resources = this.resources.get(instanceId);
    return !!(resources && resources.length > 0);
  }

  /**
   * Get count of tracked resources for an instance
   * @param {string} instanceId - The emulator instance ID
   * @returns {number} Number of tracked resources
   */
  getResourceCount(instanceId) {
    const resources = this.resources.get(instanceId);
    return resources ? resources.length : 0;
  }

  /**
   * Clear all tracked resources (for testing/reset)
   */
  clear() {
    this.resources.clear();
    console.log('🧹 ResourceManager: All tracked resources cleared');
  }

  /**
   * Get summary of all tracked instances
   * @returns {Object} Summary of tracked instances
   */
  getSummary() {
    const summary = {
      totalInstances: this.resources.size,
      instances: []
    };

    for (const [instanceId, resources] of this.resources.entries()) {
      const resourcesByType = {};
      resources.forEach(r => {
        resourcesByType[r.type] = (resourcesByType[r.type] || 0) + 1;
      });

      summary.instances.push({
        instanceId,
        totalResources: resources.length,
        resourcesByType
      });
    }

    return summary;
  }
}

/**
 * @typedef {Object} Resource
 * @property {'vnc'|'websocket'|'adb'|'file'|'port'|'process'} type - Type of resource
 * @property {string} id - Unique identifier for the resource
 * @property {Function} cleanup - Async function to clean up the resource
 * @property {Object} [metadata] - Optional metadata about the resource
 */

/**
 * @typedef {Object} CleanupResult
 * @property {boolean} success - Whether all cleanups succeeded
 * @property {string[]} errors - Array of error messages
 * @property {string[]} cleanedResources - Array of successfully cleaned resource identifiers
 */
