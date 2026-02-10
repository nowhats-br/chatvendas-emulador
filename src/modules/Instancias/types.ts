export type InstanceStatus = 'connected' | 'connecting' | 'disconnected' | 'qr_ready';

export interface WhatsAppInstance {
  id: string;
  name: string;
  provider?: 'baileys' | 'whaileys';
  phoneNumber?: string;
  profilePic?: string;
  status: InstanceStatus;
  batteryLevel?: number;
  lastConnection?: string;
  webhookUrl?: string;
  settings?: any; // JSON com configurações específicas
}

export interface QrCodeData {
  base64: string;
  expiresIn: number; // segundos
  pairingCode?: string;
}
