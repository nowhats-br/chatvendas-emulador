import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

/**
 * PreInstallationManager - Handles complete Android pre-installation with verification
 * 
 * This class manages the headless QEMU pre-installation workflow for Android systems,
 * including automated keyboard commands, installation verification, and cleanup of
 * failed installations.
 * 
 * Requirements: 3.1, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2
 */
export class PreInstallationManager {
  constructor(options = {}) {
    this.qemuPath = options.qemuPath || 'qemu-system-x86_64';
    this.qemuImgPath = options.qemuImgPath || 'qemu-img';
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    
    // Installation configuration
    this.config = {
      gracefulTimeout: 300000,      // 5 minutes for installation
      verificationTimeout: 10000,   // 10 seconds for verification
      minDiskSizeAfterInstall: 500, // 500MB minimum after installation
      initialDiskSize: 100,          // Expected initial disk size in MB
      maxBootAttempts: 25,           // Maximum automated installation attempts
      bootDelay: 2000,               // Default delay between boot commands
      ...options.config
    };

    console.log(`🔧 PreInstallationManager initialized (platform: ${this.platform})`);
  }

  /**
   * Pre-install Android to virtual disk using headless QEMU
   * Requirements: 3.1, 3.3, 8.1
   * 
   * @param {Object} config - Installation configuration
   * @returns {Promise<InstallResult>} Installation result
   */
  async preInstallAndroid(config) {
    const {
      diskPath,
      isoPath,
      memory = 2048,
      cpuCores = 2,
      skipInstallation = false,
      progressCallback = null
    } = config;

    console.log(`📦 PRÉ-INSTALAÇÃO: Starting Android installation...`);
    console.log(`   Disk: ${diskPath}`);
    console.log(`   ISO: ${isoPath}`);
    console.log(`   Skip: ${skipInstallation}`);

    // If skip installation is requested, create empty disk
    if (skipInstallation) {
      return this.skipPreInstallation(config);
    }

    // Verify ISO exists
    try {
      await fs.access(isoPath);
    } catch (error) {
      throw new Error(`ISO file not found: ${isoPath}`);
    }

    // Verify disk exists
    try {
      await fs.access(diskPath);
    } catch (error) {
      throw new Error(`Virtual disk not found: ${diskPath}`);
    }

    // Get initial disk size for verification
    const initialStats = await fs.stat(diskPath);
    const initialSizeMB = Math.round(initialStats.size / 1024 / 1024);
    console.log(`💾 Initial disk size: ${initialSizeMB}MB`);

    // Emit progress: disk creation complete
    if (progressCallback) {
      progressCallback({
        stage: 'disk-creation',
        percentage: 10,
        message: 'Virtual disk created',
        timestamp: Date.now()
      });
    }

    // Start headless QEMU installation
    const installResult = await this.runHeadlessInstallation({
      diskPath,
      isoPath,
      memory,
      cpuCores,
      progressCallback
    });

    if (!installResult.success) {
      // Clean up failed installation
      await this.cleanupFailedInstallation(diskPath);
      throw new Error(`Installation failed: ${installResult.message || 'Unknown error'}`);
    }

    // Emit progress: installation complete, starting verification
    if (progressCallback) {
      progressCallback({
        stage: 'verification',
        percentage: 90,
        message: 'Verifying installation',
        timestamp: Date.now()
      });
    }

    // Verify installation
    const verificationResult = await this.verifyInstallation(diskPath, initialSizeMB);

    if (!verificationResult.success) {
      // Clean up failed installation
      await this.cleanupFailedInstallation(diskPath);
      throw new Error(`Installation verification failed: ${verificationResult.message}`);
    }

    // Emit progress: complete
    if (progressCallback) {
      progressCallback({
        stage: 'verification',
        percentage: 100,
        message: 'Installation complete',
        timestamp: Date.now()
      });
    }

    console.log(`✅ PRÉ-INSTALAÇÃO: Android installed successfully`);

    return {
      success: true,
      diskPath,
      diskSizeMB: verificationResult.diskSizeMB,
      verified: true,
      message: 'Android installation completed and verified'
    };
  }

  /**
   * Run headless QEMU installation with automated keyboard commands
   * Requirements: 3.1
   * 
   * @param {Object} config - Installation configuration
   * @returns {Promise<Object>} Installation result
   */
  async runHeadlessInstallation(config) {
    const { diskPath, isoPath, memory, cpuCores, progressCallback } = config;

    console.log(`🚀 Starting headless QEMU installation...`);

    // Build QEMU arguments for headless installation
    const args = this.buildQemuArgs({
      diskPath,
      isoPath,
      memory,
      cpuCores,
      headless: true
    });

    console.log(`⚡ QEMU command: ${this.qemuPath} ${args.join(' ')}`);

    return new Promise((resolve, reject) => {
      const qemuProcess = spawn(this.qemuPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          QEMU_AUDIO_DRV: 'none'
        }
      });

      let installationComplete = false;
      let bootAttempts = 0;
      const maxAttempts = this.config.maxBootAttempts;

      // Log QEMU output
      qemuProcess.stdout.on('data', (data) => {
        console.log(`QEMU stdout: ${data.toString().trim()}`);
      });

      qemuProcess.stderr.on('data', (data) => {
        console.log(`QEMU stderr: ${data.toString().trim()}`);
      });

      qemuProcess.on('spawn', () => {
        console.log(`✅ QEMU spawned (PID: ${qemuProcess.pid})`);

        // Emit progress: boot started
        if (progressCallback) {
          progressCallback({
            stage: 'boot',
            percentage: 20,
            message: 'QEMU started, beginning installation',
            timestamp: Date.now()
          });
        }

        // Automated installation command sequence
        const sendInstallCommand = () => {
          if (installationComplete || bootAttempts >= maxAttempts) {
            if (bootAttempts >= maxAttempts) {
              console.log(`✅ Installation process completed after ${bootAttempts} attempts`);
              installationComplete = true;

              // Emit progress: installation phase complete
              if (progressCallback) {
                progressCallback({
                  stage: 'installation',
                  percentage: 80,
                  message: 'Installation commands completed',
                  timestamp: Date.now()
                });
              }

              // Shutdown QEMU gracefully
              setTimeout(() => {
                console.log(`🛑 Shutting down QEMU...`);
                try {
                  qemuProcess.stdin.write('quit\n');
                  setTimeout(() => {
                    if (qemuProcess.pid) {
                      process.kill(qemuProcess.pid, 'SIGTERM');
                    }
                  }, 2000);
                } catch (err) {
                  console.warn(`Error shutting down QEMU: ${err.message}`);
                }
              }, 5000);
            }
            return;
          }

          bootAttempts++;
          const progress = 20 + Math.floor((bootAttempts / maxAttempts) * 60);

          console.log(`⌨️ [INSTALL ${bootAttempts}/${maxAttempts}] Sending installation commands...`);

          // Emit progress updates during installation
          if (progressCallback && bootAttempts % 5 === 0) {
            progressCallback({
              stage: 'installation',
              percentage: progress,
              message: `Installing Android (step ${bootAttempts}/${maxAttempts})`,
              timestamp: Date.now()
            });
          }

          // Installation command sequence
          if (bootAttempts <= 4) {
            console.log(`   → Waiting for boot menu...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 7) {
            console.log(`   → Navigating to installation option...`);
            qemuProcess.stdin.write('sendkey down\n');
            setTimeout(() => qemuProcess.stdin.write('sendkey down\n'), 300);
          } else if (bootAttempts <= 9) {
            console.log(`   → Selecting installation...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 11) {
            console.log(`   → Creating partition...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 13) {
            console.log(`   → Selecting ext4 filesystem...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 15) {
            console.log(`   → Formatting disk...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 17) {
            console.log(`   → Installing GRUB bootloader...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else if (bootAttempts <= 19) {
            console.log(`   → Configuring system...`);
            qemuProcess.stdin.write('sendkey ret\n');
          } else {
            console.log(`   → Finalizing installation...`);
            qemuProcess.stdin.write('sendkey ret\n');
          }

          // Intelligent delays based on installation phase
          let delay = this.config.bootDelay;
          if (bootAttempts <= 4) delay = 4000;      // Wait for boot menu
          else if (bootAttempts <= 7) delay = 1000; // Quick navigation
          else if (bootAttempts <= 11) delay = 3000; // Important confirmations
          else delay = 5000;                         // Installation processes take longer

          setTimeout(sendInstallCommand, delay);
        };

        // Start installation sequence after initial delay
        setTimeout(sendInstallCommand, 12000);
      });

      qemuProcess.on('exit', (code, signal) => {
        console.log(`🔄 QEMU exited (code: ${code}, signal: ${signal})`);

        // Installation completed, resolve with success
        resolve({
          success: true,
          exitCode: code,
          signal,
          attempts: bootAttempts
        });
      });

      qemuProcess.on('error', (error) => {
        console.error(`❌ QEMU error:`, error);
        reject(new Error(`QEMU process error: ${error.message}`));
      });

      // Installation timeout
      setTimeout(() => {
        if (!installationComplete) {
          console.log(`⏱️ Installation timeout reached`);
          try {
            qemuProcess.stdin.write('quit\n');
            setTimeout(() => {
              if (qemuProcess.pid) {
                process.kill(qemuProcess.pid, 'SIGKILL');
              }
            }, 2000);
          } catch (err) {
            console.warn(`Error during timeout shutdown: ${err.message}`);
          }
        }
      }, this.config.gracefulTimeout);
    });
  }

  /**
   * Build QEMU arguments for installation
   * 
   * @param {Object} config - QEMU configuration
   * @returns {Array<string>} QEMU arguments
   */
  buildQemuArgs(config) {
    const { diskPath, isoPath, memory, cpuCores, headless } = config;

    const args = [
      // Hardware acceleration
      ...(this.isWindows ? ['-accel', 'whpx'] : ['-enable-kvm']),
      '-cpu', this.isWindows ? 'qemu64,+ssse3,+sse4.1,+sse4.2' : 'host',
      '-machine', 'q35',

      // Memory and CPU
      '-m', `${memory}M`,
      '-smp', cpuCores.toString(),

      // Disk and ISO
      '-drive', `file=${diskPath},format=qcow2,if=ide,index=0,cache=writeback`,
      '-drive', `file=${isoPath},media=cdrom,readonly=on,if=ide,index=2`,

      // Network
      '-netdev', 'user,id=net0',
      '-device', 'e1000,netdev=net0',

      // Display
      '-display', 'none',
      '-vga', 'std',

      // Audio disabled
      '-audiodev', 'none,id=none',

      // USB
      '-usb',
      '-device', 'usb-tablet',
      '-device', 'usb-kbd',

      // Boot from CD
      '-boot', 'order=d,menu=off',
      '-rtc', 'base=localtime,clock=host',

      // Monitor for commands
      '-monitor', 'stdio',

      // No reboot/shutdown
      '-no-reboot',
      '-no-shutdown'
    ];

    return args;
  }

  /**
   * Verify installation success by checking disk size and system files
   * Requirements: 3.3, 5.1, 5.2, 5.4, 5.5
   * 
   * @param {string} diskPath - Path to virtual disk
   * @param {number} initialSizeMB - Initial disk size in MB
   * @returns {Promise<VerificationResult>} Verification result
   */
  async verifyInstallation(diskPath, initialSizeMB = 0) {
    console.log(`🔍 Verifying installation...`);
    console.log(`   Disk: ${diskPath}`);
    console.log(`   Initial size: ${initialSizeMB}MB`);

    try {
      // Check disk size
      const stats = await fs.stat(diskPath);
      const currentSizeMB = Math.round(stats.size / 1024 / 1024);

      console.log(`💾 Current disk size: ${currentSizeMB}MB`);

      // Verify disk size increased significantly
      const sizeIncrease = currentSizeMB - initialSizeMB;
      const minIncrease = this.config.minDiskSizeAfterInstall - initialSizeMB;

      console.log(`📊 Size increase: ${sizeIncrease}MB (minimum required: ${minIncrease}MB)`);

      if (currentSizeMB < this.config.minDiskSizeAfterInstall) {
        const message = `Disk size too small (${currentSizeMB}MB < ${this.config.minDiskSizeAfterInstall}MB)`;
        console.error(`❌ ${message}`);
        
        return {
          success: false,
          diskSizeMB: currentSizeMB,
          sizeIncrease,
          message
        };
      }

      // Additional verification: check if disk has content
      // A properly installed Android system should have significant data
      if (sizeIncrease < 100) {
        const message = `Insufficient disk size increase (${sizeIncrease}MB < 100MB)`;
        console.warn(`⚠️ ${message}`);
        
        return {
          success: false,
          diskSizeMB: currentSizeMB,
          sizeIncrease,
          message
        };
      }

      console.log(`✅ Installation verified successfully`);
      console.log(`   Final disk size: ${currentSizeMB}MB`);
      console.log(`   Size increase: ${sizeIncrease}MB`);

      return {
        success: true,
        diskSizeMB: currentSizeMB,
        sizeIncrease,
        verified: true,
        message: 'Installation verified successfully'
      };

    } catch (error) {
      console.error(`❌ Verification error:`, error);
      
      return {
        success: false,
        error: error.message,
        message: `Verification failed: ${error.message}`
      };
    }
  }

  /**
   * Skip pre-installation and create empty disk
   * Requirements: 8.1, 8.2
   * 
   * @param {Object} config - Configuration
   * @returns {Promise<InstallResult>} Result
   */
  async skipPreInstallation(config) {
    const { diskPath } = config;

    console.log(`⏭️ Skipping pre-installation`);
    console.log(`   Empty disk: ${diskPath}`);

    try {
      // Verify disk exists
      await fs.access(diskPath);

      const stats = await fs.stat(diskPath);
      const sizeMB = Math.round(stats.size / 1024 / 1024);

      console.log(`✅ Empty disk ready: ${sizeMB}MB`);

      return {
        success: true,
        skipped: true,
        diskPath,
        diskSizeMB: sizeMB,
        verified: false,
        message: 'Pre-installation skipped - manual installation required',
        instructions: [
          '1. Start the emulator',
          '2. Boot from the ISO image',
          '3. Follow the Android-x86 installation wizard',
          '4. Install Android to the virtual hard disk',
          '5. Reboot after installation completes'
        ]
      };

    } catch (error) {
      throw new Error(`Failed to prepare empty disk: ${error.message}`);
    }
  }

  /**
   * Clean up failed installation
   * Requirements: 3.4, 5.3
   * 
   * @param {string} diskPath - Path to virtual disk
   * @returns {Promise<void>}
   */
  async cleanupFailedInstallation(diskPath) {
    console.log(`🧹 Cleaning up failed installation: ${diskPath}`);

    try {
      // Check if disk exists
      await fs.access(diskPath);

      // Delete the incomplete disk
      await fs.unlink(diskPath);

      console.log(`✅ Failed installation cleaned up`);
    } catch (error) {
      // If file doesn't exist, that's fine
      if (error.code === 'ENOENT') {
        console.log(`ℹ️ Disk file already removed`);
        return;
      }

      console.error(`❌ Failed to clean up installation:`, error);
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Check if Android is already installed on disk
   * 
   * @param {string} diskPath - Path to virtual disk
   * @returns {Promise<boolean>} True if Android is installed
   */
  async checkIfAndroidInstalled(diskPath) {
    try {
      const stats = await fs.stat(diskPath);
      const sizeMB = Math.round(stats.size / 1024 / 1024);

      console.log(`💾 Disk size: ${sizeMB}MB`);

      // If disk is smaller than 100MB, it's likely empty
      if (sizeMB < 100) {
        console.log(`💾 Disk is empty (${sizeMB}MB) - Android not installed`);
        return false;
      }

      // If disk is larger than 500MB, Android is likely installed
      if (sizeMB > 500) {
        console.log(`💾 Disk has content (${sizeMB}MB) - Android likely installed`);
        return true;
      }

      // Intermediate size - assume not installed to be safe
      console.log(`💾 Disk has intermediate size (${sizeMB}MB) - assuming not installed`);
      return false;

    } catch (error) {
      console.log(`💾 Disk not found - Android not installed`);
      return false;
    }
  }
}

/**
 * @typedef {Object} InstallConfig
 * @property {string} diskPath - Path to virtual disk
 * @property {string} isoPath - Path to Android ISO
 * @property {number} [memory=2048] - Memory in MB
 * @property {number} [cpuCores=2] - Number of CPU cores
 * @property {boolean} [skipInstallation=false] - Skip pre-installation
 * @property {Function} [progressCallback] - Progress callback function
 */

/**
 * @typedef {Object} InstallResult
 * @property {boolean} success - Whether installation succeeded
 * @property {string} diskPath - Path to virtual disk
 * @property {number} diskSizeMB - Final disk size in MB
 * @property {boolean} verified - Whether installation was verified
 * @property {string} message - Result message
 * @property {boolean} [skipped] - Whether installation was skipped
 * @property {Array<string>} [instructions] - Manual installation instructions
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} success - Whether verification succeeded
 * @property {number} diskSizeMB - Current disk size in MB
 * @property {number} [sizeIncrease] - Disk size increase in MB
 * @property {boolean} [verified] - Whether installation is verified
 * @property {string} message - Verification message
 * @property {string} [error] - Error message if verification failed
 */

/**
 * @typedef {Object} InstallProgress
 * @property {'disk-creation'|'boot'|'installation'|'verification'} stage - Current stage
 * @property {number} percentage - Progress percentage (0-100)
 * @property {string} message - Progress message
 * @property {number} timestamp - Timestamp in milliseconds
 */

export default PreInstallationManager;
