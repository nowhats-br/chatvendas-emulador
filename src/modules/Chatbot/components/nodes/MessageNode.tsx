import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '../../../../lib/utils';

// Custom icon components
const MessageSquareIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));
const MoreHorizontalIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('circle', { cx: '12', cy: '12', r: '1' }), React.createElement('circle', { cx: '19', cy: '12', r: '1' }), React.createElement('circle', { cx: '5', cy: '12', r: '1' }));
const ImageIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }), React.createElement('circle', { cx: '9', cy: '9', r: '2' }), React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }));
const VideoIcon = () => React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'm22 8-6 4 6 4V8Z' }), React.createElement('rect', { width: '14', height: '12', x: '2', y: '6', rx: '2', ry: '2' }));

export const MessageNode = React.memo(({ data, selected }: NodeProps) => {
  const label = (data.label as string) || 'Enviar Mensagem';
  const content = (data.content as string) || 'Olá! Como posso ajudar?';
  const mediaType = (data.mediaType as string) || 'text';

  return (
    <div className={cn(
      "w-[280px] rounded-xl border-2 bg-[#1c1c1c] transition-all duration-200 shadow-xl",
      selected ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-[#333] hover:border-[#444]"
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#333] flex items-center justify-between bg-[#252525] rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500">
            <MessageSquareIcon />
          </div>
          <span className="font-semibold text-gray-200 text-sm">{label}</span>
        </div>
        <button className="text-gray-500 hover:text-white">
          <MoreHorizontalIcon />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="bg-[#2a2a2a] rounded-lg p-3 text-sm text-gray-300 relative group">
          {mediaType === 'image' && (
            <div className="mb-2 h-24 bg-[#333] rounded flex items-center justify-center text-gray-500">
                <ImageIcon />
            </div>
          )}
          {mediaType === 'video' && (
            <div className="mb-2 h-24 bg-[#333] rounded flex items-center justify-center text-gray-500">
                <VideoIcon />
            </div>
          )}
          <p className="line-clamp-3 leading-relaxed">{String(content)}</p>
        </div>
        
        {/* Quick Replies Preview */}
        {data.quickReplies && (data.quickReplies as string[]).length > 0 ? (
            <div className="flex gap-2 mt-3 overflow-hidden">
                {(data.quickReplies as string[]).map((qr: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[#333] border border-[#444] rounded-full text-xs text-emerald-400 whitespace-nowrap">
                        {String(qr)}
                    </span>
                ))}
            </div>
        ) : null}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Left} className="!bg-[#555] !w-3 !h-3 !border-2 !border-[#1c1c1c] hover:!bg-emerald-500 transition-colors" />
      <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-[#1c1c1c]" />
    </div>
  );
});
