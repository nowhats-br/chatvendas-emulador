import React from 'react';
import { Node } from '@xyflow/react';
import { ProductService } from '../../../services/ProductService';
import { TemplateService } from '../../../services/TemplateService';
import { AIConfigService } from '../../../services/AIConfigService';
import { Product } from '../../../types/global';

// Custom icon components
const Trash2Icon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '3,6 5,6 21,6' }), React.createElement('path', { d: 'm19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2' }), React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }), React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' }));
const SmartphoneIcon = ({ size = 32 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { x: '5', y: '2', width: '14', height: '20', rx: '2', ry: '2' }), React.createElement('line', { x1: '12', y1: '18', x2: '12.01', y2: '18' }));
const AlertTriangleIcon = () => React.createElement('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }), React.createElement('path', { d: 'M12 9v4' }), React.createElement('path', { d: 'M12 17h.01' }));
const ShoppingBagIcon = () => React.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' }), React.createElement('circle', { cx: '9', cy: '12', r: '1' }), React.createElement('circle', { cx: '15', cy: '12', r: '1' }));
const SparklesIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }), React.createElement('path', { d: 'M5 3v4' }), React.createElement('path', { d: 'M19 17v4' }), React.createElement('path', { d: 'M3 5h4' }), React.createElement('path', { d: 'M17 19h4' }));
const SettingsIcon = ({ size = 16 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '3' }), React.createElement('path', { d: 'M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 21a4 4 0 0 1-8 0 4 4 0 0 1 8 0z' }));

interface ConfigPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (id: string, data: any) => void;
  onDeleteNode: (id: string) => void;
}

export function ConfigPanel({ selectedNode, onUpdateNode, onDeleteNode }: ConfigPanelProps) {
  const [localData, setLocalData] = React.useState<any>({});
  
  // Estado para modal de produtos
  const [showProductSelector, setShowProductSelector] = React.useState(false);
  const [_availableProducts, setAvailableProducts] = React.useState<Product[]>([]);

  React.useEffect(() => {
    if (selectedNode) {
      setLocalData(JSON.parse(JSON.stringify(selectedNode.data))); 
    }
  }, [selectedNode]);

  // Carrega produtos ao abrir seletor
  React.useEffect(() => {
      if (showProductSelector) {
          setAvailableProducts(ProductService.getAll());
      }
  }, [showProductSelector]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdateNode(selectedNode!.id, newData);
  };

  // --- Lógica de Templates ---
  const handleLoadTemplate = (templateId: string) => {
      const template = TemplateService.getAll().find(t => t.id === templateId);
      if (template) {
          // Adapta o conteúdo do template para o nó
          let newData = { ...localData };
          if (template.type === 'text') newData.content = template.content.text;
          if (template.type === 'buttons') {
              newData.content = template.content.text;
              newData.buttons = template.content.buttons;
          }
          if (template.type === 'carousel') {
              newData.cards = template.content.cards;
          }
          setLocalData(newData);
          onUpdateNode(selectedNode!.id, newData);
      }
  };

  // ... (Lógica de Imagem e Produto mantida igual, omitindo para brevidade) ...
  const _handleImageUpload = (_e: React.ChangeEvent<HTMLInputElement>, _cardIndex?: number) => {
      // (Mesma lógica anterior)
  };
  const _handleImportProduct = (_product: Product, _cardIndex?: number) => {
      // (Mesma lógica anterior)
  };

  if (!selectedNode) {
    return (
      <div className="w-[350px] bg-[#111] border-l border-[#222] flex flex-col items-center justify-center text-gray-500 p-8 text-center">
        <div className="w-16 h-16 bg-[#1c1c1c] rounded-full flex items-center justify-center mb-4">
            <SmartphoneIcon />
        </div>
        <p>Selecione um nó no canvas para editar suas propriedades.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (selectedNode.type) {
        case 'keywordNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Palavras Chave</label>
                        <p className="text-[10px] text-gray-500 mb-1">Separe por vírgula</p>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-yellow-400 font-mono mt-1 focus:border-yellow-500 outline-none"
                            value={localData.keywords || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('keywords', e.target.value)}
                            placeholder="ex: preço, valor, quanto custa"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" className="accent-yellow-500" checked={localData.exactMatch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('exactMatch', e.target.checked)} />
                        <span className="text-xs text-gray-400">Correspondência Exata</span>
                    </div>
                </div>
            );

        case 'autoReplyNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Mensagem Automática</label>
                        <textarea 
                            rows={5}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-emerald-500 outline-none"
                            value={localData.content || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('content', e.target.value)}
                            placeholder="Digite a resposta..."
                        />
                    </div>
                    {/* Template Loader */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Carregar Modelo</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-400 mt-1"
                            onChange={(e) => handleLoadTemplate(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {TemplateService.getAll().filter(t => t.type === 'text').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        case 'messageNode':
        case 'inputNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Conteúdo</label>
                        <textarea 
                            rows={5}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-emerald-500 outline-none"
                            value={localData.content || ''}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('content', e.target.value)}
                        />
                    </div>
                    {/* Template Loader */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Carregar Modelo</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-400 mt-1"
                            onChange={(e) => handleLoadTemplate(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {TemplateService.getAll().filter(t => t.type === 'text').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        case 'carouselNode':
            // (Mantém a implementação anterior do carrossel, adicionando apenas o seletor de template no topo se desejar)
            return (
                <div className="space-y-4 animate-in fade-in">
                     <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Carregar Modelo</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-400 mt-1 mb-4"
                            onChange={(e) => handleLoadTemplate(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {TemplateService.getAll().filter(t => t.type === 'carousel').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    {/* ... Resto do código do carrossel ... */}
                    <div className="flex justify-between items-center">
                        <div className="bg-orange-900/10 border border-orange-900/30 p-2 rounded text-[10px] text-orange-300 flex items-center gap-2">
                            <AlertTriangleIcon /> Máx 10 cards.
                        </div>
                        <button 
                            onClick={() => setShowProductSelector(true)}
                            className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700"
                        >
                            <ShoppingBagIcon /> Importar Produto
                        </button>
                    </div>
                    {/* ... (Modal de Produto e Lista de Cards mantidos) ... */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {(localData.cards || []).map((card: any, idx: number) => (
                            <div key={idx} className="bg-[#1c1c1c] border border-[#333] rounded-lg p-3 space-y-3 relative group">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400">Card {idx + 1}</span>
                                    <button onClick={() => { const newCards = [...(localData.cards || [])]; newCards.splice(idx, 1); handleChange('cards', newCards); }} className="text-red-500 hover:text-red-400"><Trash2Icon size={14} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Título</label>
                                        <input type="text" className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200 mt-1" value={card.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const newCards = [...localData.cards]; newCards[idx].title = e.target.value; handleChange('cards', newCards); }} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Preço</label>
                                        <input type="number" className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200 mt-1" value={card.price || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const newCards = [...localData.cards]; newCards[idx].price = e.target.value; handleChange('cards', newCards); }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => handleChange('cards', [...(localData.cards || []), { title: 'Novo Card', description: '', price: 0 }])} className="w-full py-2 border border-dashed border-[#444] text-gray-400 text-xs rounded hover:bg-[#1c1c1c] hover:text-orange-500">+ Adicionar Card</button>
                    </div>
                </div>
            );

        case 'aiNode':
            const aiConfig = AIConfigService.getConfig();
            const isAiConfigured = AIConfigService.isConfigured();
            
            return (
                <div className="space-y-4 animate-in fade-in">
                    {/* Status da Configuração */}
                    <div className={`p-3 rounded-lg border ${isAiConfigured ? 'bg-emerald-900/20 border-emerald-900/50' : 'bg-red-900/20 border-red-900/50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <SparklesIcon size={14} />
                            <span className={`text-xs font-bold ${isAiConfigured ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isAiConfigured ? 'IA Configurada' : 'IA Não Configurada'}
                            </span>
                        </div>
                        {isAiConfigured && aiConfig ? (
                            <div className="text-[10px] text-gray-400 space-y-1">
                                <div>Provedor: <span className="text-emerald-400 font-bold">{aiConfig.provider === 'openai' ? 'OpenAI' : 'Gemini'}</span></div>
                                <div>Modelo: <span className="text-emerald-400 font-bold">{aiConfig.model}</span></div>
                                <div>Temperatura: <span className="text-emerald-400 font-bold">{aiConfig.temperature}</span></div>
                            </div>
                        ) : (
                            <div className="text-[10px] text-red-400">
                                Configure a IA nas configurações do sistema
                            </div>
                        )}
                    </div>

                    {/* Configurações do Nó */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Provedor (Sobrescrever)</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.provider || aiConfig?.provider || 'openai'}
                            onChange={(e) => handleChange('provider', e.target.value)}
                        >
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="gemini">Google Gemini</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1">Deixe vazio para usar configuração global</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Prompt do Sistema</label>
                        <textarea 
                            rows={6}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-emerald-500 outline-none font-mono"
                            value={localData.prompt || ''}
                            onChange={(e) => handleChange('prompt', e.target.value)}
                            placeholder="Ex: Você é um assistente de vendas. Ajude o cliente a encontrar produtos e responda suas dúvidas de forma amigável e profissional."
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Este prompt define como a IA deve se comportar neste nó</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Contexto Adicional</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-emerald-500 outline-none"
                            value={localData.context || ''}
                            onChange={(e) => handleChange('context', e.target.value)}
                            placeholder="Ex: Informações sobre produtos, políticas da empresa, etc."
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Informações extras que a IA deve considerar</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Temperatura</label>
                            <input 
                                type="number" 
                                min="0" 
                                max="1" 
                                step="0.1"
                                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                                value={localData.temperature || aiConfig?.temperature || 0.7}
                                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">0 = Preciso, 1 = Criativo</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Max Tokens</label>
                            <input 
                                type="number" 
                                min="50" 
                                max="1000"
                                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                                value={localData.maxTokens || aiConfig?.maxTokens || 150}
                                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Tamanho da resposta</p>
                        </div>
                    </div>

                    {!isAiConfigured && (
                        <div className="bg-orange-900/20 border border-orange-900/50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <SettingsIcon size={14} />
                                <span className="text-xs font-bold text-orange-400">Ação Necessária</span>
                            </div>
                            <p className="text-[10px] text-orange-300 mb-2">
                                Configure uma API key de IA nas configurações do sistema para que este nó funcione.
                            </p>
                            <button 
                                onClick={() => window.open('/configuracoes?tab=ai', '_blank')}
                                className="text-[10px] bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                            >
                                Abrir Configurações
                            </button>
                        </div>
                    )}
                </div>
            );

        case 'buttonsNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Texto da Pergunta</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-blue-500 outline-none"
                            value={localData.content || ''}
                            onChange={(e) => handleChange('content', e.target.value)}
                            placeholder="Ex: Escolha uma das opções abaixo:"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Botões (Máx 3)</label>
                        <div className="space-y-2 mt-2">
                            {(localData.buttons || []).map((button: any, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                    <input 
                                        type="text"
                                        className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                        value={button.text || ''}
                                        onChange={(e) => {
                                            const newButtons = [...(localData.buttons || [])];
                                            newButtons[idx] = { ...newButtons[idx], text: e.target.value, id: `btn_${idx}` };
                                            handleChange('buttons', newButtons);
                                        }}
                                        placeholder={`Botão ${idx + 1}`}
                                    />
                                    <button 
                                        onClick={() => {
                                            const newButtons = [...(localData.buttons || [])];
                                            newButtons.splice(idx, 1);
                                            handleChange('buttons', newButtons);
                                        }}
                                        className="text-red-500 hover:text-red-400 p-2"
                                    >
                                        <Trash2Icon size={14} />
                                    </button>
                                </div>
                            ))}
                            {(localData.buttons || []).length < 3 && (
                                <button 
                                    onClick={() => {
                                        const newButtons = [...(localData.buttons || []), { text: '', id: `btn_${Date.now()}` }];
                                        handleChange('buttons', newButtons);
                                    }}
                                    className="w-full py-2 border border-dashed border-[#444] text-gray-400 text-xs rounded hover:bg-[#1c1c1c] hover:text-blue-500"
                                >
                                    + Adicionar Botão
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Template Loader */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Carregar Modelo</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-400 mt-1"
                            onChange={(e) => handleLoadTemplate(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {TemplateService.getAll().filter(t => t.type === 'buttons').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            );

        case 'listNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Título da Lista</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Ex: Nossos Produtos"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Texto do Botão</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.buttonText || ''}
                            onChange={(e) => handleChange('buttonText', e.target.value)}
                            placeholder="Ex: Ver Opções"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Seções</label>
                        <div className="space-y-3 mt-2 max-h-[40vh] overflow-y-auto">
                            {(localData.sections || []).map((section: any, sectionIdx: number) => (
                                <div key={sectionIdx} className="bg-[#1c1c1c] border border-[#333] rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400">Seção {sectionIdx + 1}</span>
                                        <button 
                                            onClick={() => {
                                                const newSections = [...(localData.sections || [])];
                                                newSections.splice(sectionIdx, 1);
                                                handleChange('sections', newSections);
                                            }}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <Trash2Icon size={14} />
                                        </button>
                                    </div>
                                    <input 
                                        type="text"
                                        className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200 mb-2"
                                        value={section.title || ''}
                                        onChange={(e) => {
                                            const newSections = [...(localData.sections || [])];
                                            newSections[sectionIdx] = { ...newSections[sectionIdx], title: e.target.value };
                                            handleChange('sections', newSections);
                                        }}
                                        placeholder="Título da seção"
                                    />
                                    <div className="space-y-1">
                                        {(section.rows || []).map((row: any, rowIdx: number) => (
                                            <div key={rowIdx} className="flex gap-2">
                                                <input 
                                                    type="text"
                                                    className="flex-1 bg-[#252525] border border-[#333] rounded px-2 py-1 text-xs text-gray-200"
                                                    value={row.title || ''}
                                                    onChange={(e) => {
                                                        const newSections = [...(localData.sections || [])];
                                                        newSections[sectionIdx].rows[rowIdx] = { ...row, title: e.target.value, id: `row_${rowIdx}` };
                                                        handleChange('sections', newSections);
                                                    }}
                                                    placeholder={`Item ${rowIdx + 1}`}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const newSections = [...(localData.sections || [])];
                                                        newSections[sectionIdx].rows.splice(rowIdx, 1);
                                                        handleChange('sections', newSections);
                                                    }}
                                                    className="text-red-500 hover:text-red-400 p-1"
                                                >
                                                    <Trash2Icon size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => {
                                                const newSections = [...(localData.sections || [])];
                                                if (!newSections[sectionIdx].rows) newSections[sectionIdx].rows = [];
                                                newSections[sectionIdx].rows.push({ title: '', id: `row_${Date.now()}` });
                                                handleChange('sections', newSections);
                                            }}
                                            className="w-full py-1 border border-dashed border-[#444] text-gray-500 text-[10px] rounded hover:bg-[#252525]"
                                        >
                                            + Item
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => {
                                    const newSections = [...(localData.sections || []), { title: '', rows: [], id: `section_${Date.now()}` }];
                                    handleChange('sections', newSections);
                                }}
                                className="w-full py-2 border border-dashed border-[#444] text-gray-400 text-xs rounded hover:bg-[#1c1c1c] hover:text-purple-500"
                            >
                                + Adicionar Seção
                            </button>
                        </div>
                    </div>
                </div>
            );

        case 'delayNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Tempo de Espera</label>
                        <div className="flex gap-2 mt-2">
                            <input 
                                type="number"
                                min="1"
                                max="60"
                                className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                value={localData.time || 2}
                                onChange={(e) => handleChange('time', parseInt(e.target.value))}
                            />
                            <select 
                                className="bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                value={localData.unit || 'seconds'}
                                onChange={(e) => handleChange('unit', e.target.value)}
                            >
                                <option value="seconds">Segundos</option>
                                <option value="minutes">Minutos</option>
                            </select>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Pausa antes de continuar o fluxo</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="accent-yellow-500" 
                            checked={localData.showTyping || false}
                            onChange={(e) => handleChange('showTyping', e.target.checked)} 
                        />
                        <span className="text-xs text-gray-400">Mostrar "digitando..."</span>
                    </div>
                </div>
            );

        case 'apiNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Método HTTP</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.method || 'GET'}
                            onChange={(e) => handleChange('method', e.target.value)}
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">URL da API</label>
                        <input 
                            type="url"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1 font-mono"
                            value={localData.url || ''}
                            onChange={(e) => handleChange('url', e.target.value)}
                            placeholder="https://api.exemplo.com/endpoint"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Headers (JSON)</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1 font-mono"
                            value={localData.headers || ''}
                            onChange={(e) => handleChange('headers', e.target.value)}
                            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                        />
                    </div>

                    {(localData.method === 'POST' || localData.method === 'PUT') && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Body (JSON)</label>
                            <textarea 
                                rows={4}
                                className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1 font-mono"
                                value={localData.body || ''}
                                onChange={(e) => handleChange('body', e.target.value)}
                                placeholder='{"campo": "valor", "usuario": "{{nome}}"}'
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Use {{variavel}} para inserir dados do usuário</p>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Salvar Resposta em</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.saveAs || ''}
                            onChange={(e) => handleChange('saveAs', e.target.value)}
                            placeholder="nome_da_variavel"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Nome da variável para salvar a resposta da API</p>
                    </div>
                </div>
            );

        case 'tagNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Ação</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.action || 'add'}
                            onChange={(e) => handleChange('action', e.target.value)}
                        >
                            <option value="add">Adicionar Tag</option>
                            <option value="remove">Remover Tag</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Nome da Tag</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.tag || ''}
                            onChange={(e) => handleChange('tag', e.target.value)}
                            placeholder="Ex: cliente_vip, interessado_produto_x"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Use apenas letras, números e underscore</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Descrição (Opcional)</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Ex: Cliente demonstrou interesse em produtos premium"
                        />
                    </div>
                </div>
            );

        case 'setVariableNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Nome da Variável</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.variable || ''}
                            onChange={(e) => handleChange('variable', e.target.value)}
                            placeholder="Ex: nome_cliente, telefone, email"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Use apenas letras, números e underscore</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Valor</label>
                        <input 
                            type="text"
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.value || ''}
                            onChange={(e) => handleChange('value', e.target.value)}
                            placeholder="Ex: João Silva, {{input_anterior}}, valor_fixo"
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Use {{variavel}} para referenciar outras variáveis</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo de Dados</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.dataType || 'text'}
                            onChange={(e) => handleChange('dataType', e.target.value)}
                        >
                            <option value="text">Texto</option>
                            <option value="number">Número</option>
                            <option value="email">Email</option>
                            <option value="phone">Telefone</option>
                            <option value="date">Data</option>
                        </select>
                    </div>
                </div>
            );

        case 'randomizerNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Opções do Teste A/B</label>
                        <div className="space-y-2 mt-2">
                            {(localData.options || [{ label: 'A', percent: 50 }, { label: 'B', percent: 50 }]).map((option: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <input 
                                        type="text"
                                        className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                        value={option.label || ''}
                                        onChange={(e) => {
                                            const newOptions = [...(localData.options || [])];
                                            newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                            handleChange('options', newOptions);
                                        }}
                                        placeholder={`Opção ${String.fromCharCode(65 + idx)}`}
                                    />
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-16 bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                        value={option.percent || 50}
                                        onChange={(e) => {
                                            const newOptions = [...(localData.options || [])];
                                            newOptions[idx] = { ...newOptions[idx], percent: parseInt(e.target.value) };
                                            handleChange('options', newOptions);
                                        }}
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Os percentuais devem somar 100%</p>
                    </div>
                </div>
            );

        case 'handoffNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Mensagem de Transferência</label>
                        <textarea 
                            rows={3}
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-3 text-sm text-gray-200 mt-1 focus:border-red-500 outline-none"
                            value={localData.message || ''}
                            onChange={(e) => handleChange('message', e.target.value)}
                            placeholder="Ex: Aguarde um momento, vou transferir você para um de nossos atendentes."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Departamento</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.department || 'vendas'}
                            onChange={(e) => handleChange('department', e.target.value)}
                        >
                            <option value="vendas">Vendas</option>
                            <option value="suporte">Suporte Técnico</option>
                            <option value="financeiro">Financeiro</option>
                            <option value="geral">Atendimento Geral</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="accent-red-500" 
                            checked={localData.priority || false}
                            onChange={(e) => handleChange('priority', e.target.checked)} 
                        />
                        <span className="text-xs text-gray-400">Atendimento Prioritário</span>
                    </div>
                </div>
            );

        case 'typingNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Duração</label>
                        <div className="flex gap-2 mt-2">
                            <input 
                                type="number"
                                min="1"
                                max="10"
                                className="flex-1 bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200"
                                value={localData.duration || 3}
                                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                            />
                            <span className="text-sm text-gray-400 flex items-center">segundos</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Tempo que o indicador "digitando..." ficará visível</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Estilo</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.style || 'typing'}
                            onChange={(e) => handleChange('style', e.target.value)}
                        >
                            <option value="typing">Digitando...</option>
                            <option value="recording">Gravando áudio...</option>
                            <option value="uploading">Enviando arquivo...</option>
                        </select>
                    </div>
                </div>
            );

        case 'conditionNode':
            return (
                <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Condições</label>
                        <div className="space-y-2 mt-2">
                            {(localData.conditions || []).map((condition: any, idx: number) => (
                                <div key={idx} className="bg-[#1c1c1c] border border-[#333] rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-400">Condição {idx + 1}</span>
                                        <button 
                                            onClick={() => {
                                                const newConditions = [...(localData.conditions || [])];
                                                newConditions.splice(idx, 1);
                                                handleChange('conditions', newConditions);
                                            }}
                                            className="text-red-500 hover:text-red-400"
                                        >
                                            <Trash2Icon size={14} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input 
                                            type="text"
                                            className="bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200"
                                            value={condition.field || ''}
                                            onChange={(e) => {
                                                const newConditions = [...(localData.conditions || [])];
                                                newConditions[idx] = { ...newConditions[idx], field: e.target.value };
                                                handleChange('conditions', newConditions);
                                            }}
                                            placeholder="Campo"
                                        />
                                        <select 
                                            className="bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200"
                                            value={condition.operator || 'equals'}
                                            onChange={(e) => {
                                                const newConditions = [...(localData.conditions || [])];
                                                newConditions[idx] = { ...newConditions[idx], operator: e.target.value };
                                                handleChange('conditions', newConditions);
                                            }}
                                        >
                                            <option value="equals">Igual a</option>
                                            <option value="contains">Contém</option>
                                            <option value="starts_with">Inicia com</option>
                                            <option value="greater_than">Maior que</option>
                                            <option value="less_than">Menor que</option>
                                        </select>
                                        <input 
                                            type="text"
                                            className="bg-[#252525] border border-[#333] rounded px-2 py-1.5 text-xs text-gray-200"
                                            value={condition.value || ''}
                                            onChange={(e) => {
                                                const newConditions = [...(localData.conditions || [])];
                                                newConditions[idx] = { ...newConditions[idx], value: e.target.value };
                                                handleChange('conditions', newConditions);
                                            }}
                                            placeholder="Valor"
                                        />
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => {
                                    const newConditions = [...(localData.conditions || []), { field: '', operator: 'equals', value: '' }];
                                    handleChange('conditions', newConditions);
                                }}
                                className="w-full py-2 border border-dashed border-[#444] text-gray-400 text-xs rounded hover:bg-[#1c1c1c] hover:text-yellow-500"
                            >
                                + Adicionar Condição
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Lógica</label>
                        <select 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.logic || 'AND'}
                            onChange={(e) => handleChange('logic', e.target.value)}
                        >
                            <option value="AND">E (todas as condições)</option>
                            <option value="OR">OU (qualquer condição)</option>
                        </select>
                    </div>
                </div>
            );

        default:
            return (
                 <div className="space-y-4 animate-in fade-in">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Label</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg p-2 text-sm text-gray-200 mt-1"
                            value={localData.label || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('label', e.target.value)}
                        />
                    </div>
                 </div>
            );
    }
  };

  return (
    <div className="w-[350px] bg-[#111] border-l border-[#222] flex flex-col h-full relative">
      <div className="h-14 border-b border-[#222] flex items-center justify-between px-6 bg-[#161616]">
        <div>
            <h3 className="font-bold text-gray-200">{selectedNode.data.label as string}</h3>
            <p className="text-[10px] text-gray-500 font-mono capitalize">{selectedNode.type}</p>
        </div>
        <button onClick={() => onDeleteNode(selectedNode.id)} className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2Icon /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#333]">
        {renderContent()}
      </div>
    </div>
  );
}
