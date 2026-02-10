import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '../../../../lib/utils';
import { AIConfigService } from '../../../../services/AIConfigService';

// Componentes de ícones usando React.createElement
const List = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('line', { x1: '8', x2: '21', y1: '6', y2: '6' }),
  React.createElement('line', { x1: '8', x2: '21', y1: '12', y2: '12' }),
  React.createElement('line', { x1: '8', x2: '21', y1: '18', y2: '18' }),
  React.createElement('line', { x1: '3', x2: '3.01', y1: '6', y2: '6' }),
  React.createElement('line', { x1: '3', x2: '3.01', y1: '12', y2: '12' }),
  React.createElement('line', { x1: '3', x2: '3.01', y1: '18', y2: '18' }));

const MousePointer2 = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm4 4 7.07 17 2.51-7.39L21 11.07z' }));

const GalleryHorizontal = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M2 3v18h20V3' }),
  React.createElement('path', { d: 'M8 21V7a4 4 0 0 1 8 0v14' }),
  React.createElement('path', { d: 'M19 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1' }),
  React.createElement('path', { d: 'M3 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const Tag = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
  React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }));

const Globe = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('path', { d: 'm21.54 15.88-10.54-10.54' }),
  React.createElement('path', { d: 'm21.54 8.12-10.54 10.54' }));

const Sparkles = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
  React.createElement('path', { d: 'M5 3v4' }),
  React.createElement('path', { d: 'M19 17v4' }),
  React.createElement('path', { d: 'M3 5h4' }),
  React.createElement('path', { d: 'M17 19h4' }));

// --- Base Wrapper ---
const NodeWrapper = ({ selected, title, icon: Icon, colorClass, children, handles = true }: any) => (
  <div className={cn(
    "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
    selected ? `border-${colorClass}-500 shadow-[0_0_20px_rgba(var(--${colorClass}-rgb),0.2)]` : "border-[#333] hover:border-[#444]"
  )}>
    <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2 bg-[#252525] rounded-t-lg">
      <div className={cn("p-1.5 rounded bg-opacity-10", `bg-${colorClass}-500 text-${colorClass}-500`)}>
        <Icon size={14} />
      </div>
      <span className="font-semibold text-gray-200 text-sm">{title}</span>
    </div>
    <div className="p-4">{children}</div>
    {handles && (
      <>
        <Handle type="target" position={Position.Left} className="!bg-[#555] !w-3 !h-3 !border-2 !border-[#1c1c1c]" />
        <Handle type="source" position={Position.Right} className={cn(`!bg-${colorClass}-500`, "!w-3 !h-3 !border-2 !border-[#1c1c1c]")} />
      </>
    )}
  </div>
);

// --- 1. Buttons Node ---
export const ButtonsNode = React.memo(({ data, selected }: NodeProps) => {
  const buttons = (data.buttons as any[]) || [];
  return (
    <div className={cn(
        "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
        selected ? "border-blue-500" : "border-[#333]"
    )}>
        <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2 bg-[#252525] rounded-t-lg">
            <MousePointer2 size={14} className="text-blue-500" />
            <span className="font-semibold text-gray-200 text-sm">{data.label as string}</span>
        </div>
        <div className="p-4 space-y-3">
            <p className="text-sm text-gray-300 bg-[#2a2a2a] p-2 rounded">{data.content as string || 'Texto da pergunta...'}</p>
            <div className="space-y-2">
                {buttons.map((btn, idx) => (
                    <div key={idx} className="relative">
                        <div className="bg-[#333] text-blue-400 text-center text-xs py-2 rounded border border-[#444] font-medium">
                            {btn.text}
                        </div>
                        {/* Cada botão tem seu próprio Handle de saída */}
                        <Handle 
                            type="source" 
                            position={Position.Right} 
                            id={`button-${btn.id || idx}`}
                            style={{ top: '50%', right: -14 }}
                            className="!bg-blue-500 !w-2.5 !h-2.5" 
                        />
                    </div>
                ))}
            </div>
            {buttons.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                    Configure os botões no painel lateral
                </div>
            )}
        </div>
        <Handle type="target" position={Position.Left} className="!bg-[#555]" />
    </div>
  );
});

// --- 2. List Node ---
export const ListNode = React.memo(({ data, selected }: NodeProps) => {
    const sections = (data.sections as any[]) || [];
    const totalItems = sections.reduce((acc, section) => acc + (section.rows?.length || 0), 0);
    
    return (
        <NodeWrapper selected={selected} title={data.label} icon={List} colorClass="purple">
            <p className="text-sm text-gray-300 mb-2">{data.title as string || 'Título da Lista'}</p>
            <div className="bg-[#2a2a2a] rounded border border-[#333] divide-y divide-[#333]">
                <div className="p-2 text-center text-xs text-purple-400 font-bold">
                    {data.buttonText as string || 'Abrir Menu'}
                </div>
                {sections.slice(0, 2).map((section, i) => (
                    <div key={i} className="p-2">
                        <div className="text-xs text-purple-300 font-bold mb-1">{section.title}</div>
                        {(section.rows || []).slice(0, 2).map((row: any, j: number) => (
                            <div key={j} className="text-xs text-gray-400 ml-2">• {row.title}</div>
                        ))}
                        {(section.rows?.length || 0) > 2 && (
                            <div className="text-[10px] text-gray-600 ml-2">...mais {(section.rows?.length || 0) - 2}</div>
                        )}
                    </div>
                ))}
                {sections.length > 2 && (
                    <div className="p-1 text-[10px] text-center text-gray-600">
                        ...mais {sections.length - 2} seções
                    </div>
                )}
                {totalItems === 0 && (
                    <div className="p-2 text-xs text-gray-500 text-center">
                        Configure as opções no painel lateral
                    </div>
                )}
            </div>
            {/* Handle de saída para cada seção */}
            {sections.map((section, idx) => (
                <Handle 
                    key={`section-${idx}`}
                    type="source" 
                    position={Position.Right} 
                    id={`section-${section.id || idx}`}
                    style={{ top: `${30 + (idx * 20)}%`, right: -14 }}
                    className="!bg-purple-500 !w-2.5 !h-2.5" 
                />
            ))}
        </NodeWrapper>
    );
});

// --- 3. Carousel Node ---
export const CarouselNode = React.memo(({ data, selected }: NodeProps) => {
    const cards = (data.cards as any[]) || [];
    return (
        <NodeWrapper selected={selected} title={data.label} icon={GalleryHorizontal} colorClass="orange">
            <div className="flex gap-2 overflow-hidden opacity-80">
                {(cards.length > 0 ? cards : [{}]).slice(0, 2).map((_, i) => (
                    <div key={i} className="w-20 h-24 bg-[#333] rounded border border-[#444] flex flex-col items-center justify-center">
                        <div className="w-8 h-8 bg-[#222] rounded mb-1" />
                        <div className="w-12 h-2 bg-[#222] rounded" />
                    </div>
                ))}
                <div className="w-4 flex items-center justify-center text-gray-600">›</div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 text-center">{cards.length} cards configurados</p>
        </NodeWrapper>
    );
});

// --- 4. AI Node (ChatGPT/Gemini) ---
export const AiNode = React.memo(({ data, selected }: NodeProps) => {
    const aiConfig = AIConfigService.getConfig();
    const isConfigured = AIConfigService.isConfigured();
    const currentProvider = data.provider || aiConfig?.provider || 'openai';
    const providerName = currentProvider === 'openai' ? 'OpenAI' : 'Gemini';
    
    return (
        <NodeWrapper selected={selected} title={data.label} icon={Sparkles} colorClass="emerald">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Provedor:</span>
                    <div className="flex items-center gap-1">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isConfigured ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className={cn(
                            "font-bold uppercase text-[10px]",
                            isConfigured ? "text-emerald-400" : "text-red-400"
                        )}>
                            {providerName}
                        </span>
                    </div>
                </div>
                {isConfigured && aiConfig && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Modelo:</span>
                        <span className="text-emerald-400 font-bold text-[10px] uppercase">
                            {aiConfig.model}
                        </span>
                    </div>
                )}
                <div className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-[10px] text-gray-300 h-16 overflow-hidden">
                    <span className="text-emerald-600 font-bold">Prompt:</span> {data.prompt as string || 'Configure o prompt no painel lateral...'}
                </div>
                {!isConfigured && (
                    <div className="text-[10px] text-red-400 text-center bg-red-900/20 p-1 rounded border border-red-900/50">
                        ⚠️ IA não configurada
                    </div>
                )}
            </div>
        </NodeWrapper>
    );
});

// --- 5. Delay Node ---
export const DelayNode = React.memo(({ data, selected }: NodeProps) => (
    <div className={cn(
        "w-[150px] rounded-full border-2 bg-[#1c1c1c] flex items-center justify-center py-2 px-4 shadow-lg",
        selected ? "border-yellow-500" : "border-[#333]"
    )}>
        <Clock size={16} className="text-yellow-500 mr-2" />
        <span className="text-sm font-bold text-gray-200">{String(data.time || 2)} seg</span>
        <Handle type="target" position={Position.Left} className="!bg-[#555]" />
        <Handle type="source" position={Position.Right} className="!bg-yellow-500" />
    </div>
));

// --- 6. API Node ---
export const ApiNode = React.memo(({ data, selected }: NodeProps) => (
    <NodeWrapper selected={selected} title={data.label || 'Requisição HTTP'} icon={Globe} colorClass="cyan">
        <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", 
                data.method === 'GET' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
            )}>{String(data.method || 'GET')}</span>
            <span className="text-xs text-gray-400 truncate">{String(data.url || 'https://api...')}</span>
        </div>
    </NodeWrapper>
));

// --- 7. Tag Node ---
export const TagNode = React.memo(({ data, selected }: NodeProps) => (
    <div className={cn(
        "w-[180px] rounded-lg border-2 bg-[#1c1c1c] p-3 shadow-lg",
        selected ? "border-pink-500" : "border-[#333]"
    )}>
        <div className="flex items-center gap-2 mb-1">
            <Tag size={14} className="text-pink-500" />
            <span className="text-xs font-bold text-gray-300">{data.action === 'remove' ? 'Remover Tag' : 'Adicionar Tag'}</span>
        </div>
        <div className="bg-pink-900/20 text-pink-400 text-xs px-2 py-1 rounded text-center border border-pink-900/50">
            {String(data.tag || 'Nova Tag')}
        </div>
        <Handle type="target" position={Position.Left} className="!bg-[#555]" />
        <Handle type="source" position={Position.Right} className="!bg-pink-500" />
    </div>
));
