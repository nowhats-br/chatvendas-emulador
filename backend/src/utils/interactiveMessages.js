// Estruturas de mensagens interativas - ESTRUTURA EXATA DO WHAILEYS QUE FUNCIONA
// Baseado no código testado e funcional de button_whaileys/src/index.ts
// Esta estrutura funciona tanto na API Whaileys quanto na API Baileys

/**
 * Cria uma mensagem com botões (estrutura EXATA do button_whaileys)
 * @param {string} text - Texto principal
 * @param {string} footer - Rodapé (opcional)
 * @param {Array} buttons - Array de botões no formato: [{buttonId: 'id', buttonText: {displayText: 'Texto'}, type: 1}]
 * @returns {Object} Mensagem formatada para envio
 * 
 * Exemplo de uso:
 * const buttons = [
 *   { buttonId: 'id1', buttonText: { displayText: 'Botão 1' }, type: 1 },
 *   { buttonId: 'id2', buttonText: { displayText: 'Botão 2' }, type: 1 }
 * ];
 * const msg = createButtonMessage('Escolha um botão', 'Rodapé', buttons);
 */
export function createButtonMessage(text, footer, buttons) {
    return {
        text,
        footer,
        buttons
    };
}

/**
 * Cria uma mensagem com lista (estrutura EXATA do button_whaileys)
 * @param {string} text - Texto principal
 * @param {string} footer - Rodapé (opcional)
 * @param {string} title - Título da lista (opcional)
 * @param {string} buttonText - Texto do botão para abrir a lista
 * @param {Array} sections - Seções no formato: [{title: 'Seção', rows: [{rowId: 'id', title: 'Título', description: 'Descrição'}]}]
 * @returns {Object} Mensagem formatada para envio
 * 
 * Exemplo de uso:
 * const sections = [
 *   {
 *     title: 'Seção 1',
 *     rows: [
 *       { rowId: 'option1', title: 'Opção 1', description: 'Descrição da opção 1' },
 *       { rowId: 'option2', title: 'Opção 2', description: 'Descrição da opção 2' }
 *     ]
 *   }
 * ];
 * const msg = createListMessage('Escolha uma opção', 'Rodapé', 'Título da Lista', 'Clique aqui', sections);
 */
export function createListMessage(text, footer, title, buttonText, sections) {
    return {
        text,
        footer,
        title,
        buttonText,
        sections
    };
}

/**
 * Cria uma mensagem com botões e imagem (estrutura EXATA do button_whaileys)
 * @param {string} imageUrl - URL da imagem
 * @param {string} caption - Legenda da imagem
 * @param {string} footer - Rodapé (opcional)
 * @param {Array} buttons - Array de botões
 * @returns {Object} Mensagem formatada para envio
 * 
 * Exemplo de uso:
 * const buttons = [
 *   { buttonId: 'id1', buttonText: { displayText: 'Button 1' }, type: 1 }
 * ];
 * const msg = createButtonMessageWithImage('https://example.com/image.jpg', 'Legenda', 'Rodapé', buttons);
 */
export function createButtonMessageWithImage(imageUrl, caption, footer, buttons) {
    return {
        image: { url: imageUrl },
        caption,
        footer,
        buttons,
        headerType: 4
    };
}

/**
 * Converte botões do formato do frontend para o formato do Whaileys
 * @param {Array} frontendButtons - Botões do frontend [{id, text, type, url?, phoneNumber?}]
 * @returns {Array} Botões no formato Whaileys
 */
export function convertButtonsToWhaileyFormat(frontendButtons) {
    if (!Array.isArray(frontendButtons)) return [];

    console.log('🔄 convertButtonsToWhaileyFormat: Botões recebidos:', JSON.stringify(frontendButtons, null, 2));

    return frontendButtons.map((btn, index) => {
        const buttonId = btn.id || btn.buttonId || `btn_${Date.now()}_${index}`;
        const buttonText = btn.text || btn.displayText || `Botão ${index + 1}`;

        console.log(`🔄 Processando botão ${index + 1}:`, { 
            id: buttonId, 
            text: buttonText, 
            type: btn.type, 
            url: btn.url, 
            phoneNumber: btn.phoneNumber 
        });

        // Botão de URL (cta_url)
        if (btn.type === 'cta_url' && btn.url) {
            console.log(`🔗 Criando botão de URL: ${buttonText} -> ${btn.url}`);
            return {
                buttonId,
                buttonText: { displayText: buttonText },
                type: 2, // URL button type
                url: btn.url
            };
        }

        // Botão de chamada (cta_call)
        if (btn.type === 'cta_call' && btn.phoneNumber) {
            console.log(`📞 Criando botão de chamada: ${buttonText} -> ${btn.phoneNumber}`);
            return {
                buttonId,
                buttonText: { displayText: buttonText },
                type: 3, // Call button type
                phoneNumber: btn.phoneNumber
            };
        }

        // Botão de resposta rápida (quick_reply) - padrão
        console.log(`💬 Criando botão de resposta rápida: ${buttonText}`);
        return {
            buttonId,
            buttonText: { displayText: buttonText },
            type: 1 // Quick reply type
        };
    });
}

/**
 * Converte seções do formato do frontend para o formato do Whaileys
 * @param {Array} frontendSections - Seções do frontend
 * @returns {Array} Seções no formato Whaileys
 */
export function convertSectionsToWhaileyFormat(frontendSections) {
    if (!Array.isArray(frontendSections)) return [];

    return frontendSections.map(section => ({
        title: section.title || 'Seção',
        rows: (section.rows || []).map(row => ({
            rowId: row.rowId || row.id || `row_${Date.now()}_${Math.random()}`,
            title: row.title || 'Opção',
            description: row.description || ''
        }))
    }));
}
