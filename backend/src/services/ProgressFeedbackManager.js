/**
 * ProgressFeedbackManager - Provides real-time progress updates via WebSocket
 * 
 * This class manages progress feedback for long-running operations like Android
 * pre-installation, emulator startup, and other time-consuming tasks. It emits
 * progress events through WebSocket connections and provides heartbeat functionality
 * to indicate that operations are still active.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */

export class ProgressFeedbackManager {
  constructor(options = {}) {
    this.wsServer = options.wsServer || null;
    this.heartbeatInterval = options.heartbeatInterval || 5000; // 5 seconds default
    this.heartbeatTimers = new Map(); // instanceId -> timer
    this.activeOperations = new Map(); // instanceId -> operation info
    
    console.log(`🔧 ProgressFeedbackManager initialized (heartbeat: ${this.heartbeatInterval}ms)`);
  }

  /**
   * Set WebSocket server for broadcasting progress events
   * @param {WebSocketServer} wsServer - WebSocket server instance
   */
  setWebSocketServer(wsServer) {
    this.wsServer = wsServer;
    console.log(`✅ ProgressFeedbackManager: WebSocket server configured`);
  }

  /**
   * Start progress tracking for an operation
   * Requirements: 4.1
   * 
   * @param {string} instanceId - Instance identifier
   * @param {string} operation - Operation name (e.g., 'pre-installation', 'startup')
   * @param {Object} metadata - Additional operation metadata
   */
  startProgress(instanceId, operation, metadata = {}) {
    console.log(`📊 ProgressFeedbackManager: Starting progress for ${instanceId} - ${operation}`);

    const operationInfo = {
      instanceId,
      operation,
      startTime: Date.now(),
      lastUpdate: Date.now(),
      metadata
    };

    this.activeOperations.set(instanceId, operationInfo);

    // Emit start event
    this.emitProgressEvent(instanceId, {
      type: 'progress_start',
      operation,
      timestamp: Date.now(),
      ...metadata
    });

    // Start heartbeat for this operation
    this.startHeartbeat(instanceId);
  }

  /**
   * Update progress for an ongoing operation
   * Requirements: 4.2, 4.3
   * 
   * @param {string} instanceId - Instance identifier
   * @param {ProgressUpdate} progress - Progress update information
   */
  updateProgress(instanceId, progress) {
    const operationInfo = this.activeOperations.get(instanceId);

    if (!operationInfo) {
      console.warn(`⚠️ ProgressFeedbackManager: No active operation for ${instanceId}`);
      return;
    }

    operationInfo.lastUpdate = Date.now();

    // Calculate elapsed time
    const elapsed = Date.now() - operationInfo.startTime;

    // Emit progress update event
    this.emitProgressEvent(instanceId, {
      type: 'progress_update',
      operation: operationInfo.operation,
      stage: progress.stage,
      percentage: progress.percentage,
      message: progress.message,
      elapsed,
      estimatedTimeRemaining: progress.estimatedTimeRemaining,
      timestamp: Date.now()
    });

    console.log(`📈 Progress [${instanceId}]: ${progress.stage} - ${progress.percentage}% - ${progress.message}`);
  }

  /**
   * Complete progress tracking for an operation
   * Requirements: 4.3
   * 
   * @param {string} instanceId - Instance identifier
   * @param {OperationResult} result - Operation result
   */
  completeProgress(instanceId, result) {
    const operationInfo = this.activeOperations.get(instanceId);

    if (!operationInfo) {
      console.warn(`⚠️ ProgressFeedbackManager: No active operation for ${instanceId}`);
      return;
    }

    // Stop heartbeat
    this.stopHeartbeat(instanceId);

    // Calculate total duration
    const duration = Date.now() - operationInfo.startTime;

    // Emit completion event
    this.emitProgressEvent(instanceId, {
      type: 'progress_complete',
      operation: operationInfo.operation,
      success: result.success,
      message: result.message,
      duration,
      timestamp: Date.now(),
      ...result.data
    });

    // Remove from active operations
    this.activeOperations.delete(instanceId);

    console.log(`${result.success ? '✅' : '❌'} Progress completed [${instanceId}]: ${result.message} (${duration}ms)`);
  }

  /**
   * Emit a heartbeat event to indicate operation is still active
   * Requirements: 4.5
   * 
   * @param {string} instanceId - Instance identifier
   */
  emitHeartbeat(instanceId) {
    const operationInfo = this.activeOperations.get(instanceId);

    if (!operationInfo) {
      return;
    }

    const elapsed = Date.now() - operationInfo.startTime;
    const timeSinceLastUpdate = Date.now() - operationInfo.lastUpdate;

    this.emitProgressEvent(instanceId, {
      type: 'heartbeat',
      operation: operationInfo.operation,
      elapsed,
      timeSinceLastUpdate,
      timestamp: Date.now()
    });

    console.log(`💓 Heartbeat [${instanceId}]: ${operationInfo.operation} (elapsed: ${elapsed}ms)`);
  }

  /**
   * Start heartbeat timer for an operation
   * Requirements: 4.5
   * 
   * @param {string} instanceId - Instance identifier
   */
  startHeartbeat(instanceId) {
    // Clear existing heartbeat if any
    this.stopHeartbeat(instanceId);

    const timer = setInterval(() => {
      this.emitHeartbeat(instanceId);
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(instanceId, timer);

    console.log(`💓 ProgressFeedbackManager: Heartbeat started for ${instanceId}`);
  }

  /**
   * Stop heartbeat timer for an operation
   * 
   * @param {string} instanceId - Instance identifier
   */
  stopHeartbeat(instanceId) {
    const timer = this.heartbeatTimers.get(instanceId);

    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(instanceId);
      console.log(`💓 ProgressFeedbackManager: Heartbeat stopped for ${instanceId}`);
    }
  }

  /**
   * Emit a progress event via WebSocket
   * 
   * @param {string} instanceId - Instance identifier
   * @param {Object} event - Event data
   */
  emitProgressEvent(instanceId, event) {
    if (!this.wsServer) {
      console.warn(`⚠️ ProgressFeedbackManager: No WebSocket server configured`);
      return;
    }

    const message = JSON.stringify({
      type: 'progress',
      instanceId,
      ...event
    });

    // Broadcast to all connected WebSocket clients
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        try {
          client.send(message);
        } catch (error) {
          console.error(`❌ Failed to send progress event to client:`, error.message);
        }
      }
    });
  }

  /**
   * Get active operations summary
   * 
   * @returns {Array<Object>} Array of active operation summaries
   */
  getActiveOperations() {
    const operations = [];

    for (const [instanceId, info] of this.activeOperations.entries()) {
      operations.push({
        instanceId,
        operation: info.operation,
        elapsed: Date.now() - info.startTime,
        timeSinceLastUpdate: Date.now() - info.lastUpdate,
        metadata: info.metadata
      });
    }

    return operations;
  }

  /**
   * Check if an operation is active
   * 
   * @param {string} instanceId - Instance identifier
   * @returns {boolean} True if operation is active
   */
  isOperationActive(instanceId) {
    return this.activeOperations.has(instanceId);
  }

  /**
   * Cancel an operation and clean up
   * 
   * @param {string} instanceId - Instance identifier
   * @param {string} reason - Cancellation reason
   */
  cancelOperation(instanceId, reason = 'Operation cancelled') {
    const operationInfo = this.activeOperations.get(instanceId);

    if (!operationInfo) {
      return;
    }

    // Stop heartbeat
    this.stopHeartbeat(instanceId);

    // Emit cancellation event
    this.emitProgressEvent(instanceId, {
      type: 'progress_cancelled',
      operation: operationInfo.operation,
      reason,
      timestamp: Date.now()
    });

    // Remove from active operations
    this.activeOperations.delete(instanceId);

    console.log(`🚫 Progress cancelled [${instanceId}]: ${reason}`);
  }

  /**
   * Clean up all active operations (for shutdown)
   */
  cleanup() {
    console.log(`🧹 ProgressFeedbackManager: Cleaning up ${this.activeOperations.size} active operations`);

    // Stop all heartbeats
    for (const instanceId of this.heartbeatTimers.keys()) {
      this.stopHeartbeat(instanceId);
    }

    // Clear active operations
    this.activeOperations.clear();

    console.log(`✅ ProgressFeedbackManager: Cleanup complete`);
  }
}

/**
 * @typedef {Object} ProgressUpdate
 * @property {string} stage - Current stage (e.g., 'disk-creation', 'boot', 'installation', 'verification')
 * @property {number} percentage - Progress percentage (0-100)
 * @property {string} message - Human-readable progress message
 * @property {number} [estimatedTimeRemaining] - Estimated time remaining in milliseconds
 */

/**
 * @typedef {Object} OperationResult
 * @property {boolean} success - Whether operation succeeded
 * @property {string} message - Result message
 * @property {Object} [data] - Additional result data
 */

export default ProgressFeedbackManager;
