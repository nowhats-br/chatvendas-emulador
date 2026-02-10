import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Custom icon component
const PlayIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polygon', { points: '5,3 19,12 5,21' }));

export function StartNode() {
  return (
    <div className="relative group">
      <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-900/40 border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] backdrop-blur-md transition-transform hover:scale-105">
        <PlayIcon />
        <span className="font-bold text-emerald-400 tracking-wide uppercase text-sm">Início</span>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-[#111]" 
      />
    </div>
  );
}
