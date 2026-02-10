import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import net from 'net';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * ProcessManager - Handles QEMU process lifecycle with platform-specific termination strategies
 * 
 * This class provides Windows-compatible process termination using taskkill on Windows
 * and POSIX signals on Unix/Linux systems. It addresses the critical issue where
 * process.kill() with SIGTERM/SIGKILL doesn't work correctly on Windows.
 * 
 * Requirements: 1.2, 7.1, 7.2, 7.3, 7.5
 */
export class ProcessManager {
  constructor() {
    this.platform = os.platform();
    this.terminationStrategy = this.selectTerminationStrategy();
    console.log(`🔧 ProcessManager initialized with ${this.terminationStrategy.constructor.name}`);
  }

  /**
   * Select the appropriate termination strategy based on the platform
   * @returns {TerminationStrategy} Platform-specific termination strategy
   */
  selectTerminationStrategy() {
    if (this.platform === 'win32') {
      return new WindowsTerminationStrategy();
    } else {
      return new UnixTerminationStrategy();
    }
  }

  /**
   * Start a QEMU process with the given configuration
   * @param {Object} config - QEMU configuration
   * @returns {Promise<QemuProcess>} Process information
   */
  async startQemuProcess(config) {
    const { command, args, options = {} } = config;

    console.log(`🚀 Starting QEMU process: ${command} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const qemuProcess = spawn(command, args, {
        stdio: options.stdio || ['pipe', 'pipe', 'pipe'],
        env: options.env || process.env,
        ...options
      });

      const processInfo = {
        id: config.instanceId || `qemu_${Date.now()}`,
        pid: qemuProcess.pid,
        monitorSocket: config.monitorSocket,
        status: 'starting',
        process: qemuProcess,
        startTime: new Date()
      };

      qemuProcess.on('spawn', () => {
        processInfo.status = 'running';
        console.log(`✅ QEMU process started (PID: ${qemuProcess.pid})`);
        resolve(processInfo);
      });

      qemuProcess.on('error', (error) => {
        console.error(`❌ QEMU spawn error:`, error);
        reject(new Error(`Failed to start QEMU: ${error.message}`));
      });

      qemuProcess.on('exit', (code, signal) => {
        processInfo.status = 'stopped';
        console.log(`🔄 QEMU process exited: code=${code}, signal=${signal}`);
      });
    });
  }

  /**
   * Send a command to QEMU monitor socket
   * @param {string} monitorSocket - Path to monitor socket or TCP address
   * @param {string} command - QEMU monitor command
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<string>} Command response
   */
  async sendMonitorCommand(monitorSocket, command, timeout = 5000) {
    if (!monitorSocket) {
      throw new Error('Monitor socket not configured');
    }

    console.log(`📡 Sending monitor command: ${command} to ${monitorSocket}`);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        client.destroy();
        reject(new Error(`Monitor command timeout after ${timeout}ms`));
      }, timeout);

      const client = new net.Socket();
      let response = '';

      client.on('data', (data) => {
        response += data.toString();
      });

      client.on('end', () => {
        clearTimeout(timeoutId);
        console.log(`✅ Monitor command completed: ${response.substring(0, 100)}`);
        resolve(response);
      });

      client.on('error', (error) => {
        clearTimeout(timeoutId);
        console.error(`❌ Monitor socket error:`, error.message);
        reject(new Error(`Monitor socket error: ${error.message}`));
      });

      // Connect to Unix socket or TCP socket
      if (monitorSocket.startsWith('tcp:')) {
        // TCP socket format: tcp:host:port
        const parts = monitorSocket.split(':');
        const host = parts[1] || 'localhost';
        const port = parseInt(parts[2]);
        client.connect(port, host, () => {
          client.write(command + '\n');
          client.end();
        });
      } else {
        // Unix socket
        client.connect(monitorSocket, () => {
          client.write(command + '\n');
          client.end();
        });
      }
    });
  }

  /**
   * Send system_powerdown command to QEMU via monitor
   * @param {string} monitorSocket - Path to monitor socket
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if command sent successfully
   */
  async sendPowerdownCommand(monitorSocket, timeout = 5000) {
    try {
      await this.sendMonitorCommand(monitorSocket, 'system_powerdown', timeout);
      console.log(`✅ Sent system_powerdown command to QEMU`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send powerdown command:`, error.message);
      return false;
    }
  }

  /**
   * Stop a QEMU process gracefully, with force termination fallback
   * @param {string|number|Object} processId - Process ID, PID, or process info object
   * @param {Object} options - Termination options
   * @returns {Promise<void>}
   */
  async stopQemuProcess(processId, options = {}) {
    const { graceful = true, timeout = 30000 } = options;

    console.log(`🛑 Stopping QEMU process: ${JSON.stringify(processId)} (graceful: ${graceful})`);

    // Extract PID and monitor socket from processId
    let pid = processId;
    let monitorSocket = null;

    if (typeof processId === 'object') {
      pid = processId.pid || processId.id;
      monitorSocket = processId.monitorSocket;
    }

    // Check if process exists
    const exists = await this.isProcessRunning(pid);
    if (!exists) {
      console.log(`ℹ️ Process ${pid} is not running`);
      return;
    }

    try {
      if (graceful) {
        // Try QEMU monitor system_powerdown first if monitor socket is available
        if (monitorSocket) {
          console.log(`🔌 Attempting graceful shutdown via QEMU monitor`);
          const powerdownSent = await this.sendPowerdownCommand(monitorSocket, 5000);

          if (powerdownSent) {
            // Wait for process to exit after powerdown command
            const stopped = await this.waitForProcessExit(pid, timeout);
            
            if (stopped) {
              console.log(`✅ Process ${pid} stopped gracefully via QEMU monitor`);
              return;
            }

            console.log(`⚠️ QEMU monitor powerdown sent but process did not stop within timeout`);
          }
        }

        // Fall back to platform-specific graceful shutdown
        console.log(`🔄 Attempting platform-specific graceful shutdown`);
        const gracefulSuccess = await this.terminationStrategy.executeGracefulShutdown(
          pid,
          this.terminationStrategy.gracefulTimeout
        );

        if (gracefulSuccess) {
          console.log(`✅ Process ${pid} stopped gracefully`);
          return;
        }

        console.log(`⚠️ Graceful shutdown failed or timed out, attempting force termination`);
      }

      // Force termination
      await this.terminationStrategy.executeForceTermination(
        pid,
        this.terminationStrategy.forceTimeout
      );

      console.log(`✅ Process ${pid} force terminated`);
    } catch (error) {
      console.error(`❌ Failed to stop process ${pid}:`, error.message);
      throw new Error(`Failed to stop QEMU process: ${error.message}`);
    }
  }

  /**
   * Wait for a process to exit
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if process exited
   */
  async waitForProcessExit(processId, timeout) {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      const isRunning = await this.isProcessRunning(processId);
      
      if (!isRunning) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }

  /**
   * Check if a process exists before attempting termination
   * Handles non-existent processes gracefully
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<boolean>} True if process exists
   */
  async checkProcessExists(processId) {
    try {
      const exists = await this.isProcessRunning(processId);
      if (!exists) {
        console.log(`ℹ️ Process ${processId} does not exist or is already stopped`);
      }
      return exists;
    } catch (error) {
      console.error(`❌ Error checking process existence:`, error.message);
      return false;
    }
  }

  /**
   * Check if a process is running
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<boolean>} True if process is running
   */
  async isProcessRunning(processId) {
    try {
      return await this.terminationStrategy.isProcessRunning(processId);
    } catch (error) {
      console.error(`❌ Error checking process status:`, error.message);
      return false;
    }
  }

  /**
   * Kill a process immediately without graceful shutdown
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<void>}
   */
  async killProcess(processId) {
    console.log(`💀 Force killing process: ${processId}`);
    await this.terminationStrategy.executeForceTermination(
      processId,
      this.terminationStrategy.forceTimeout
    );
  }
}

/**
 * Base interface for termination strategies
 */
class TerminationStrategy {
  constructor() {
    this.gracefulTimeout = 30000; // 30 seconds
    this.forceTimeout = 10000;    // 10 seconds
  }

  /**
   * Execute graceful shutdown
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeGracefulShutdown(processId, timeout) {
    throw new Error('executeGracefulShutdown must be implemented by subclass');
  }

  /**
   * Execute force termination
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeForceTermination(processId, timeout) {
    throw new Error('executeForceTermination must be implemented by subclass');
  }

  /**
   * Check if process is running
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<boolean>} True if running
   */
  async isProcessRunning(processId) {
    throw new Error('isProcessRunning must be implemented by subclass');
  }

  /**
   * Wait for a process to exit
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if process exited
   */
  async waitForProcessExit(processId, timeout) {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      const isRunning = await this.isProcessRunning(processId);
      
      if (!isRunning) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }
}

/**
 * Windows-specific termination strategy using taskkill commands
 * 
 * Uses Windows taskkill command with /T flag for tree termination
 * to properly terminate QEMU and all child processes.
 * 
 * Requirements: 1.2, 7.1, 7.2, 7.3
 */
export class WindowsTerminationStrategy extends TerminationStrategy {
  constructor() {
    super();
    this.platform = 'windows';
  }

  /**
   * Execute graceful shutdown using taskkill without /F flag
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeGracefulShutdown(processId, timeout) {
    const pid = this.extractPid(processId);
    console.log(`🪟 Windows: Attempting graceful shutdown of PID ${pid}`);

    try {
      // Use taskkill without /F for graceful termination
      // /T terminates the process tree (parent and children)
      await execAsync(`taskkill /T /PID ${pid}`, { timeout });

      console.log(`✅ Windows: Process ${pid} stopped gracefully`);
      return true;
    } catch (error) {
      // taskkill returns error if process doesn't exist or can't be terminated
      if (error.message.includes('not found') || error.message.includes('not running')) {
        console.log(`ℹ️ Windows: Process ${pid} not found (already stopped)`);
        return true;
      }

      console.error(`❌ Windows: Graceful shutdown failed for PID ${pid}:`, error.message);
      return false;
    }
  }

  /**
   * Execute force termination using taskkill with /F flag
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeForceTermination(processId, timeout) {
    const pid = this.extractPid(processId);
    console.log(`🪟 Windows: Force terminating PID ${pid}`);

    try {
      // Use taskkill with /F for force termination
      // /T terminates the process tree (parent and children)
      await execAsync(`taskkill /F /T /PID ${pid}`, { timeout });

      console.log(`✅ Windows: Process ${pid} force terminated`);
      return true;
    } catch (error) {
      // taskkill returns error if process doesn't exist
      if (error.message.includes('not found') || error.message.includes('not running')) {
        console.log(`ℹ️ Windows: Process ${pid} not found (already stopped)`);
        return true;
      }

      console.error(`❌ Windows: Force termination failed for PID ${pid}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a process is running on Windows
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<boolean>} True if running
   */
  async isProcessRunning(processId) {
    const pid = this.extractPid(processId);

    try {
      // Use tasklist to check if process exists
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}" /NH`, { timeout: 5000 });
      
      // If process exists, tasklist will include the PID in output
      const isRunning = stdout.includes(pid.toString());
      
      return isRunning;
    } catch (error) {
      console.error(`❌ Windows: Error checking process ${pid}:`, error.message);
      return false;
    }
  }

  /**
   * Extract numeric PID from process ID
   * @param {string|number} processId - Process ID or PID
   * @returns {number} Numeric PID
   */
  extractPid(processId) {
    if (typeof processId === 'number') {
      return processId;
    }

    // If processId is an object with pid property
    if (typeof processId === 'object' && processId.pid) {
      return processId.pid;
    }

    // Try to parse as number
    const pid = parseInt(processId);
    if (isNaN(pid)) {
      throw new Error(`Invalid process ID: ${processId}`);
    }

    return pid;
  }
}

/**
 * Unix/Linux-specific termination strategy using POSIX signals
 * 
 * Uses SIGTERM for graceful shutdown and SIGKILL for force termination.
 * 
 * Requirements: 1.2, 7.1
 */
export class UnixTerminationStrategy extends TerminationStrategy {
  constructor() {
    super();
    this.platform = 'unix';
  }

  /**
   * Execute graceful shutdown using SIGTERM
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeGracefulShutdown(processId, timeout) {
    const pid = this.extractPid(processId);
    console.log(`🐧 Unix: Attempting graceful shutdown of PID ${pid} with SIGTERM`);

    try {
      // Send SIGTERM signal
      process.kill(pid, 'SIGTERM');

      console.log(`✅ Unix: Sent SIGTERM to process ${pid}`);
      return true;
    } catch (error) {
      // ESRCH means process doesn't exist
      if (error.code === 'ESRCH') {
        console.log(`ℹ️ Unix: Process ${pid} not found (already stopped)`);
        return true;
      }

      console.error(`❌ Unix: Graceful shutdown failed for PID ${pid}:`, error.message);
      return false;
    }
  }

  /**
   * Execute force termination using SIGKILL
   * @param {string|number} processId - Process ID or PID
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} True if successful
   */
  async executeForceTermination(processId, timeout) {
    const pid = this.extractPid(processId);
    console.log(`🐧 Unix: Force terminating PID ${pid} with SIGKILL`);

    try {
      // Send SIGKILL signal
      process.kill(pid, 'SIGKILL');

      console.log(`✅ Unix: Process ${pid} force terminated`);
      return true;
    } catch (error) {
      // ESRCH means process doesn't exist
      if (error.code === 'ESRCH') {
        console.log(`ℹ️ Unix: Process ${pid} not found (already stopped)`);
        return true;
      }

      console.error(`❌ Unix: Force termination failed for PID ${pid}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a process is running on Unix/Linux
   * @param {string|number} processId - Process ID or PID
   * @returns {Promise<boolean>} True if running
   */
  async isProcessRunning(processId) {
    const pid = this.extractPid(processId);

    try {
      // Sending signal 0 checks if process exists without actually sending a signal
      process.kill(pid, 0);
      return true;
    } catch (error) {
      // ESRCH means process doesn't exist
      if (error.code === 'ESRCH') {
        return false;
      }

      // EPERM means process exists but we don't have permission
      if (error.code === 'EPERM') {
        return true;
      }

      console.error(`❌ Unix: Error checking process ${pid}:`, error.message);
      return false;
    }
  }

  /**
   * Extract numeric PID from process ID
   * @param {string|number} processId - Process ID or PID
   * @returns {number} Numeric PID
   */
  extractPid(processId) {
    if (typeof processId === 'number') {
      return processId;
    }

    // If processId is an object with pid property
    if (typeof processId === 'object' && processId.pid) {
      return processId.pid;
    }

    // Try to parse as number
    const pid = parseInt(processId);
    if (isNaN(pid)) {
      throw new Error(`Invalid process ID: ${processId}`);
    }

    return pid;
  }
}

// Export default instance
export default ProcessManager;
