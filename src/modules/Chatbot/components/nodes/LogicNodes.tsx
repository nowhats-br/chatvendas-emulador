import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '../../../../lib/utils';

// Custom icon components
const DatabaseIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }), React.createElement('path', { d: 'M3 5V19A9 3 0 0 0 21 19V5' }), React.createElement('path', { d: 'M3 12A9 3 0 0 0 21 12' }));
const ShuffleIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '16,3 21,3 21,8' }), React.createElement('line', { x1: '4', y1: '20', x2: '21', y2: '3' }), React.createElement('polyline', { points: '21,16 21,21 16,21' }), React.createElement('line', { x1: '15', y1: '15', x2: '21', y2: '21' }), React.createElement('line', { x1: '4', y1: '4', x2: '9', y2: '9' }));
const HeadsetIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z' }));
const ClockIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }), React.createElement('polyline', { points: '12,6 12,12 16,14' }));
const VariableIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }), React.createElement('path', { d: 'm16 3s4 3 4 9-4 9-4 9' }), React.createElement('line', { x1: '15', y1: '9', x2: '9', y2: '15' }), React.createElement('line', { x1: '9', y1: '9', x2: '15', y2: '15' }));
const SplitIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M16 3h5v5' }), React.createElement('path', { d: 'm21 3-7 7' }), React.createElement('path', { d: 'm13 13 7 7' }), React.createElement('path', { d: 'M8 21H3v-5' }));
const UserCogIcon = () => React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '18', cy: '15', r: '3' }), React.createElement('circle', { cx: '9', cy: '7', r: '4' }), React.createElement('path', { d: 'm13 14 2.9 5.7a1 1 0 0 0 1.8-.4l1.6-2.9a1 1 0 0 1 .8-.4h2.4a1 1 0 0 0 .8-1.6L21.7 12' }), React.createElement('path', { d: 'M2 21a8 8 0 0 1 10.434-7.62' }));

// Wrapper reutilizável para manter o padrão visual Dark/Neon
const NodeWrapper = ({ selected, title, icon: Icon, colorClass, children, handles = true }: any) => (
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
        <Handle type="target" position={Position.Left} className="!bg-[#555] !w-3 !h-3 !border-2 !border-[#1c1c1c]" />
        <Handle type="source" position={Position.Right} className={cn(`!bg-${colorClass}-500`, "!w-3 !h-3 !border-2 !border-[#1c1c1c]")} />
      </>
    )}
  </div>
);

// --- 1. Set Variable Node (Salvar Dados) ---
export const SetVariableNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Definir Variável" icon={DatabaseIcon} colorClass="orange">
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Variável:</span>
        <span className="text-orange-400 font-mono bg-orange-900/20 px-1 rounded">
            {`{{${String(data.variable || 'nome')}}}`}
        </span>
      </div>
      <div className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-xs text-gray-300">
        <span className="text-gray-500">Valor:</span> {String(data.value || 'Input do Usuário')}
      </div>
    </div>
  </NodeWrapper>
));

// --- 2. Randomizer Node (Teste A/B) ---
export const RandomizerNode = React.memo(({ data, selected }: NodeProps) => {
    const options = (data.options as any[]) || [{ label: 'A', percent: 50 }, { label: 'B', percent: 50 }];
    return (
        <div className={cn(
            "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
            selected ? "border-purple-500" : "border-[#333]"
        )}>
            <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2 bg-[#252525] rounded-t-lg">
                <ShuffleIcon />
                <span className="font-semibold text-gray-200 text-sm">Randomizador</span>
            </div>
            <div className="p-4 space-y-2">
                {options.map((opt: any, idx: number) => (
                    <div key={idx} className="relative flex justify-between items-center bg-[#2a2a2a] p-2 rounded border border-[#333]">
                        <span className="text-xs text-gray-300">Caminho {String(opt.label)}</span>
                        <span className="text-xs font-bold text-purple-400">{String(opt.percent)}%</span>
                        
                        <Handle 
                            type="source" 
                            position={Position.Right} 
                            id={`handle-${idx}`}
                            style={{ top: '50%', right: -14 }}
                            className="!bg-purple-500 !w-2.5 !h-2.5" 
                        />
                    </div>
                ))}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-[#555]" />
        </div>
    );
});

// --- 3. Handoff Node (Transbordo Humano) ---
export const HandoffNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Falar com Humano" icon={HeadsetIcon} colorClass="red">
    <div className="text-center py-2">
        <div className="text-xs text-gray-400 mb-1">Departamento</div>
        <div className="text-sm font-bold text-white bg-red-900/20 py-1 px-3 rounded border border-red-900/50 inline-block">
            {String(data.department || 'Geral')}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">O bot irá parar de responder aqui.</p>
    </div>
  </NodeWrapper>
));

// --- 4. Typing Node (Delay Visual) ---
export const TypingNode = React.memo(({ data, selected }: NodeProps) => (
    <div className={cn(
        "px-4 py-2 rounded-full border-2 bg-[#1c1c1c] flex items-center gap-3 shadow-lg min-w-[180px]",
        selected ? "border-blue-500" : "border-[#333]"
    )}>
        <ClockIcon />
        <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-200">Digitando...</span>
            <span className="text-[10px] text-gray-500">{String(data.duration || 3)} segundos</span>
        </div>
        <Handle type="target" position={Position.Left} className="!bg-[#555]" />
        <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </div>
));

// --- 5. Condition Node (If/Else) ---
export const ConditionNode = React.memo(({ data, selected }: NodeProps) => {
    const conditions = (data.conditions as any[]) || [{ field: 'nome', operator: 'contains', value: 'João' }];
    return (
        <div className={cn(
            "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
            selected ? "border-yellow-500" : "border-[#333]"
        )}>
            <div className="px-4 py-2 border-b border-[#333] flex items-center gap-2 bg-[#252525] rounded-t-lg">
                <SplitIcon />
                <span className="font-semibold text-gray-200 text-sm">Condição</span>
            </div>
            <div className="p-4 space-y-2">
                {conditions.map((cond: any, idx: number) => (
                    <div key={idx} className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-xs text-gray-300">
                        <span className="text-yellow-400 font-mono">{`{{${String(cond.field)}}}`}</span>
                        <span className="mx-1 text-gray-500">{String(cond.operator)}</span>
                        <span className="text-white">"{String(cond.value)}"</span>
                    </div>
                ))}
                
                <div className="flex justify-between mt-3">
                    <div className="relative bg-green-900/20 text-green-400 text-center text-xs py-1 px-2 rounded border border-green-900/50 flex-1 mr-1">
                        Verdadeiro
                        <Handle 
                            type="source" 
                            position={Position.Right} 
                            id="true"
                            style={{ top: '50%', right: -14 }}
                            className="!bg-green-500 !w-2.5 !h-2.5" 
                        />
                    </div>
                    <div className="relative bg-red-900/20 text-red-400 text-center text-xs py-1 px-2 rounded border border-red-900/50 flex-1 ml-1">
                        Falso
                        <Handle 
                            type="source" 
                            position={Position.Right} 
                            id="false"
                            style={{ top: '50%', right: -14 }}
                            className="!bg-red-500 !w-2.5 !h-2.5" 
                        />
                    </div>
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!bg-[#555]" />
        </div>
    );
});

// --- 6. User Input Node (Capturar Dados) ---
export const UserInputNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Capturar Dados" icon={UserCogIcon} colorClass="teal">
    <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tipo:</span>
            <span className="text-teal-400 font-bold uppercase">{String(data.inputType || 'text')}</span>
        </div>
        <div className="bg-[#2a2a2a] p-2 rounded border border-[#333] text-xs text-gray-300">
            <span className="text-gray-500">Salvar em:</span> 
            <span className="text-teal-400 font-mono ml-1">{`{{${String(data.saveAs || 'user_input')}}}`}</span>
        </div>
        {data.validation ? (
            <div className="text-[10px] text-gray-500 bg-[#333] p-1 rounded">
                Validação: {String(data.validation)}
            </div>
        ) : null}
    </div>
  </NodeWrapper>
));

// --- 7. Variable Display Node (Mostrar Variável) ---
export const VariableDisplayNode = React.memo(({ data, selected }: NodeProps) => (
  <NodeWrapper selected={selected} title="Mostrar Variável" icon={VariableIcon} colorClass="indigo">
    <div className="text-center py-2">
        <div className="text-xs text-gray-400 mb-2">Variável a exibir:</div>
        <div className="text-sm font-mono text-indigo-400 bg-indigo-900/20 py-1 px-3 rounded border border-indigo-900/50 inline-block">
            {`{{${String(data.variable || 'nome_usuario')}}}`}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">Será substituído pelo valor real</p>
    </div>
  </NodeWrapper>
));