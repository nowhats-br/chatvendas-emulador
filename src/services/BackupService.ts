interface BackupData {
  timestamp: number;
  version: string;
  data: {
    instances: any[];
    settings: any;
    contacts: any[];
    campaigns: any[];
    templates: any[];
  };
  checksum: string;
}

interface BackupOptions {
  includeInstances?: boolean;
  includeSettings?: boolean;
  includeContacts?: boolean;
  includeCampaigns?: boolean;
  includeTemplates?: boolean;
  compress?: boolean;
}

class BackupServiceClass {
  private readonly STORAGE_KEY = 'chatvendas_backup';
  private readonly MAX_BACKUPS = 10;
  private readonly AUTO_BACKUP_INTERVAL = 30 * 60 * 1000; // 30 minutos
  
  private autoBackupTimer: NodeJS.Timeout | null = null;
  private isAutoBackupEnabled = false;

  // Create a backup
  async createBackup(options: BackupOptions = {}): Promise<BackupData> {
    const {
      includeInstances = true,
      includeSettings = true,
      includeContacts = true,
      includeCampaigns = true,
      includeTemplates = true,
      compress = false
    } = options;

    try {
      const backupData: BackupData = {
        timestamp: Date.now(),
        version: '1.0.0',
        data: {
          instances: includeInstances ? await this.getInstancesData() : [],
          settings: includeSettings ? await this.getSettingsData() : {},
          contacts: includeContacts ? await this.getContactsData() : [],
          campaigns: includeCampaigns ? await this.getCampaignsData() : [],
          templates: includeTemplates ? await this.getTemplatesData() : []
        },
        checksum: ''
      };

      // Generate checksum
      backupData.checksum = await this.generateChecksum(backupData.data);

      // Save to local storage
      await this.saveBackupToStorage(backupData);

      console.log('✅ Backup criado com sucesso:', new Date(backupData.timestamp));
      return backupData;

    } catch (error) {
      console.error('❌ Erro ao criar backup:', error);
      throw new Error('Falha ao criar backup: ' + (error as Error).message);
    }
  }

  // Restore from backup
  async restoreBackup(backup: BackupData): Promise<void> {
    try {
      // Verify checksum
      const calculatedChecksum = await this.generateChecksum(backup.data);
      if (calculatedChecksum !== backup.checksum) {
        throw new Error('Backup corrompido: checksum inválido');
      }

      // Restore data
      if (backup.data.instances.length > 0) {
        await this.restoreInstancesData(backup.data.instances);
      }

      if (Object.keys(backup.data.settings).length > 0) {
        await this.restoreSettingsData(backup.data.settings);
      }

      if (backup.data.contacts.length > 0) {
        await this.restoreContactsData(backup.data.contacts);
      }

      if (backup.data.campaigns.length > 0) {
        await this.restoreCampaignsData(backup.data.campaigns);
      }

      if (backup.data.templates.length > 0) {
        await this.restoreTemplatesData(backup.data.templates);
      }

      console.log('✅ Backup restaurado com sucesso');

    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      throw new Error('Falha ao restaurar backup: ' + (error as Error).message);
    }
  }

  // Get all backups
  getBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const backups = JSON.parse(stored) as BackupData[];
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('❌ Erro ao carregar backups:', error);
      return [];
    }
  }

  // Delete a backup
  deleteBackup(timestamp: number): void {
    try {
      const backups = this.getBackups();
      const filtered = backups.filter(backup => backup.timestamp !== timestamp);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('✅ Backup deletado:', new Date(timestamp));
    } catch (error) {
      console.error('❌ Erro ao deletar backup:', error);
    }
  }

  // Export backup to file
  exportBackup(backup: BackupData): void {
    try {
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatvendas-backup-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('✅ Backup exportado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao exportar backup:', error);
    }
  }

  // Import backup from file
  async importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const backup = JSON.parse(content) as BackupData;
          
          // Validate backup structure
          if (!this.validateBackupStructure(backup)) {
            throw new Error('Estrutura de backup inválida');
          }
          
          await this.saveBackupToStorage(backup);
          console.log('✅ Backup importado com sucesso');
          resolve(backup);
        } catch (error) {
          reject(new Error('Falha ao importar backup: ' + (error as Error).message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo de backup'));
      };
      
      reader.readAsText(file);
    });
  }

  // Enable/disable auto backup
  setAutoBackup(enabled: boolean): void {
    this.isAutoBackupEnabled = enabled;
    
    if (enabled) {
      this.startAutoBackup();
    } else {
      this.stopAutoBackup();
    }
  }

  // Check if auto backup is enabled
  isAutoBackupActive(): boolean {
    return this.isAutoBackupEnabled;
  }

  // Get backup statistics
  getBackupStats(): {
    totalBackups: number;
    totalSize: number;
    oldestBackup: number | null;
    newestBackup: number | null;
  } {
    const backups = this.getBackups();
    const totalSize = JSON.stringify(backups).length;
    
    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: backups.length > 0 ? Math.min(...backups.map(b => b.timestamp)) : null,
      newestBackup: backups.length > 0 ? Math.max(...backups.map(b => b.timestamp)) : null
    };
  }

  private startAutoBackup(): void {
    this.stopAutoBackup(); // Clear existing timer
    
    this.autoBackupTimer = setInterval(async () => {
      try {
        await this.createBackup();
        console.log('🔄 Auto backup executado');
      } catch (error) {
        console.error('❌ Erro no auto backup:', error);
      }
    }, this.AUTO_BACKUP_INTERVAL);
    
    console.log('🔄 Auto backup ativado');
  }

  private stopAutoBackup(): void {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
    }
  }

  private async saveBackupToStorage(backup: BackupData): Promise<void> {
    const backups = this.getBackups();
    backups.unshift(backup);
    
    // Keep only the most recent backups
    if (backups.length > this.MAX_BACKUPS) {
      backups.splice(this.MAX_BACKUPS);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(backups));
  }

  private validateBackupStructure(backup: any): backup is BackupData {
    return (
      backup &&
      typeof backup.timestamp === 'number' &&
      typeof backup.version === 'string' &&
      backup.data &&
      Array.isArray(backup.data.instances) &&
      typeof backup.data.settings === 'object' &&
      Array.isArray(backup.data.contacts) &&
      Array.isArray(backup.data.campaigns) &&
      Array.isArray(backup.data.templates) &&
      typeof backup.checksum === 'string'
    );
  }

  private async generateChecksum(data: any): Promise<string> {
    const str = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Data fetching methods (to be implemented based on your services)
  private async getInstancesData(): Promise<any[]> {
    // Implementation depends on your WhatsAppService
    try {
      // return await WhatsAppService.getAll();
      return JSON.parse(localStorage.getItem('instances') || '[]');
    } catch {
      return [];
    }
  }

  private async getSettingsData(): Promise<any> {
    try {
      return JSON.parse(localStorage.getItem('settings') || '{}');
    } catch {
      return {};
    }
  }

  private async getContactsData(): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('contacts') || '[]');
    } catch {
      return [];
    }
  }

  private async getCampaignsData(): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('campaigns') || '[]');
    } catch {
      return [];
    }
  }

  private async getTemplatesData(): Promise<any[]> {
    try {
      return JSON.parse(localStorage.getItem('templates') || '[]');
    } catch {
      return [];
    }
  }

  // Data restoration methods
  private async restoreInstancesData(data: any[]): Promise<void> {
    localStorage.setItem('instances', JSON.stringify(data));
  }

  private async restoreSettingsData(data: any): Promise<void> {
    localStorage.setItem('settings', JSON.stringify(data));
  }

  private async restoreContactsData(data: any[]): Promise<void> {
    localStorage.setItem('contacts', JSON.stringify(data));
  }

  private async restoreCampaignsData(data: any[]): Promise<void> {
    localStorage.setItem('campaigns', JSON.stringify(data));
  }

  private async restoreTemplatesData(data: any[]): Promise<void> {
    localStorage.setItem('templates', JSON.stringify(data));
  }
}

export const BackupService = new BackupServiceClass();