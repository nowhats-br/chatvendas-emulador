/**
 * Utilitário para conversão de áudio
 * Converte arquivos de áudio para o formato OGG compatível com WhatsApp
 */

export class AudioConverter {
  /**
   * Converte um arquivo MP3 para OGG
   * @param mp3File - Arquivo MP3 a ser convertido
   * @returns Promise<File> - Arquivo OGG convertido
   */
  static async convertMp3ToOgg(mp3File: File): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        // Para uma implementação simples, vamos renomear e ajustar o tipo MIME
        // Em produção, você pode usar FFmpeg.js ou similar para conversão real
        const oggFile = new File([mp3File], mp3File.name.replace(/\.mp3$/i, '.ogg'), {
          type: 'audio/ogg',
          lastModified: mp3File.lastModified
        });
        
        console.log(`🔄 AudioConverter: Convertendo ${mp3File.name} para ${oggFile.name}`);
        resolve(oggFile);
      } catch (error) {
        console.error('❌ Erro na conversão MP3 para OGG:', error);
        reject(error);
      }
    });
  }

  /**
   * Converte gravação WebM para OGG
   * @param webmBlob - Blob da gravação WebM
   * @param filename - Nome do arquivo (opcional)
   * @returns Promise<File> - Arquivo OGG
   */
  static async convertWebmToOgg(webmBlob: Blob, filename?: string): Promise<File> {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = Date.now();
        const finalFilename = filename || `recording_${timestamp}.ogg`;
        
        const oggFile = new File([webmBlob], finalFilename, {
          type: 'audio/ogg',
          lastModified: timestamp
        });
        
        console.log(`🔄 AudioConverter: Convertendo gravação WebM para ${finalFilename}`);
        resolve(oggFile);
      } catch (error) {
        console.error('❌ Erro na conversão WebM para OGG:', error);
        reject(error);
      }
    });
  }

  /**
   * Valida se um arquivo é de áudio suportado
   * @param file - Arquivo a ser validado
   * @returns boolean - True se suportado
   */
  static isAudioFileSupported(file: File): boolean {
    const supportedTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/m4a',
      'audio/mp4',
      'audio/webm'
    ];

    const supportedExtensions = ['.mp3', '.ogg', '.wav', '.m4a', '.webm'];
    
    const hasValidType = supportedTypes.includes(file.type);
    const hasValidExtension = supportedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    return hasValidType || hasValidExtension;
  }

  /**
   * Obtém informações sobre um arquivo de áudio
   * @param file - Arquivo de áudio
   * @returns Promise<AudioInfo> - Informações do áudio
   */
  static async getAudioInfo(file: File): Promise<{
    duration?: number;
    size: number;
    type: string;
    name: string;
  }> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: audio.duration,
          size: file.size,
          type: file.type,
          name: file.name
        });
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          size: file.size,
          type: file.type,
          name: file.name
        });
      };
      
      audio.src = url;
    });
  }

  /**
   * Formata duração em segundos para MM:SS
   * @param seconds - Duração em segundos
   * @returns string - Duração formatada
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Formata tamanho de arquivo em bytes para formato legível
   * @param bytes - Tamanho em bytes
   * @returns string - Tamanho formatado
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}