/**
 * WhatsApp Preload Logic - ChatVendas
 * Implementa comportamentos humanos automáticos em segundo plano.
 */

export class WhatsAppPreload {
    /**
     * Simula o "Movimento do Mouse" e "Presença" em segundo plano.
     * No protocolo Baileys, isso é feito enviando atualizações de presença periódicas
     * e mantendo a conexão ativa de forma que pareça interativa.
     */
    static async injectHumanActivity(socket, instanceId) {
        // Agendar atividades aleatórias
        const runRandomActivity = async () => {
            try {
                if (!socket?.user) return;

                const activities = [
                    () => socket.sendPresenceUpdate('available'),
                    () => socket.sendPresenceUpdate('unavailable'),
                    // Simular que está olhando a lista de contatos (não envia nada específico, mas mantém o socket "quente")
                ];

                const randomActivity = activities[Math.floor(Math.random() * activities.length)];
                await randomActivity();

                // Agendar próxima atividade entre 5 e 15 minutos
                const nextRun = (Math.floor(Math.random() * 10) + 5) * 60 * 1000;
                setTimeout(() => runRandomActivity(), nextRun);
            } catch (error) {
                console.error(`[Security] Erro na atividade humana para ${instanceId}:`, error.message);
            }
        };

        // Iniciar o loop de atividades
        runRandomActivity();
    }

    /**
     * Adiciona um atraso aleatório entre as mensagens enviadas
     */
    static async getRandomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}
