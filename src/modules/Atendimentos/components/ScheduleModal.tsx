import React from 'react';
import { cn } from '../../../lib/utils';
import { ProductService } from '../../../services/ProductService';
import { TemplateService, MessageTemplate } from '../../../services/TemplateService';
import { CampaignService } from '../../../services/CampaignService';
import { Product } from '../../../types/global';

// Componentes de ícones usando React.createElement
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Calendar = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M8 2v4' }),
    React.createElement('path', { d: 'M16 2v4' }),
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }),
    React.createElement('path', { d: 'M3 10h18' }));

const Clock = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'M12 6v6l4 2' }));

const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));

const Check = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  }, React.createElement('path', { d: 'm9 12 2 2 4-4' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const ImageIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }),
    React.createElement('circle', { cx: '9', cy: '9', r: '2' }),
    React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }));

const Mic = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
    React.createElement('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '19', y2: '22' }));

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

const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M5 12h14' }),
    React.createElement('path', { d: 'm12 5 0 14' }));

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

const Bold = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8' }));

const Italic = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('line', { x1: '19', x2: '10', y1: '4', y2: '4' }),
    React.createElement('line', { x1: '14', x2: '5', y1: '20', y2: '20' }),
    React.createElement('line', { x1: '15', x2: '9', y1: '4', y2: '20' }));

const Strikethrough = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M16 4H9a3 3 0 0 0-2.83 4' }),
    React.createElement('path', { d: 'M14 12a4 4 0 0 1 0 8H6' }),
    React.createElement('line', { x1: '4', x2: '20', y1: '12', y2: '12' }));

const Code = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('polyline', { points: '16,18 22,12 16,6' }),
    React.createElement('polyline', { points: '8,6 2,12 8,18' }));

const Store = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7' }),
    React.createElement('path', { d: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8' }),
    React.createElement('path', { d: 'M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4' }),
    React.createElement('path', { d: 'M2 7h20' }));

const Search = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
    React.createElement('path', { d: 'm21 21-4.35-4.35' }));

const Variable = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }),
    React.createElement('path', { d: 'm16 3 4 9-4 9' }));

const Save = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z' }),
    React.createElement('path', { d: 'M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7' }),
    React.createElement('path', { d: 'M7 3v4a1 1 0 0 0 1 1h8' }));

const Upload = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '17,8 12,3 7,8' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '3', y2: '15' })
  );

const Download = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '7,10 12,15 17,10' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '15', y2: '3' }));

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  allowInteractive?: boolean; // New prop to control access to interactive messages
}

type MessageType = 'text' | 'media' | 'audio' | 'poll' | 'buttons' | 'list' | 'carousel';

// Toolbar de Formatação (Mantido)
const TextToolbar = ({ onInsert }: { onInsert: (char: string, wrap?: boolean) => void }) =>
  React.createElement('div', { className: "flex items-center gap-1 mb-2 bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit" },
    React.createElement('button', {
      type: "button",
      onClick: () => onInsert('*', true),
      className: "p-1.5 hover:bg-gray-200 rounded text-gray-600",
      title: "Negrito"
    }, React.createElement(Bold, { size: 14 })),
    React.createElement('button', {
      type: "button",
      onClick: () => onInsert('_', true),
      className: "p-1.5 hover:bg-gray-200 rounded text-gray-600",
      title: "Itálico"
    }, React.createElement(Italic, { size: 14 })),
    React.createElement('button', {
      type: "button",
      onClick: () => onInsert('~', true),
      className: "p-1.5 hover:bg-gray-200 rounded text-gray-600",
      title: "Taxado"
    }, React.createElement(Strikethrough, { size: 14 })),
    React.createElement('button', {
      type: "button",
      onClick: () => onInsert('```', true),
      className: "p-1.5 hover:bg-gray-200 rounded text-gray-600",
      title: "Monoespaçado"
    }, React.createElement(Code, { size: 14 }))
  );

// Toolbar de Variáveis (Mantido)
const VariablesBar = ({ onInsert }: { onInsert: (v: string) => void }) =>
  React.createElement('div', { className: "flex gap-2 mt-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200" },
    ['nome', 'telefone', 'protocolo', 'saudacao', 'cpf', 'email'].map((v: string) =>
      React.createElement('button', {
        key: v,
        type: "button",
        onClick: () => onInsert(v),
        className: "text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap font-medium flex items-center gap-1"
      },
        React.createElement(Variable, { size: 10 }),
        ` {{${v}}}`
      )
    )
  );

export function ScheduleModal({ isOpen, onClose, onConfirm, allowInteractive = true }: ScheduleModalProps) {
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [messageType, setMessageType] = React.useState<MessageType>('text');

  // Monitorar allowInteractive para evitar estado inconsistente
  React.useEffect(() => {
    if (!allowInteractive && ['buttons', 'list', 'carousel'].includes(messageType)) {
      setMessageType('text');
    }
  }, [allowInteractive, messageType]);

  // --- Estados dos Formulários ---
  const [textMessage, setTextMessage] = React.useState('');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const [mediaCaption, setMediaCaption] = React.useState('');
  const [mediaFiles, setMediaFiles] = React.useState<any[]>([]); // Nova lista de arquivos
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const recordingInterval = React.useRef<number | null>(null);
  const [btnText, setBtnText] = React.useState('');
  const [btnFooter, setBtnFooter] = React.useState('');
  // --- Estados de Polls ---
  const [pollName, setPollName] = React.useState('');
  const [pollOptions, setPollOptions] = React.useState<string[]>(['Opção 1', 'Opção 2']);
  const [pollAllowMultiple, setPollAllowMultiple] = React.useState(false);
  const [buttons, setButtons] = React.useState<{ id: string, text: string, type: string, url?: string, phoneNumber?: string }[]>([
    { id: 'btn_1', text: 'Sim, quero!', type: 'quick_reply' }
  ]);
  const [listText, setListText] = React.useState('');
  const [listFooter, setListFooter] = React.useState('');
  const [listBtnText, setListBtnText] = React.useState('Abrir Menu');
  const [listSections, setListSections] = React.useState<{ title: string, rows: { id: string, title: string, description: string }[] }[]>([
    { title: 'Seção Principal', rows: [{ id: 'row_1', title: 'Opção 1', description: '' }] }
  ]);
  const [carouselCards, setCarouselCards] = React.useState<{
    id: string,
    title: string,
    description: string,
    imageUrl: string,
    price: number,
    button1?: { text: string, type: string },
    button2?: { text: string, type: string }
  }[]>([
    { id: 'card_1', title: '', description: '', imageUrl: '', price: 0 }
  ]);

  // Integração Produtos & Templates
  const [availableProducts, setAvailableProducts] = React.useState<Product[]>([]);
  const [showProductSelector, setShowProductSelector] = React.useState(false);
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);

  // Refs
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const btnTextRef = React.useRef<HTMLTextAreaElement>(null);
  const listTextRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setAvailableProducts(ProductService.getAll());
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const templatesData = await TemplateService.getAll();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates([]);
    }
  };

  // Function to handle card image upload
  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardIdx: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedFiles = await CampaignService.uploadMedia(Array.from(files));

      if (uploadedFiles.length > 0) {
        const newCards = [...carouselCards];
        // Ensure we store the relative URL returned by backend. 
        // The backend/frontend service handles the full URL resolution for display if needed.
        newCards[cardIdx].imageUrl = uploadedFiles[0].url;
        setCarouselCards(newCards);
      }
    } catch (error) {
      console.error('Erro no upload de imagem do card:', error);
      alert('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to resolve display URL (assuming backend is at localhost:3002 or relative)
  const getDisplayUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // If relative, assume it comes from our backend.
    // In dev with proxy, relative works. In electron, we might need base URL.
    // Best guess for now:
    return url;
  };

  // --- Lógica de Templates ---
  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t: MessageTemplate) => t.id === templateId);
    if (!template) return;

    // Se for um template interativo mas a instância não permitir, avisar ou ignorar
    if (!allowInteractive && ['buttons', 'list', 'carousel'].includes(template.type)) {
      alert('Este modelo contém elementos interativos que não são suportados pela instância selecionada.');
      return;
    }

    setMessageType(template.type as MessageType);

    const c = template.content;
    if (template.type === 'text') setTextMessage(c.text);
    if (template.type === 'buttons') {
      setBtnText(c.text);
      setBtnFooter(c.footer);
      setButtons(c.buttons);
    }
    if (template.type === 'list') {
      setListText(c.text);
      setListBtnText(c.buttonText);
      setListFooter(c.footer);
      setListSections(c.sections);
    }
    if (template.type === 'carousel') {
      setCarouselCards(c.cards);
    }
    if (c.mediaFiles) {
      setMediaFiles(c.mediaFiles);
    }
  };

  const handleSaveAsTemplate = async () => {
    const name = prompt('Nome do novo modelo:');
    if (!name) return;

    try {
      const payload = buildPayload();
      await TemplateService.create({
        name,
        type: messageType,
        content: payload.content
      });
      alert('Modelo salvo com sucesso!');
      await loadTemplates(); // Refresh
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar modelo');
    }
  };

  const buildPayload = () => {
    const payload: any = {
      date,
      time,
      type: messageType,
      content: {}
    };

    switch (messageType) {
      case 'text':
        payload.content = { text: textMessage };
        break;
      case 'media':
        payload.content = {
          url: mediaUrl,
          caption: mediaCaption,
          mediaFiles: mediaFiles // Incluir lista de arquivos
        };
        break;
      case 'audio':
        payload.content = {
          caption: mediaCaption,
          audioBlob: audioBlob,
          duration: recordingTime
        };
        break;
      case 'poll':
        payload.content = {
          name: pollName,
          options: pollOptions,
          selectableOptionsCount: pollAllowMultiple ? 0 : 1
        };
        break;
      case 'buttons':
        payload.content = {
          text: btnText,
          footer: btnFooter,
          buttons: buttons.map((b: any) => ({
            id: b.id,
            text: b.text,
            type: b.type,
            url: b.url,
            phoneNumber: b.phoneNumber
          }))
        };
        break;
      case 'list':
        payload.content = {
          text: listText,
          buttonText: listBtnText,
          footer: listFooter,
          sections: listSections
        };
        break;
      case 'carousel':
        payload.content = {
          cards: carouselCards.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            imageUrl: c.imageUrl,
            price: c.price,
            buttons: [
              c.button1 ? { id: `${c.id}_b1`, text: c.button1.text, type: 'reply' } : null,
              c.button2 ? { id: `${c.id}_b2`, text: c.button2.text, type: 'reply' } : null
            ].filter(Boolean)
          }))
        };
        break;
    }
    return payload;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedFiles = await CampaignService.uploadMedia(Array.from(files));
      setMediaFiles((prev: any[]) => [...prev, ...uploadedFiles]);

      // Se for a primeira mídia, define como a principal (para compatibilidade)
      if (mediaFiles.length === 0 && uploadedFiles.length > 0) {
        setMediaUrl(uploadedFiles[0].url);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Falha ao enviar arquivo(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (idx: number) => {
    const newFiles = [...mediaFiles];
    newFiles.splice(idx, 1);
    setMediaFiles(newFiles);
    if (newFiles.length > 0) {
      setMediaUrl(newFiles[0].url);
    } else {
      setMediaUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(buildPayload());

    // LIMPAR MÍDIAS E FORMULÁRIO APÓS ENVIO
    setMediaFiles([]);
    setMediaUrl('');
    setMediaCaption('');
    setTextMessage('');
    setBtnText('');
    setBtnFooter('');
    setButtons([{ id: 'btn_1', text: 'Sim, quero!', type: 'quick_reply' }]);
    setListText('');
    setListFooter('');
    setListBtnText('Abrir Menu');
    setListSections([{ title: 'Seção Principal', rows: [{ id: 'row_1', title: 'Opção 1', description: '' }] }]);
    setCarouselCards([{ id: 'card_1', title: '', description: '', imageUrl: '', price: 0 }]);
    setPollName('');
    setPollOptions(['Opção 1', 'Opção 2']);
    setPollAllowMultiple(false);
    setIsRecording(false);
    setAudioBlob(null);
    setRecordingTime(0);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Função genérica para inserir texto/variáveis (Mantida)
  const handleInsertFormat = (char: string, wrap: boolean = false, value: string, setValue: (v: string) => void, ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement>) => {
    const input = ref.current;
    if (!input) {
      setValue(value + char);
      return;
    }
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const selectedText = value.substring(start, end);
    let newText = wrap ? value.substring(0, start) + char + selectedText + char + value.substring(end) : value.substring(0, start) + char + value.substring(end);
    setValue(newText);
    setTimeout(() => { input.focus(); input.setSelectionRange(wrap ? end + (char.length * 2) : start + char.length, wrap ? end + (char.length * 2) : start + char.length); }, 0);
  };

  const handleInsertVariable = (variable: string, value: string, setValue: (v: string) => void, ref?: React.RefObject<any>) => {
    const varText = ` {{${variable}}} `;
    handleInsertFormat(varText, false, value, setValue, ref as any);
  };

  // Funções de gravação de áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar contador de tempo
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1);
      }, 1000) as any;

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setAudioBlob(null);
      setRecordingTime(0);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup do recording interval
  React.useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  // --- Renderizadores (Mantidos e simplificados para brevidade, usando os mesmos do código original) ---
  const renderButtonsForm = () => (
    <div className="space-y-4 animate-in fade-in">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Texto da Mensagem</label>
        <TextToolbar onInsert={(c, w) => handleInsertFormat(c, w, btnText, setBtnText, btnTextRef)} />
        <textarea ref={btnTextRef} rows={3} className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" value={btnText} onChange={e => setBtnText(e.target.value)} placeholder="Digite a mensagem principal..." />
        <VariablesBar onInsert={(v) => handleInsertVariable(v, btnText, setBtnText, btnTextRef)} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Rodapé (Opcional)</label>
        <input type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" value={btnFooter} onChange={e => setBtnFooter(e.target.value)} placeholder="Ex: Selecione uma opção" />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Botões (Máx 3)</label>
          {buttons.length < 3 && (
            <button type="button" onClick={() => setButtons([...buttons, { id: `btn_${Date.now()}`, text: '', type: 'quick_reply' }])} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"><Plus size={14} /> Adicionar</button>
          )}
        </div>
        <div className="space-y-3">
          {buttons.map((btn: any, idx: number) => (
            <div key={btn.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`Texto do Botão ${idx + 1}`}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 bg-white"
                  value={btn.text}
                  onChange={e => {
                    const newBtns = [...buttons];
                    newBtns[idx].text = e.target.value;
                    setButtons(newBtns);
                  }}
                />
                {buttons.length > 1 && (
                  <button type="button" onClick={() => setButtons(buttons.filter((b: any) => b.id !== btn.id))} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18} /></button>
                )}
              </div>

              <div className="mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Tipo de Botão</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 bg-white"
                  value={btn.type}
                  onChange={e => {
                    const newBtns = [...buttons];
                    newBtns[idx].type = e.target.value;
                    setButtons(newBtns);
                  }}
                >
                  <option value="quick_reply">💬 Resposta Rápida</option>
                  <option value="cta_url">🔗 Link (URL)</option>
                  <option value="cta_call">📞 Chamada</option>
                </select>
              </div>

              {btn.type === 'cta_url' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">URL do Link</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 bg-white"
                    value={btn.url || ''}
                    onChange={e => {
                      const newBtns = [...buttons];
                      newBtns[idx].url = e.target.value;
                      setButtons(newBtns);
                    }}
                  />
                </div>
              )}

              {btn.type === 'cta_call' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Número de Telefone</label>
                  <input
                    type="tel"
                    placeholder="+5511999999999"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 bg-white"
                    value={btn.phoneNumber || ''}
                    onChange={e => {
                      const newBtns = [...buttons];
                      newBtns[idx].phoneNumber = e.target.value;
                      setButtons(newBtns);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListForm = () => (
    <div className="space-y-4 animate-in fade-in max-h-[400px] overflow-y-auto pr-2">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Texto Principal</label>
        <TextToolbar onInsert={(c, w) => handleInsertFormat(c, w, listText, setListText, listTextRef)} />
        <textarea ref={listTextRef} rows={3} className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" value={listText} onChange={e => setListText(e.target.value)} placeholder="Digite o texto que aparece antes da lista..." />
        <VariablesBar onInsert={(v) => handleInsertVariable(v, listText, setListText, listTextRef)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Texto do Botão</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" value={listBtnText} onChange={e => setListBtnText(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Rodapé (Opcional)</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500" value={listFooter} onChange={e => setListFooter(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        {listSections.map((section: any, sIdx: number) => (
          <div key={sIdx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <input
                type="text"
                className="bg-transparent font-bold text-sm text-gray-700 outline-none placeholder-gray-400 w-full"
                placeholder="Título da Seção"
                value={section.title}
                onChange={e => {
                  const newSections = [...listSections];
                  newSections[sIdx].title = e.target.value;
                  setListSections(newSections);
                }}
              />
              {listSections.length > 1 && (
                <button type="button" onClick={() => setListSections(listSections.filter((_: any, i: number) => i !== sIdx))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              )}
            </div>

            <div className="space-y-2 pl-2 border-l-2 border-gray-200">
              {section.rows.map((row: any, rIdx: number) => (
                <div key={row.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input type="text" placeholder="Nome da Opção" className="w-full p-1.5 border border-gray-200 rounded text-sm bg-white outline-none focus:border-emerald-500" value={row.title} onChange={e => { const newSections = [...listSections]; newSections[sIdx].rows[rIdx].title = e.target.value; setListSections(newSections); }} />
                    <input type="text" placeholder="Descrição (opcional)" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white outline-none focus:border-emerald-500 text-gray-500" value={row.description} onChange={e => { const newSections = [...listSections]; newSections[sIdx].rows[rIdx].description = e.target.value; setListSections(newSections); }} />
                  </div>
                  <button type="button" onClick={() => { const newSections = [...listSections]; newSections[sIdx].rows = newSections[sIdx].rows.filter((_: any, i: number) => i !== rIdx); setListSections(newSections); }} className="text-red-300 hover:text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => { const newSections = [...listSections]; newSections[sIdx].rows.push({ id: `row_${Date.now()}`, title: '', description: '' }); setListSections(newSections); }} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 mt-2">+ Adicionar Opção</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setListSections([...listSections, { title: '', rows: [] }])} className="w-full py-2 border border-dashed border-gray-300 text-gray-500 text-xs rounded hover:bg-gray-50 hover:text-emerald-600">+ Nova Seção</button>
      </div>
    </div>
  );

  const renderCarouselForm = () => (
    <div className="space-y-4 animate-in fade-in max-h-[400px] overflow-y-auto pr-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-gray-500 uppercase">Cards do Carrossel</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowProductSelector(!showProductSelector)} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold flex items-center gap-1"><Store size={14} /> Importar Produto</button>
          <button type="button" onClick={() => setCarouselCards([...carouselCards, { id: `card_${Date.now()}`, title: '', description: '', imageUrl: '', price: 0 }])} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-100 font-bold flex items-center gap-1"><Plus size={14} /> Adicionar Card</button>
        </div>
      </div>

      {showProductSelector && (
        <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg mb-4">
          <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md mb-2">
            <Search size={14} className="text-gray-400" />
            <input type="text" placeholder="Buscar produto..." className="bg-transparent text-xs outline-none w-full" />
          </div>
          <div className="max-h-[150px] overflow-y-auto space-y-1">
            {availableProducts.map((prod: Product) => (
              <div key={prod.id} onClick={() => {
                setCarouselCards([...carouselCards, {
                  id: `card_${Date.now()}`,
                  title: prod.name,
                  description: prod.description.substring(0, 50),
                  imageUrl: prod.images[0] || '',
                  price: prod.price,
                  button1: { text: 'Ver Detalhes', type: 'reply' },
                  button2: { text: 'Comprar', type: 'reply' }
                }]);
                setShowProductSelector(false);
              }} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  {prod.images[0] ? <img src={prod.images[0]} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{prod.name}</p>
                  <p className="text-[10px] text-gray-500">R$ {prod.price.toFixed(2)}</p>
                </div>
                <Plus size={14} className="text-emerald-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {carouselCards.map((card: any, idx: number) => (
          <div key={card.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative group">
            <div className="absolute top-2 right-2 flex gap-2">
              {carouselCards.length > 1 && (
                <button type="button" onClick={() => setCarouselCards(carouselCards.filter((c: any) => c.id !== card.id))} className="text-red-300 hover:text-red-500"><Trash2 size={16} /></button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Título</label>
                  <input type="text" className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-emerald-500 font-bold" value={card.title} onChange={e => { const newCards = [...carouselCards]; newCards[idx].title = e.target.value; setCarouselCards(newCards); }} placeholder="Nome do Produto" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Preço (R$)</label>
                  <input type="number" className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-emerald-500" value={card.price} onChange={e => { const newCards = [...carouselCards]; newCards[idx].price = parseFloat(e.target.value); setCarouselCards(newCards); }} placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtítulo (Descrição)</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded text-sm outline-none focus:border-emerald-500" value={card.description} onChange={e => { const newCards = [...carouselCards]; newCards[idx].description = e.target.value; setCarouselCards(newCards); }} placeholder="Descrição curta" />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold text-blue-500 uppercase mb-1">Botão 1</label>
                  <input type="text" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white outline-none focus:border-blue-500" value={card.button1?.text || ''} onChange={e => { const newCards = [...carouselCards]; newCards[idx].button1 = { text: e.target.value, type: 'reply' }; setCarouselCards(newCards); }} placeholder="Ex: Ver Detalhes" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-500 uppercase mb-1">Botão 2</label>
                  <input type="text" className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white outline-none focus:border-blue-500" value={card.button2?.text || ''} onChange={e => { const newCards = [...carouselCards]; newCards[idx].button2 = { text: e.target.value, type: 'reply' }; setCarouselCards(newCards); }} placeholder="Ex: Comprar" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Imagem do Produto</label>
                <div className="flex gap-2 items-center">
                  {/* Image Input/Preview Area */}
                  <div className="flex-1 flex gap-2">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition shadow-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleCardImageUpload(e, idx)}
                      />
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload size={16} className="text-emerald-600" />
                      )}
                      <span className="text-xs font-bold text-gray-600">Carregar Imagem</span>
                    </label>
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-200 rounded text-xs outline-none focus:border-emerald-500 text-gray-500"
                      value={card.imageUrl}
                      onChange={e => { const newCards = [...carouselCards]; newCards[idx].imageUrl = e.target.value; setCarouselCards(newCards); }}
                      placeholder="Ou cole a URL..."
                    />
                  </div>

                  <div className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                    {card.imageUrl ? <img src={getDisplayUrl(card.imageUrl)} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-400" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-bold leading-tight">Configurar Mensagem</h2>
              <p className="text-xs text-emerald-100 opacity-80">Agendamento ou Envio Imediato</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto">

            {/* Template Selector */}
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Download size={16} />
                <select
                  className="bg-transparent outline-none font-medium cursor-pointer"
                  onChange={(e) => handleLoadTemplate(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Carregar Modelo...</option>
                  {templates.map((t: MessageTemplate) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleSaveAsTemplate} className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1">
                <Save size={14} /> Salvar como Modelo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                <input type="date" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Horário</label>
                <input type="time" className="w-full p-2 border border-gray-300 rounded-lg text-sm" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Mensagem</label>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                {[
                  { id: 'text', icon: MessageSquare, label: 'Texto' },
                  { id: 'media', icon: ImageIcon, label: 'Mídia' },
                  { id: 'audio', icon: Mic, label: 'Áudio' },
                  { id: 'poll', icon: CheckCircle, label: 'Enquete' },
                  ...(allowInteractive ? [
                    { id: 'buttons', icon: MousePointer2, label: 'Botões' },
                    { id: 'list', icon: List, label: 'Lista' },
                    { id: 'carousel', icon: GalleryHorizontal, label: 'Carrossel' },
                  ] : [])
                ].map(tab => (
                  <button key={tab.id} type="button" onClick={() => setMessageType(tab.id as MessageType)} className={cn("flex-1 min-w-[70px] py-2 px-2 rounded-md text-xs font-medium flex flex-col items-center gap-1 transition-all", messageType === tab.id ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:bg-gray-200")}>
                    <tab.icon size={18} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[250px]">
              {messageType === 'text' && (
                <div className="space-y-2 animate-in fade-in">
                  <TextToolbar onInsert={(c, w) => handleInsertFormat(c, w, textMessage, setTextMessage, textRef)} />
                  <textarea ref={textRef} rows={5} className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 text-sm" placeholder="Digite sua mensagem..." value={textMessage} onChange={e => setTextMessage(e.target.value)} />
                  <VariablesBar onInsert={(v) => handleInsertVariable(v, textMessage, setTextMessage, textRef)} />
                </div>
              )}
              {messageType === 'media' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-gray-50 group">
                    <input
                      type="file"
                      id="campaign-media"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      accept="image/*,video/*,audio/*,application/pdf"
                    />
                    <label htmlFor="campaign-media" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        {isUploading ? (
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Plus size={24} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700">Anexar Mídias do Computador</p>
                        <p className="text-xs text-gray-500">Imagens, Vídeos ou Documentos (Múltiplos)</p>
                      </div>
                    </label>
                  </div>

                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {mediaFiles.map((file: any, idx: number) => (
                        <div key={idx} className="relative aspect-video bg-white rounded border border-gray-200 overflow-hidden group">
                          {file.type === 'image' ? (
                            <img src={file.url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-[10px] p-1 text-center">
                              <ImageIcon size={16} className="text-gray-400" />
                              <span className="truncate w-full">{file.name}</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Legenda da Mensagem</label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
                      rows={3}
                      placeholder="Digite a legenda que acompanhará a mídia..."
                      value={mediaCaption}
                      onChange={e => setMediaCaption(e.target.value)}
                    />
                    <VariablesBar onInsert={(v) => handleInsertVariable(v, mediaCaption, setMediaCaption)} />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Ou use uma URL externa</label>
                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg text-xs" placeholder="https://exemplo.com/imagem.jpg" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} />
                  </div>
                </div>
              )}
              {messageType === 'audio' && (
                <div className="space-y-4 animate-in fade-in text-center py-4">
                  {!isRecording && !audioBlob && (
                    <>
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Mic size={28} className="text-white" />
                      </button>
                      <p className="text-sm font-bold text-gray-700">Gravar Áudio</p>
                    </>
                  )}

                  {isRecording && (
                    <>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-red-500 animate-pulse">
                        <Mic size={28} className="text-white" />
                      </div>
                      <p className="text-sm font-bold text-red-600">Gravando... {formatTime(recordingTime)}</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={cancelRecording}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          Parar
                        </button>
                      </div>
                    </>
                  )}

                  {audioBlob && !isRecording && (
                    <>
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-green-500">
                        <CheckCircle size={28} className="text-white" />
                      </div>
                      <p className="text-sm font-bold text-green-600">Áudio gravado ({formatTime(recordingTime)})</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAudioBlob(null);
                            setRecordingTime(0);
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Gravar Novamente
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {messageType === 'poll' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pergunta da Enquete</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
                      placeholder="Ex: Qual sua cor favorita?"
                      value={pollName}
                      onChange={e => setPollName(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase">Opções</label>
                      <button
                        type="button"
                        onClick={() => setPollOptions([...pollOptions, `Opção ${pollOptions.length + 1}`])}
                        className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {pollOptions.map((opt: string, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            value={opt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const newOpts = [...pollOptions];
                              newOpts[idx] = e.target.value;
                              setPollOptions(newOpts);
                            }}
                          />
                          {pollOptions.length > 2 && (
                            <button
                              type="button"
                              onClick={() => setPollOptions(pollOptions.filter((_: string, i: number) => i !== idx))}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="poll-multiple"
                      checked={pollAllowMultiple}
                      onChange={e => setPollAllowMultiple(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="poll-multiple" className="text-sm text-gray-600 cursor-pointer">Permitir múltiplas escolhas</label>
                  </div>
                </div>
              )}
              {messageType === 'buttons' && renderButtonsForm()}
              {messageType === 'list' && renderListForm()}
              {messageType === 'carousel' && renderCarouselForm()}
            </div>

          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm"><Check size={18} /> Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
