import { describe, it, expect, beforeAll } from 'vitest';
import WSL2AndroidManager from '../services/WSL2AndroidManager.js';
import WebSocket from 'ws';

describe('Emulator Connection Tests', () => {
    let manager;
    let wslIP;
    // Assumindo que o emulador "device" é a primeira instância (Porta 1 -> 6081)
    const EXPECTED_WS_PORT = 6081;

    beforeAll(async () => {
        manager = new WSL2AndroidManager();
        wslIP = await manager.getWSLIP();
        console.log(`🌍 WSL IP detected: ${wslIP}`);
    });

    it('should identify the running emulator instance', async () => {
        const instances = await manager.listInstances();
        const running = instances.find(i => i.status === 'running');

        expect(running, 'Nenhuma instância rodando encontrada').toBeDefined();

        if (running) {
            console.log(`📱 Found running instance: ${running.name} on Port ${running.wsPort}`);
            expect(running.wsPort).toBe(EXPECTED_WS_PORT);
        }
    });

    it('should successfully establish a WebSocket connection to QEMU', async () => {
        // Tenta conectar no WebSocket do VNC (QEMU)
        // Se o QEMU estiver rodando corretamente com -vnc ...,websocket=6081, a conexão deve abrir.

        const wsUrl = `ws://${wslIP}:${EXPECTED_WS_PORT}`;
        console.log(`🔌 Attempting to connect to ${wsUrl}...`);

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(wsUrl);

            const timeout = setTimeout(() => {
                ws.close();
                reject(new Error('Connection timed out'));
            }, 5000);

            ws.on('open', () => {
                console.log('✅ WebSocket connected successfully! QEMU VNC is reachable.');
                clearTimeout(timeout);
                ws.close();
                resolve();
            });

            ws.on('error', (err) => {
                clearTimeout(timeout);
                console.error('❌ WebSocket connection failed:', err.message);
                reject(new Error(`Failed to connect to ${wsUrl}: ${err.message}`));
            });
        });
    });
});
