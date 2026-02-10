/**
 * Security Manager - ChatVendas
 * Implementa 4 camadas de proteção contra detecção de automação
 */
import { Browsers } from '@whiskeysockets/baileys';
import { getDatabase } from '../database/init.js';

export class SecurityManager {
    /**
     * Layer 1: Fingerprinting Isolation
     * Gera uma identidade única para cada instância para que o WhatsApp 
     * veja cada aba/conexão como um computador físico diferente.
     */
    static async getBrowserConfiguration(instanceId) {
        const db = getDatabase();
        const instance = await db.get('SELECT fingerprint FROM instances WHERE id = ?', [instanceId]);

        let fingerprint;
        if (instance?.fingerprint) {
            try {
                fingerprint = JSON.parse(instance.fingerprint);
            } catch (e) {
                fingerprint = this.generateNewFingerprint();
            }
        } else {
            fingerprint = this.generateNewFingerprint();
            await db.run('UPDATE instances SET fingerprint = ? WHERE id = ?', [JSON.stringify(fingerprint), instanceId]);
        }

        // Retorna a configuração no formato aceito pelo Baileys
        // [Navegador, Dispositivo, Versão]
        return [fingerprint.browser, fingerprint.device, fingerprint.version];
    }

    /**
     * Layer 3: Simulação de Hardware Real
     * Gera resoluções de tela, placas de vídeo e processadores leves para cada sessão.
     */
    static generateNewFingerprint() {
        const browsers = ['Chrome', 'Firefox', 'Edge', 'Safari'];
        const systems = ['Windows', 'macOS', 'Ubuntu'];

        const selectedBrowser = browsers[Math.floor(Math.random() * browsers.length)];
        const selectedSystem = systems[Math.floor(Math.random() * systems.length)];

        // Versões aleatórias para parecer hardware real
        const version = `${Math.floor(Math.random() * 10) + 90}.0.${Math.floor(Math.random() * 1000)}.0`;

        return {
            browser: selectedBrowser,
            device: selectedSystem,
            version: version,
            hardware: {
                cores: [2, 4, 8, 16][Math.floor(Math.random() * 4)],
                memory: [4, 8, 16, 32][Math.floor(Math.random() * 4)],
                gpu: ['Intel Iris Xe', 'NVIDIA GeForce RTX 3060', 'AMD Radeon Graphics', 'Apple M1'][Math.floor(Math.random() * 4)]
            }
        };
    }

    /**
     * Layer 4: Comportamento Humano Injetado
     * Adiciona delays aleatórios e simula estados de presença.
     */
    static async simulateHumanTyping(socket, remoteJid) {
        const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3 segundos
        await socket.sendPresenceUpdate('composing', remoteJid);
        await new Promise(resolve => setTimeout(resolve, delay));
        await socket.sendPresenceUpdate('paused', remoteJid);
    }

    /**
     * Layer 2: Ofuscação de Webdriver
     * No Baileys isso é feito garantindo que os parâmetros de conexão 
     * não contenham flags de automação e usem strings de User-Agent realistas.
     */
    static getRealUserAgent(fingerprint) {
        // Exemplo de User Agent realista baseado no fingerprint
        if (fingerprint.device === 'Windows') {
            return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${fingerprint.browser}/${fingerprint.version} Safari/537.36`;
        }
        return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) ${fingerprint.browser}/${fingerprint.version} Safari/537.36`;
    }
}
