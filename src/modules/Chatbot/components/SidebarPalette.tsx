import React from 'react';

// Custom icon components
const MessageSquareIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));
const TypeIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '4,7 4,4 20,4 20,7' }), React.createElement('line', { x1: '9', y1: '20', x2: '15', y2: '20' }), React.createElement('line', { x1: '12', y1: '4', x2: '12', y2: '20' }));
const GitForkIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '18', r: '3' }), React.createElement('circle', { cx: '6', cy: '6', r: '3' }), React.createElement('circle', { cx: '18', cy: '6', r: '3' }), React.createElement('path', { d: 'm18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9' }), React.createElement('path', { d: 'M12 12v3' }));
const SparklesIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }), React.createElement('path', { d: 'M5 3v4' }), React.createElement('path', { d: 'M19 17v4' }), React.createElement('path', { d: 'M3 5h4' }), React.createElement('path', { d: 'M17 19h4' }));
const SearchIcon = ({ size = 16, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('circle', { cx: '11', cy: '11', r: '8' }), React.createElement('path', { d: 'm21 21-4.35-4.35' }));
const GripVerticalIcon = ({ size = 14, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('circle', { cx: '9', cy: '12', r: '1' }), React.createElement('circle', { cx: '9', cy: '5', r: '1' }), React.createElement('circle', { cx: '9', cy: '19', r: '1' }), React.createElement('circle', { cx: '15', cy: '12', r: '1' }), React.createElement('circle', { cx: '15', cy: '5', r: '1' }), React.createElement('circle', { cx: '15', cy: '19', r: '1' }));
const MousePointer2Icon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm4 4 7.07 17 2.51-7.39L21 11.07z' }));
const ListIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('line', { x1: '8', y1: '6', x2: '21', y2: '6' }), React.createElement('line', { x1: '8', y1: '12', x2: '21', y2: '12' }), React.createElement('line', { x1: '8', y1: '18', x2: '21', y2: '18' }), React.createElement('line', { x1: '3', y1: '6', x2: '3.01', y2: '6' }), React.createElement('line', { x1: '3', y1: '12', x2: '3.01', y2: '12' }), React.createElement('line', { x1: '3', y1: '18', x2: '3.01', y2: '18' }));
const GalleryHorizontalIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M2 3v18h20V3' }), React.createElement('path', { d: 'M8 3v18' }), React.createElement('path', { d: 'M16 3v18' }));
const ClockIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('polyline', { points: '12,6 12,12 16,14' }));
const GlobeIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('line', { x1: '2', y1: '12', x2: '22', y2: '12' }), React.createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }));
const TagIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }), React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5' }));
const DatabaseIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }), React.createElement('path', { d: 'M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5' }), React.createElement('path', { d: 'M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3' }));
const ShuffleIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '16,3 21,3 21,8' }), React.createElement('line', { x1: '4', y1: '20', x2: '21', y2: '3' }), React.createElement('polyline', { points: '21,16 21,21 16,21' }), React.createElement('line', { x1: '15', y1: '15', x2: '21', y2: '21' }), React.createElement('line', { x1: '4', y1: '4', x2: '9', y2: '9' }));
const HeadsetIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z' }));
const ZapIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polygon', { points: '13,2 3,14 12,14 11,22 21,10 12,10 13,2' }));
const KeyIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '7.5', cy: '15.5', r: '5.5' }), React.createElement('path', { d: 'm21 2-9.6 9.6' }), React.createElement('path', { d: 'm15.5 7.5 3 3L22 7l-3-3' }));

export function SidebarPalette() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const DraggableItem = ({ type, label, icon: Icon, color, desc }: {
    type: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    color: string;
    desc: string;
  }) => (
    <div 
      className="group flex items-center gap-3 p-3 bg-[#1c1c1c] border border-[#333] rounded-xl cursor-grab hover:border-gray-500 hover:bg-[#252525] transition-all"
      onDragStart={(event) => onDragStart(event, type, label)}
      draggable
    >
      <div className={`p-2 rounded-lg bg-opacity-10 text-${color}-500 bg-${color}-500 group-hover:bg-${color}-500 group-hover:text-white transition-colors`}>
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-[10px] text-gray-500">{desc}</p>
      </div>
      <GripVerticalIcon size={14} className="text-[#333] group-hover:text-gray-500" />
    </div>
  );

  return (
    <div className="w-[280px] bg-[#111] border-r border-[#222] flex flex-col h-full text-gray-300">
      <div className="p-4 border-b border-[#222]">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar nodes..." 
            className="w-full bg-[#1c1c1c] border border-[#333] rounded-lg py-2 pl-9 pr-3 text-sm text-gray-300 focus:outline-none focus:border-emerald-600 transition-colors placeholder-gray-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#333]">
        
        {/* Triggers (Novo) */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Gatilhos</h3>
          <div className="space-y-2">
            <DraggableItem type="keywordNode" label="Palavra Chave" icon={KeyIcon} color="yellow" desc="Inicia com texto específico" />
          </div>
        </div>

        {/* Mensagens e Interação */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Envio de Conteúdo</h3>
          <div className="space-y-2">
            <DraggableItem type="messageNode" label="Texto Simples" icon={MessageSquareIcon} color="emerald" desc="Texto, imagem, vídeo" />
            <DraggableItem type="autoReplyNode" label="Resposta Automática" icon={ZapIcon} color="emerald" desc="Resposta simples rápida" />
            <DraggableItem type="buttonsNode" label="Botões" icon={MousePointer2Icon} color="blue" desc="Até 3 opções" />
            <DraggableItem type="listNode" label="Lista / Menu" icon={ListIcon} color="purple" desc="Menu de opções" />
            <DraggableItem type="carouselNode" label="Carrossel" icon={GalleryHorizontalIcon} color="orange" desc="Cards deslizáveis" />
          </div>
        </div>

        {/* Captura de Dados */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Captura de Dados</h3>
          <div className="space-y-2">
             <DraggableItem type="inputNode" label="Pergunta (Input)" icon={TypeIcon} color="gray" desc="Salvar resposta do usuário" />
             <DraggableItem type="setVariableNode" label="Definir Variável" icon={DatabaseIcon} color="orange" desc="Salvar dados no CRM" />
          </div>
        </div>

        {/* Lógica e Fluxo */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Lógica & Fluxo</h3>
          <div className="space-y-2">
            <DraggableItem type="conditionNode" label="Condição" icon={GitForkIcon} color="yellow" desc="Ramificar fluxo (Se/Então)" />
            <DraggableItem type="randomizerNode" label="Randomizador" icon={ShuffleIcon} color="purple" desc="Teste A/B (50/50)" />
            <DraggableItem type="typingNode" label="Digitando..." icon={ClockIcon} color="blue" desc="Delay visual" />
            <DraggableItem type="handoffNode" label="Falar com Humano" icon={HeadsetIcon} color="red" desc="Transferir atendimento" />
          </div>
        </div>

        {/* Integrações */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 px-1">Integrações</h3>
          <div className="space-y-2">
            <DraggableItem type="apiNode" label="Requisição HTTP" icon={GlobeIcon} color="cyan" desc="Webhook / API Externa" />
            <DraggableItem type="aiNode" label="Agente IA" icon={SparklesIcon} color="emerald" desc="ChatGPT / Gemini" />
            <DraggableItem type="tagNode" label="Gerenciar Tag" icon={TagIcon} color="pink" desc="Adicionar/Remover tag" />
          </div>
        </div>

      </div>
    </div>
  );
}
