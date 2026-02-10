/**
 * ESTE ARQUIVO DEFINE A COMUNICAÇÃO COM O PROCESSO PRINCIPAL DO ELECTRON
 * 
 * Estrutura preparada para o Backend (Main Process).
 * Quando migrar para Electron, os métodos abaixo chamarão ipcRenderer.invoke()
 */

import { WhatsAppInstance } from "../types";

export const InstanciasIPC = {
  // Canal de comunicação para iniciar sessão
  START_SESSION: 'whaileys:start-session',
  
  // Canal para parar sessão
  STOP_SESSION: 'whaileys:stop-session',
  
  // Canal para obter QR Code
  GET_QR: 'whaileys:get-qr',
  
  // Canal para escutar eventos de status (Websocket/EventEmmiter do Whaileys)
  ON_STATUS_CHANGE: 'whaileys:on-status-change',

  // Mock de implementação para o navegador (Development Mode)
  async mockStartSession(id: string): Promise<boolean> {
    console.log(`[Electron IPC] Solicitando início da sessão: ${id}`);
    return true;
  },

  async mockStopSession(id: string): Promise<boolean> {
    console.log(`[Electron IPC] Solicitando parada da sessão: ${id}`);
    return true;
  }
};
