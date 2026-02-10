import React from 'react';
import { cn } from '../../../lib/utils';
import { Ticket } from '../types';
import { ChatMessage } from '../../../services/AttendanceService';
import { MessageBubble } from './MessageBubble';

// Componentes de ícones usando React.createElement
const ShoppingCart = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '8', cy: '21', r: '1' }),
    React.createElement('circle', { cx: '19', cy: '21', r: '1' }),
    React.createElement('path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'M12 6v6l4 2' }));

const Smile = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'M8 14s1.5 2 4 2 4-2 4-2' }),
    React.createElement('line', { x1: '9', x2: '9.01', y1: '9', y2: '9' }),
    React.createElement('line', { x1: '15', x2: '15.01', y1: '9', y2: '9' }));

const Paperclip = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48' }));

const Mic = ({ size = 16, className = "", fill }: { size?: number; className?: string; fill?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: fill || 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
    React.createElement('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '19', y2: '22' }));

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
    React.createElement('path', { d: 'M22 2 11 13' }));

const PanelRight = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }),
    React.createElement('path', { d: 'M15 3v18' }));

const RefreshCw = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
    React.createElement('path', { d: 'M21 3v5h-5' }),
    React.createElement('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
    React.createElement('path', { d: 'M8 16H3v5' }));

const Zap = ({ size = 16, className = "", fill }: { size?: number; className?: string; fill?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: fill || 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' }));

const MapPin = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
    React.createElement('circle', { cx: '12', cy: '10', r: '3' }));

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

const Inbox = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
    React.createElement('path', { d: 'M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }));

const PlayCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('polygon', { points: '10,8 16,12 10,16 10,8' }));

interface ChatWindowProps {
  ticket: Ticket | null;
  messages: ChatMessage[];
  messagesLoading: boolean;
  onToggleRightPanel: () => void;
  onToggleCart: () => void;
  isRightPanelOpen: boolean;
  onResolveTicket: () => void;
  onReopenTicket: () => void;
  onReturnToPending: () => void;
  onOpenTicket: () => void;
  onOpenSchedule: () => void;
  onOpenQuickReplies: () => void;
  // Props de estado elevadas
  message: string;
  setMessage: (msg: string) => void;
  onSendMessage: (content: string, type?: any, media?: File) => void;
}

const EMOJIS = [
  // Carinhas & Pessoas
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😮',
  '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢',
  '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤',
  '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
  '👺', '👻', '👽', '👾', '🤖', '👋', '🤚', '🖐️', '✋', '🖖',
  '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
  '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏',
  '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
  // Corações & Emoções
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
  '💢', '💣', '💤', '💥', '💦', '💨', '💫', '💬', '🗯️', '💭',
  // Objetos & Negócios
  '💰', '💵', '💳', '💎', '📈', '📉', '📊', '📋', '📁', '📁',
  '📦', '🏷️', '📦', '🚚', '🚚', '📦', '🛒', '🛍️', '🛍️', '🎁',
  '🎯', '📢', '🔔', '🔕', '📍', '📌', '📞', '📱', '✉️', '📧',
  // Símbolos
  '✅', '❌', '⚠️', '🚫', '⭐', '✨', '🔥', '🚀', '⚡', '💡',
  '🔍', '🆗', '🆕', '🆓', '🆙', '🆓', '🆒', '🆘', '📍', '🚩'
];

export function ChatWindow({
  ticket,
  messages,
  messagesLoading,
  onToggleRightPanel,
  onToggleCart,
  isRightPanelOpen,
  onResolveTicket,
  onReopenTicket,
  onReturnToPending,
  onOpenTicket,
  onOpenSchedule,
  onOpenQuickReplies,
  message,
  setMessage,
  onSendMessage
}: ChatWindowProps) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recordingInterval = React.useRef<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  // Scroll automático para a última mensagem
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
  }, [messages]);

  React.useEffect(() => {
    scrollToBottom('auto');
  }, [ticket]);

  React.useEffect(() => {
    if (!messagesLoading) {
      scrollToBottom('auto');
    }
  }, [messagesLoading]);

  React.useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1);
      }, 1000) as any;
    } else {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setMessage(message + (message ? ' ' : '') + text);
    }
  };

  // --- Novas Funcionalidades ---

  // 1. Anexar Arquivos
  const handleFileClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('📁 ChatWindow: Arquivo selecionado');
    console.log('   - Nome original:', file.name);
    console.log('   - Tipo:', file.type);
    console.log('   - Tamanho:', file.size);

    const isAudio = file.type.startsWith('audio/') ||
      /\.(mp3|ogg|wav|m4a|webm|opus)$/i.test(file.name);

    if (isAudio) {
      // Aplicando a mesma lógica de nomenclatura do áudio gravado
      const extension = file.name.split('.').pop() || 'mp3';
      const audioFile = new File([file], `voice-message.${extension}`, { type: file.type });

      console.log('🎵 ChatWindow: Processando como áudio');
      console.log('   - Nome renomeado:', audioFile.name);
      console.log('   - Tipo:', audioFile.type);
      console.log('   - Tamanho:', audioFile.size);

      onSendMessage('', 'audio', audioFile);
    } else {
      let type: any = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      console.log(`📄 ChatWindow: Processando como ${type}`);
      onSendMessage('', type, file);
    }

    e.target.value = ''; // Limpar input
  };

  // 2. Localização
  const handleSendLocation = () => {
    const savedLat = localStorage.getItem('chatvendas_lat');
    const savedLng = localStorage.getItem('chatvendas_lng');

    if (savedLat && savedLng) {
      // Normalizar entrada (trocar vírgula por ponto)
      const lat = parseFloat(savedLat.replace(',', '.'));
      const lng = parseFloat(savedLng.replace(',', '.'));

      if (isNaN(lat) || isNaN(lng)) {
        alert("As coordenadas configuradas são inválidas. Verifique em Configurações > Geral.");
        return;
      }

      console.log("📍 Usando localização configurada:", lat, lng);

      const content = JSON.stringify({
        latitude: lat,
        longitude: lng,
        name: 'Localização da Empresa'
      });
      onSendMessage(content, 'location');
    } else {
      alert("Localização não configurada. Por favor, vá em Configurações > Geral e defina a Latitude e Longitude da empresa.");
    }
  };

  // 3. Gravar Áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Detectar mimetype suportado
      const types = ['audio/webm; codecs=opus', 'audio/webm', 'audio/ogg; codecs=opus', 'audio/mp4'];
      const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'ogg';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File([audioBlob], `voice-message.${extension}`, { type: mimeType });
        onSendMessage('', 'audio', audioFile);

        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = (cancel = false) => {
    if (mediaRecorderRef.current && isRecording) {
      if (cancel) {
        mediaRecorderRef.current.onstop = null; // Ignorar o evento de stop
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } else {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(message + emoji);
    setShowEmojiPicker(false);
  };

  if (!ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#0a0a0a] border-b-[6px] border-emerald-500 min-w-0 transition-colors duration-300">
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-light text-gray-600 dark:text-gray-300 mb-2">ChatVendas Web</h2>
          <p className="text-sm text-gray-500 dark:text-gray-500">Selecione um ticket para iniciar o atendimento.</p>
        </div>
      </div>
    )
  }

  // Verifica se o chat está bloqueado (Resolvido ou Pendente)
  const isChatLocked = ticket.status === 'resolved' || ticket.status === 'pending';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#111] relative min-w-0 transition-colors duration-300">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-60 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}
      />

      {/* Header */}
      <header className="h-[60px] bg-white dark:bg-[#1c1c1c] px-4 py-2 flex items-center justify-between z-10 border-b border-gray-200 dark:border-[#222] shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] p-1 rounded-lg transition-colors overflow-hidden mr-2">
          <div className="relative shrink-0">
            <img src={ticket.avatar} alt={ticket.name} className="w-10 h-10 rounded-full object-cover" />
            {ticket.onlineStatus === 'online' && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-[#1c1c1c] bg-green-500" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-900 dark:text-gray-100 font-bold text-sm truncate">{ticket.name}</span>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs truncate font-medium">
              {(() => {
                const lastSeen = ticket.lastSeen;
                if (!lastSeen) return 'Visto por último recentemente';

                const date = new Date(lastSeen);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffMins = Math.floor(diffMs / 60000);

                if (diffMins < 5) return 'Online';
                if (diffMins < 60) return `Visto por último há ${diffMins} min`;

                const isToday = date.toDateString() === now.toDateString();
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                if (isToday) return `Visto por último hoje às ${timeStr}`;

                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                if (date.toDateString() === yesterday.toDateString()) {
                  return `Visto por último ontem às ${timeStr}`;
                }

                return `Visto por último em ${date.toLocaleDateString()} às ${timeStr}`;
              })()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onToggleCart} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-all shadow-sm border border-indigo-100 dark:border-indigo-900/30" title="Carrinho">
              <ShoppingCart size={20} />
            </button>

            {ticket.status === 'resolved' ? (
              <button onClick={onReopenTicket} className="p-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 rounded-lg transition-all shadow-sm border border-cyan-100 dark:border-cyan-900/30" title="Reabrir">
                <RefreshCw size={20} />
              </button>
            ) : ticket.status === 'pending' ? (
              <button onClick={() => onOpenTicket()} className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-all shadow-sm border border-emerald-100 dark:border-emerald-900/30" title="Iniciar Atendimento">
                <PlayCircle size={20} />
              </button>
            ) : (
              <>
                <button onClick={onReturnToPending} className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-all shadow-sm border border-amber-100 dark:border-amber-900/30" title="Retornar para Pendente">
                  <Inbox size={20} />
                </button>
                <button onClick={onResolveTicket} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-all shadow-sm border border-green-100 dark:border-green-900/30" title="Resolver">
                  <CheckCircle size={20} />
                </button>
              </>
            )}
            <button onClick={onOpenSchedule} className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-all shadow-sm border border-purple-100 dark:border-purple-900/30" title="Agendar">
              <Clock size={20} />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-1 hidden sm:block" />

          <button
            onClick={onToggleRightPanel}
            className={cn(
              "p-2 rounded-lg transition-all",
              isRightPanelOpen
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            )}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 z-10 flex flex-col gap-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#333] scrollbar-track-transparent">
        <div className="flex justify-center mb-4 mt-1">
          <div className="bg-[#ffeecd] dark:bg-yellow-900/20 text-gray-600 dark:text-yellow-200 text-[11px] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-md border border-[#ffeeba] dark:border-yellow-900/30">
            🔒 As mensagens são protegidas com criptografia de ponta-a-ponta.
          </div>
        </div>

        {messagesLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <span className="ml-2 text-gray-500">Carregando mensagens...</span>
          </div>
        ) : ticket?.status === 'resolved' ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#333] rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Atendimento Finalizado</p>
            <p className="text-sm">Reabra o ticket para visualizar a conversa.</p>
          </div>
        ) : (
          <>
            {messages.map((msg: ChatMessage) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer / Input Area */}
      <footer className="bg-[#f0f2f5] dark:bg-[#1c1c1c] px-4 py-3 z-10 border-t border-gray-200 dark:border-[#222] shrink-0 transition-colors duration-300">
        {isChatLocked ? (
          <div className="flex items-center justify-center py-4 bg-white dark:bg-[#252525] rounded-xl border border-dashed border-gray-300 dark:border-[#444] text-gray-500 dark:text-gray-400 text-sm h-[72px]">
            {ticket.status === 'resolved' ? (
              <button
                onClick={onReopenTicket}
                className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-2.5 rounded-full font-bold shadow hover:bg-emerald-700 transition-all transform hover:scale-105"
              >
                <RefreshCw size={18} /> Reabrir Ticket
              </button>
            ) : (
              <>
                Este ticket está pendente.
                <button onClick={() => onOpenTicket()} className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                  <PlayCircle size={14} /> Abrir Ticket
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-2 max-w-5xl mx-auto">
            {isRecording ? (
              // Interface de Gravação
              <div className="flex-1 flex items-center gap-3 bg-white dark:bg-[#252525] rounded-xl px-4 py-3 shadow-sm animate-in fade-in duration-200">
                <div className="text-red-500 animate-pulse"><Mic size={20} fill="currentColor" /></div>
                <span className="flex-1 font-mono text-gray-700 dark:text-gray-200 font-medium">{formatTime(recordingTime)}</span>
                <button onClick={() => stopRecording(true)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                <button onClick={() => stopRecording(false)} className="text-emerald-500 hover:text-emerald-600 transition-colors"><CheckCircle size={24} /></button>
              </div>
            ) : (
              // Interface de Texto
              <>
                {/* Ícones da Esquerda - Cores Minimalistas e Vibrantes */}
                <div className="flex gap-2 pb-2.5">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      showEmojiPicker ? "bg-amber-200 text-amber-700" : "bg-amber-50 text-amber-500 hover:bg-amber-100"
                    )}
                    title="Emojis"
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    onClick={handleFileClick}
                    className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                    title="Anexar"
                  >
                    <Paperclip size={20} />
                  </button>
                  <button onClick={onOpenQuickReplies} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors" title="Respostas Rápidas">
                    <Zap size={20} className="fill-yellow-600" />
                  </button>
                  <button
                    onClick={handleSendLocation}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    title="Localização"
                  >
                    <MapPin size={20} />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Input Central com Drop Zone */}
                <div
                  className={cn(
                    "flex-1 bg-white dark:bg-[#252525] rounded-xl flex items-center px-4 py-2.5 border shadow-sm min-h-[48px] transition-all",
                    isDragOver
                      ? "border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/20 bg-emerald-50/10"
                      : "border-white dark:border-[#333] focus-within:border-white dark:focus-within:border-[#444]"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="text"
                    placeholder={isDragOver ? "Solte a resposta aqui..." : "Digite '/' para respostas rápidas ou sua mensagem..."}
                    className="flex-1 border-none outline-none text-sm bg-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 min-w-0"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                  />
                </div>

                {/* Botão Enviar/Gravar */}
                <div className="pb-1">
                  {message ? (
                    <button
                      onClick={handleSendMessage}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      <Send size={20} className="ml-0.5" />
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full shadow-md transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      <Mic size={20} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Emoji Picker - Expandindo abaixo do campo de texto */}
        {showEmojiPicker && !isRecording && (
          <div className="max-w-5xl mx-auto px-[38px] mt-3 animate-in slide-in-from-bottom-2 duration-300">
            <div className="h-[132px] bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-2xl shadow-inner p-4 overflow-y-auto">
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-3 items-center justify-items-center">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:scale-125 hover:bg-gray-50 dark:hover:bg-[#333] p-2 rounded-xl transition-all duration-150"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div >
  );
}
