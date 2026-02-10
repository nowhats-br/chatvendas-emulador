import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { ChatMessage, attendanceService } from '../../../services/AttendanceService';

// Componentes de ícones usando React.createElement
const Check = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('path', { d: 'm9 12 2 2 4-4' }));

const CheckCheck = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M9 11l3 3l8-8' }),
    React.createElement('path', { d: 'm21 21-6.5-6.5' }));

const MapPin = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    React.createElement('circle', { cx: '12', cy: '10', r: '3' }));

const Play = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('polygon', { points: '5,3 19,12 5,21' }));

const ImageIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }),
    React.createElement('circle', { cx: '9', cy: '9', r: '2' }),
    React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }));

const MoreVertical = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '1' }),
    React.createElement('circle', { cx: '12', cy: '5', r: '1' }),
    React.createElement('circle', { cx: '12', cy: '19', r: '1' }));

const Trash2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 6h18' }),
    React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
    React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' }),
    React.createElement('line', { x1: '10', x2: '10', y1: '11', y2: '17' }),
    React.createElement('line', { x1: '14', x2: '14', y1: '11', y2: '17' }));

const Edit2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' }));

const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));


interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMe = message.from_me;
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja apagar esta mensagem?')) {
      try {
        await attendanceService.deleteMessage(message.id);
        setShowMenu(false);
      } catch (error) {
        alert('Erro ao apagar mensagem');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    try {
      await attendanceService.editMessage(message.id, editContent);
      setIsEditing(false);
    } catch (error) {
      alert('Erro ao editar mensagem');
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  // Base styles for the bubble
  const bubbleClass = cn(
    "relative p-2 sm:p-3 rounded-xl shadow-sm text-sm w-fit max-w-[85%] md:max-w-[70%] break-words backdrop-blur-[2px]",
    isMe
      ? "bg-[#d9fdd3]/90 ml-auto rounded-tr-none text-gray-900" // WhatsApp-like green transparent
      : "bg-white/90 mr-auto rounded-tl-none text-gray-900"     // White transparent
  );

  const renderStatus = () => {
    if (!isMe) return <span className="text-[10px] text-gray-400 ml-1">{formatTime(message.timestamp)}</span>;

    return (
      <div className="flex items-center gap-0.5 ml-1.5 translate-y-[2px]">
        <span className="text-[10px] text-gray-500">{formatTime(message.timestamp)}</span>
        {message.status === 'sent' && <Check size={14} className="text-gray-400" />}
        {message.status === 'delivered' && <CheckCheck size={14} className="text-gray-400" />}
        {message.status === 'read' && <CheckCheck size={14} className="text-blue-500" />}
      </div>
    );
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    // Prepender a URL do backend para caminhos relativos
    const backendUrl = 'http://127.0.0.1:3002';
    return `${backendUrl}${url}`;
  };

  const renderContent = () => {
    if (isEditing && message.type === 'text') {
      return (
        <div className="min-w-[200px]">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={Math.max(2, editContent.split('\n').length)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:bg-red-50 rounded"><X size={16} /></button>
            <button onClick={handleSaveEdit} className="p-1 text-green-500 hover:bg-green-50 rounded"><Check size={16} /></button>
          </div>
        </div>
      );
    }

    switch (message.type) {
      case 'text':
        return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;

      case 'image':
        return (
          <div className="space-y-1">
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
              <img
                src={resolveMediaUrl(message.media_url)}
                alt="Mídia"
                className="w-full h-auto max-h-[300px] object-cover hover:opacity-95 transition-opacity cursor-pointer"
                onClick={() => window.open(resolveMediaUrl(message.media_url), '_blank')}
              />
            </div>
            {message.content && <p className="mt-1">{message.content}</p>}
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <audio controls className="h-8 max-w-[240px]">
              <source src={resolveMediaUrl(message.media_url)} type={message.media_mimetype || 'audio/ogg'} />
            </audio>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-1">
            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 relative">
              <video controls className="w-full h-auto max-h-[300px]">
                <source src={resolveMediaUrl(message.media_url)} type={message.media_mimetype} />
                Seu navegador não suporta vídeo.
              </video>
            </div>
            {message.content && <p className="mt-1">{message.content}</p>}
          </div>
        );

      case 'document':
        const getFileInfo = (filename?: string) => {
          if (!filename) return { color: 'bg-blue-100 text-blue-600', label: 'DOC' };
          const ext = filename.split('.').pop()?.toLowerCase();
          switch (ext) {
            case 'pdf': return { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'PDF' };
            case 'xls':
            case 'xlsx':
            case 'csv': return { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', label: 'XLS' };
            case 'doc':
            case 'docx': return { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'DOC' };
            case 'ppt':
            case 'pptx': return { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', label: 'PPT' };
            case 'zip':
            case 'rar': return { color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'ZIP' };
            case 'txt': return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: 'TXT' };
            default: return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: (ext?.toUpperCase().slice(0, 3) || 'DOC') };
          }
        };

        const fileInfo = getFileInfo(message.media_filename);

        return (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", fileInfo.color)}>
              <span className="text-xs font-bold">{fileInfo.label}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{message.media_filename || 'Documento'}</p>
              <p className="text-xs text-gray-500">
                {message.media_size ? `${(message.media_size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'}
              </p>
            </div>
            <a
              href={resolveMediaUrl(message.media_url)}
              download={message.media_filename || true}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              onClick={(e) => {
                if (!message.media_filename?.endsWith('.bin')) {
                  // e.preventDefault();
                }
              }}
            >
              Abrir
            </a>
          </div>
        );

      case 'carousel':
        try {
          const cards = JSON.parse(message.content);
          return (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-1 px-1 max-w-[500px]">
              {cards.map((card: any, idx: number) => (
                <div key={idx} className="min-w-[200px] max-w-[200px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col">
                  {card.imageUrl && (
                    <img
                      src={resolveMediaUrl(card.imageUrl)}
                      className="w-full h-24 object-cover"
                      alt=""
                    />
                  )}
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">{card.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 flex-1">{card.description}</p>
                    {card.price && (
                      <p className="text-sm font-bold text-emerald-600 mt-2">
                        R$ {card.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        } catch {
          return <p className="text-sm italic text-gray-500">Mídia de Carrossel</p>;
        }

      case 'buttons':
      case 'list':
        try {
          const interactiveContent = JSON.parse(message.content);
          return (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap leading-relaxed">{interactiveContent.text}</p>
              {interactiveContent.footer && (
                <p className="text-xs text-gray-500">{interactiveContent.footer}</p>
              )}
              <div className="text-xs text-blue-600 font-medium">
                {message.type === 'buttons' ? '📱 Mensagem com botões' : '📋 Mensagem com lista'}
              </div>
            </div>
          );
        } catch {
          return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
        }

      case 'location':
        let locData: any = null;
        let mapLink = '';

        try {
          locData = JSON.parse(message.content);
          mapLink = `https://www.google.com/maps?q=${locData.latitude},${locData.longitude}`;
        } catch {
          // Fallback: Check if media_url or content is a link
          if (message.media_url?.includes('maps')) {
            mapLink = message.media_url;
            locData = { name: 'Localização' };
          } else if (message.content?.includes('maps')) {
            mapLink = message.content;
            locData = { name: 'Localização' };
          }
        }

        if (mapLink) {
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <MapPin size={24} className="text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{locData?.name || 'Localização'}</p>
                  {locData?.address && <p className="text-xs text-gray-500 truncate">{locData.address}</p>}
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    Ver no Google Maps
                  </a>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <MapPin size={16} className="text-red-500" />
            <span className="text-sm font-medium">Localização compartilhada</span>
          </div>
        );

      case 'sticker':
        return (
          <div className="rounded-lg overflow-hidden max-w-[150px]">
            <img
              src={resolveMediaUrl(message.media_url)}
              alt="Sticker"
              className="w-full h-auto object-contain bg-transparent"
              onError={(e) => {
                // Fallback silencioso ou placeholder
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );

      default:
        return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div
      className={cn("flex flex-col mb-2 group", isMe ? "items-end" : "items-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Nome do contato (se não for minha mensagem) */}
      {!isMe && message.contact_name && (
        <span className="text-[10px] text-gray-600 font-medium mb-0.5 ml-2">
          {message.contact_name}
        </span>
      )}

      <div className={bubbleClass}>
        {/* Dropdown menu trigger - Só mostra para minhas mensagens */}
        {isMe && !isEditing && (
          <div className="absolute top-1 right-1 z-10 transition-opacity opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:bg-gray-100/50 rounded-full p-1 transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 top-6 bg-white dark:bg-[#252525] shadow-lg rounded-lg border border-gray-100 dark:border-[#333] z-50 w-32 py-1 animate-in fade-in zoom-in-95 duration-100"
              >
                {message.type === 'text' && (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#333] flex items-center gap-2"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            )}
          </div>
        )}

        {renderContent()}

        {/* Metadata (Time & Status) */}
        {!isEditing && (
          <div className="flex justify-end mt-1 select-none">
            {renderStatus()}
          </div>
        )}
      </div>
    </div>
  );
}
