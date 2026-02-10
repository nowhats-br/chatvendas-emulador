import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '../../../../lib/utils';

// Custom icon components
const KeyIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '7.5', cy: '15.5', r: '5.5' }), React.createElement('path', { d: 'm21 2-9.6 9.6' }), React.createElement('path', { d: 'm15.5 7.5 3 3L22 7l-3-3' }));
const ZapIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polygon', { points: '13,2 3,14 12,14 11,22 21,10 12,10 13,2' }));

// --- Wrapper (Reutilizado) ---
const NodeWrapper = ({ selected, title, icon: Icon, colorClass, children, handles = true, isTrigger = false }: any) => (
  <div className={cn(
    "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
    selected ? `border-${colorClass}-500 shadow-[0_0_20px_rgba(var(--${colorClass}-rgb),0.2)]` : "border-[#333] hover:border-[#444]"
  )}>
    <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2 bg-[#252525] rounded-t-lg">
      <div className={cn("p-1.5 rounded bg-opacity-10", `bg-${colorClass}-500 text-${colorClass}-500`)}>
        <Icon />
      </div>
      <span className="font-semibold text-gray-200 text-sm">{title}</span>
    </div>
    <div className="p-4">{children}</div>
    {handles && (
      <>
        {!isTrigger && <Handle type="target" position={Position.Left} className="!bg-[#555] !w-3 !h-3 !border-2 !border-[#1c1c1c]" />}
        <Handle type="source" position={Position.Right} className={cn(`!bg-${colorClass}-500`, "!w-3 !h-3 !border-2 !border-[#1c1c1c]")} />
      </>
    )}
  </div>
);

// --- 1. Keyword Trigger Node ---
export const KeywordNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Palavra Chave" icon={KeyIcon} colorClass="yellow" isTrigger={true}>
    <div className="space-y-2">
      <p className="text-xs text-gray-400">Disparar quando usuário digitar:</p>
      <div className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-sm text-yellow-400 font-mono break-words">
        {String(data.keywords || 'Ex: oi, olá, preço')}
      </div>
      <div className="text-[10px] text-gray-500 flex gap-2">
         <span className="bg-[#333] px-1 rounded">Exato</span>
         <span className="bg-[#333] px-1 rounded">Contém</span>
      </div>
    </div>
  </NodeWrapper>
));

// --- 2. Auto Reply Node ---
export const AutoReplyNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Resposta Automática" icon={ZapIcon} colorClass="emerald">
    <div className="space-y-2">
      <div className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-sm text-gray-300 italic">
        "{String(data.content || 'Mensagem rápida...')}"
      </div>
      <div className="flex justify-between text-[10px] text-gray-500">
          <span>Sem delay</span>
          <span>Texto puro</span>
      </div>
    </div>
  </NodeWrapper>
));
