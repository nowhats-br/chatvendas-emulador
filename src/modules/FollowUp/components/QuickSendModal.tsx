import React from 'react';
import { cn } from '../../../lib/utils';
import { TemplateService, MessageTemplate } from '../../../services/TemplateService';
import { useToast } from '../../../hooks/useToast';
import { FollowUpService } from '../services/FollowUpService';

// Componentes de ícones usando React.createElement
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M18 6 6 18' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));

const MousePointer2 = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm4 4 7.07 17 2.51-7.39L21 11.07z' }));

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

const Send = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 2-7 20-4-9-9-4Z' }),
    React.createElement('path', { d: 'M22 2 11 13' }));

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

const Variable = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M8 21s-4-3-4-9 4-9 4-9' }),
    React.createElement('path', { d: 'm16 3 4 9-4 9' }));

const Download = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '7,10 12,15 17,10' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '15', y2: '3' }));

const Image = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' }),
    React.createElement('circle', { cx: '9', cy: '9', r: '2' }),
    React.createElement('path', { d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' }));

const Video = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'm22 8-6 4 6 4V8Z' }),
    React.createElement('rect', { width: '14', height: '12', x: '2', y: '6', rx: '2', ry: '2' }));

const Mic = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' }),
    React.createElement('path', { d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '19', y2: '22' }));

const GalleryHorizontal = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M2 7v10' }),
    React.createElement('path', { d: 'M6 5v14' }),
    React.createElement('rect', { width: '12', height: '18', x: '10', y: '3', rx: '2' }));

interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
  contactPhone: string;
  suggestedMessage?: string;
  taskId?: string;
}

type MessageType = 'text' | 'buttons' | 'list' | 'image' | 'video' | 'audio' | 'carousel';

// Toolbar de Variáveis
const VariablesBar = ({ onInsert }: { onInsert: (v: string) => void }) =>
  React.createElement('div', { className: "flex gap-2 mt-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-200" },
    ['nome', 'telefone', 'protocolo', 'saudacao'].map((v: string) =>
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

export function QuickSendModal({ isOpen, onClose, contactId, contactName, contactPhone, suggestedMessage, taskId }: QuickSendModalProps) {
  const [messageType, setMessageType] = React.useState<MessageType>('text');
  const [isLoading, setIsLoading] = React.useState(false);
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);

  // FIX: Using correct hooks from useToast context
  const { success, error: toastError, info } = useToast();

  // Helper para exibir toast, compatível com a API anterior apenas para facilitar o refactor
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') success('Sucesso', message);
    else if (type === 'error') toastError('Erro', message);
    else info('Informação', message);
  };

  // Estados dos formulários
  const [textMessage, setTextMessage] = React.useState(suggestedMessage || '');
  const [btnText, setBtnText] = React.useState('');
  const [btnFooter, setBtnFooter] = React.useState('');
  const [buttons, setButtons] = React.useState<{ id: string, text: string, type: string }[]>([
    { id: 'btn_1', text: 'Sim, quero!', type: 'quick_reply' }
  ]);
  const [listText, setListText] = React.useState('');
  const [listFooter, setListFooter] = React.useState('');
  const [listBtnText, setListBtnText] = React.useState('Abrir Menu');
  const [listSections, setListSections] = React.useState<{ title: string, rows: { id: string, title: string, description: string }[] }[]>([
    { title: 'Seção Principal', rows: [{ id: 'row_1', title: 'Opção 1', description: '' }] }
  ]);
  const [carouselCards, setCarouselCards] = React.useState<{ title: string, body: string, footer?: string, buttons: { text: string }[] }[]>([
    { title: 'Card 1', body: 'Descrição do primeiro card', buttons: [{ text: 'Ver mais' }] }
  ]);

  // Estados para mídia
  const [mediaFile, setMediaFile] = React.useState<File | null>(null);
  const [mediaCaption, setMediaCaption] = React.useState('');
  const [mediaPreview, setMediaPreview] = React.useState<string | null>(null);

  // Refs
  const textRef = React.useRef<HTMLTextAreaElement>(null);
  const btnTextRef = React.useRef<HTMLTextAreaElement>(null);
  const listTextRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      loadTemplates();
      if (suggestedMessage && messageType === 'text') {
        const firstName = contactName.split(' ')[0];
        const personalizedMessage = suggestedMessage.replace(/\{\{nome\}\}/g, firstName);
        setTextMessage(personalizedMessage);
      }
    }
  }, [isOpen, suggestedMessage, contactName]);

  const loadTemplates = async () => {
    try {
      const templatesData = await TemplateService.getAll();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates([]);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = templates.find((t: MessageTemplate) => t.id === templateId);
    if (!template) return;

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
  };

  const handleInsertVariable = (variable: string, value: string, setValue: (v: string) => void, ref?: React.RefObject<any>) => {
    const varText = ` {{${variable}}} `;
    const input = ref?.current;
    if (!input) {
      setValue(value + varText);
      return;
    }
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newText = value.substring(0, start) + varText + value.substring(end);
    setValue(newText);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + varText.length, start + varText.length);
    }, 0);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm']
    };

    let fileType: 'image' | 'video' | 'audio' | null = null;
    for (const [type, mimes] of Object.entries(validTypes)) {
      if (mimes.includes(file.type)) {
        fileType = type as 'image' | 'video' | 'audio';
        break;
      }
    }

    if (!fileType) {
      showToast('Tipo de arquivo não suportado', 'error');
      return;
    }

    // Validar tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Arquivo muito grande. Máximo 10MB', 'error');
      return;
    }

    setMediaFile(file);
    setMessageType(fileType);

    // Criar preview para imagem/vídeo
    if (fileType === 'image' || fileType === 'video') {
      const reader = new FileReader();
      reader.onload = (e) => setMediaPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const buildPayload = () => {
    const firstName = contactName.split(' ')[0];

    const replaceVariables = (text: string) => {
      if (!text) return '';
      return text
        .replace(/\{\{nome\}\}/g, firstName)
        .replace(/\{\{telefone\}\}/g, contactPhone)
        .replace(/\{\{protocolo\}\}/g, `FU-${Date.now()}`)
        .replace(/\{\{saudacao\}\}/g, getGreeting());
    };

    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Bom dia';
      if (hour < 18) return 'Boa tarde';
      return 'Boa noite';
    };

    const payload: any = {
      type: messageType,
      content: {}
    };

    switch (messageType) {
      case 'text':
        payload.content = { text: replaceVariables(textMessage) };
        break;
      case 'buttons':
        payload.content = {
          text: replaceVariables(btnText),
          footer: replaceVariables(btnFooter),
          buttons: buttons.map((b: any) => ({
            id: b.id,
            text: b.text,
            type: b.type
          }))
        };
        break;
      case 'list':
        payload.content = {
          text: replaceVariables(listText),
          buttonText: listBtnText,
          footer: replaceVariables(listFooter),
          sections: listSections
        };
        break;
      case 'image':
      case 'video':
      case 'audio':
        payload.content = {
          caption: replaceVariables(mediaCaption)
        };
        break;
      case 'carousel':
        payload.content = carouselCards.map(card => ({
          header: {
            imageMessage: {
              // Placeholder, real implementation needs media id or url
              // For quick send, assuming text only for now or static url
            },
            title: replaceVariables(card.title),
            subtitle: replaceVariables(card.body),
            hasMediaAttachment: false
          },
          body: { text: replaceVariables(card.body) },
          footer: { text: replaceVariables(card.footer || '') },
          buttons: card.buttons.map((btn, i) => ({
            buttonId: `id${i}`,
            buttonText: { displayText: btn.text },
            type: 1
          }))
        }));
        break;
    }
    return payload;
  };

  const handleSend = async () => {
    try {
      setIsLoading(true);

      if (['image', 'video', 'audio'].includes(messageType) && !mediaFile) {
        showToast('Selecione um arquivo de mídia', 'error');
        return;
      }

      const payload = buildPayload();

      // Construir FormData se for mídia, caso contrário JSON
      let body;
      const headers: Record<string, string> = {};

      if (['image', 'video', 'audio'].includes(messageType) && mediaFile) {
        const formData = new FormData();
        formData.append('phoneNumber', contactPhone);
        formData.append('messageType', messageType);
        formData.append('content', JSON.stringify(payload.content)); // Metadados como caption
        formData.append('media', mediaFile);
        body = formData;
        // Não setar Content-Type para FormData, o browser faz isso com boundary
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          phoneNumber: contactPhone,
          messageType: messageType,
          content: payload.content
        });
      }

      // Usar a rota send-quick existente (agora atualizada para suportar FormData)
      const response = await fetch('http://localhost:3002/api/messages/send-quick', {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (response.ok) {
        const result = await response.json();
        showToast('Mensagem enviada com sucesso!', 'success');

        // Se tem taskId, marcar como enviado no serviço
        if (taskId) {
          FollowUpService.completeTask(taskId);
        }

        onClose();
      } else {
        const errorText = await response.text();
        let errorMessage = 'Erro ao enviar mensagem';
        try {
          const jsonError = JSON.parse(errorText);
          errorMessage = jsonError.error || errorMessage;
        } catch (e) { }

        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderButtonsForm = () => (
    <div className="space-y-4 animate-in fade-in">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Texto da Mensagem</label>
        <textarea
          ref={btnTextRef}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
          value={btnText}
          onChange={e => setBtnText(e.target.value)}
          placeholder="Digite a mensagem principal..."
        />
        <VariablesBar onInsert={(v) => handleInsertVariable(v, btnText, setBtnText, btnTextRef)} />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Rodapé (Opcional)</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
          value={btnFooter}
          onChange={e => setBtnFooter(e.target.value)}
          placeholder="Ex: Selecione uma opção"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Botões (Máx 3)</label>
          {buttons.length < 3 && (
            <button
              type="button"
              onClick={() => setButtons([...buttons, { id: `btn_${Date.now()}`, text: '', type: 'quick_reply' }])}
              className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Adicionar
            </button>
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
                  <button
                    type="button"
                    onClick={() => setButtons(buttons.filter((b: any) => b.id !== btn.id))}
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderListForm = () => (
    <div className="space-y-4 animate-in fade-in max-h-[300px] overflow-y-auto pr-2">
      <div>
        <label className="text-xs font-bold text-gray-500 uppercase">Texto Principal</label>
        <textarea
          ref={listTextRef}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
          value={listText}
          onChange={e => setListText(e.target.value)}
          placeholder="Digite o texto que aparece antes da lista..."
        />
        <VariablesBar onInsert={(v) => handleInsertVariable(v, listText, setListText, listTextRef)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Texto do Botão</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
            value={listBtnText}
            onChange={e => setListBtnText(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Rodapé (Opcional)</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
            value={listFooter}
            onChange={e => setListFooter(e.target.value)}
          />
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
                <button
                  type="button"
                  onClick={() => setListSections(listSections.filter((_: any, i: number) => i !== sIdx))}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="space-y-2 pl-2 border-l-2 border-gray-200">
              {section.rows.map((row: any, rIdx: number) => (
                <div key={row.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Nome da Opção"
                      className="w-full p-1.5 border border-gray-200 rounded text-sm bg-white outline-none focus:border-emerald-500"
                      value={row.title}
                      onChange={e => {
                        const newSections = [...listSections];
                        newSections[sIdx].rows[rIdx].title = e.target.value;
                        setListSections(newSections);
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white outline-none focus:border-emerald-500 text-gray-500"
                      value={row.description}
                      onChange={e => {
                        const newSections = [...listSections];
                        newSections[sIdx].rows[rIdx].description = e.target.value;
                        setListSections(newSections);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = [...listSections];
                      newSections[sIdx].rows = newSections[sIdx].rows.filter((_: any, i: number) => i !== rIdx);
                      setListSections(newSections);
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newSections = [...listSections];
                  newSections[sIdx].rows.push({ id: `row_${Date.now()}`, title: '', description: '' });
                  setListSections(newSections);
                }}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 mt-2"
              >
                + Adicionar Opção
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setListSections([...listSections, { title: '', rows: [] }])}
          className="w-full py-2 border border-dashed border-gray-300 text-gray-500 text-xs rounded hover:bg-gray-50 hover:text-emerald-600"
        >
          + Nova Seção
        </button>
      </div>
    </div>
  );

  const renderCarouselForm = () => (
    <div className="space-y-4 animate-in fade-in max-h-[300px] overflow-y-auto pr-2">
      {carouselCards.map((card, idx) => (
        <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-xs text-gray-500">CARD {idx + 1}</h4>
            {carouselCards.length > 1 && (
              <button onClick={() => setCarouselCards(carouselCards.filter((_, i) => i !== idx))} className="text-red-400">
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            <input
              className="w-full p-2 border rounded text-sm"
              placeholder="Título do Card"
              value={card.title}
              onChange={e => {
                const newCards = [...carouselCards];
                newCards[idx].title = e.target.value;
                setCarouselCards(newCards);
              }}
            />
            <textarea
              className="w-full p-2 border rounded text-sm"
              placeholder="Corpo do texto"
              rows={2}
              value={card.body}
              onChange={e => {
                const newCards = [...carouselCards];
                newCards[idx].body = e.target.value;
                setCarouselCards(newCards);
              }}
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="bg-white border rounded px-2 py-1 text-xs"
                onClick={() => {
                  const newCards = [...carouselCards];
                  newCards[idx].buttons.push({ text: 'Botão' });
                  setCarouselCards(newCards);
                }}
              >
                + Botão
              </button>
              {card.buttons.map((btn, bIdx) => (
                <input
                  key={bIdx}
                  className="w-24 p-1 border rounded text-xs"
                  value={btn.text}
                  onChange={e => {
                    const newCards = [...carouselCards];
                    newCards[idx].buttons[bIdx].text = e.target.value;
                    setCarouselCards(newCards);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="w-full py-2 border-dashed border-2 rounded text-gray-500 text-sm"
        onClick={() => setCarouselCards([...carouselCards, { title: 'Novo Card', body: '', buttons: [] }])}
      >
        + Adicionar Card
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-bold leading-tight">Envio Rápido</h2>
              <p className="text-xs text-emerald-100 opacity-80">Para: {contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">

            {/* Template Selector */}
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <Download size={16} className="text-gray-500" />
              <select
                className="bg-transparent outline-none font-medium cursor-pointer text-sm flex-1"
                onChange={(e) => handleLoadTemplate(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Carregar Modelo...</option>
                {templates.map((t: MessageTemplate) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Message Type Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo de Mensagem</label>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto">
                {[
                  { id: 'text', icon: MessageSquare, label: 'Texto' },
                  { id: 'buttons', icon: MousePointer2, label: 'Botões' },
                  { id: 'list', icon: List, label: 'Lista' },
                  { id: 'carousel', icon: GalleryHorizontal, label: 'Carrossel' },
                  { id: 'image', icon: Image, label: 'Imagem' },
                  { id: 'video', icon: Video, label: 'Vídeo' },
                  { id: 'audio', icon: Mic, label: 'Áudio' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMessageType(tab.id as MessageType)}
                    className={cn(
                      "flex-1 py-2 px-2 rounded-md text-xs font-medium flex flex-col items-center gap-1 transition-all min-w-[60px]",
                      messageType === tab.id ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    <tab.icon size={16} /> {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload for Media */}
            {['image', 'video', 'audio'].includes(messageType) && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Selecionar {messageType === 'image' ? 'Imagem' : messageType === 'video' ? 'Vídeo' : 'Áudio'}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={
                    messageType === 'image' ? 'image/*' :
                      messageType === 'video' ? 'video/*' : 'audio/*'
                  }
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex flex-col items-center gap-2"
                >
                  {mediaFile ? (
                    <>
                      <div className="text-emerald-600">
                        {messageType === 'image' && <Image size={24} />}
                        {messageType === 'video' && <Video size={24} />}
                        {messageType === 'audio' && <Mic size={24} />}
                      </div>
                      <span className="text-sm font-medium text-emerald-700">{mediaFile.name}</span>
                      <span className="text-xs text-gray-500">{(mediaFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </>
                  ) : (
                    <>
                      <Plus size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Clique para selecionar {messageType === 'image' ? 'imagem' : messageType === 'video' ? 'vídeo' : 'áudio'}
                      </span>
                    </>
                  )}
                </button>

                {/* Preview */}
                {mediaPreview && (messageType === 'image' || messageType === 'video') && (
                  <div className="mt-3">
                    {messageType === 'image' ? (
                      <img src={mediaPreview} alt="Preview" className="max-w-full h-32 object-cover rounded-lg" />
                    ) : (
                      <video src={mediaPreview} className="max-w-full h-32 rounded-lg" controls />
                    )}
                  </div>
                )}

                {/* Caption for media */}
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Legenda (Opcional)</label>
                  <textarea
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500"
                    placeholder="Digite uma legenda para o arquivo..."
                    value={mediaCaption}
                    onChange={e => setMediaCaption(e.target.value)}
                  />
                  <VariablesBar onInsert={(v) => setMediaCaption(prev => prev + ` {{${v}}} `)} />
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[200px]">
              {messageType === 'text' && (
                <div className="space-y-2 animate-in fade-in">
                  <textarea
                    ref={textRef}
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-emerald-500 text-sm"
                    placeholder="Digite sua mensagem..."
                    value={textMessage}
                    onChange={e => setTextMessage(e.target.value)}
                  />
                  <VariablesBar onInsert={(v) => handleInsertVariable(v, textMessage, setTextMessage, textRef)} />
                </div>
              )}
              {messageType === 'buttons' && renderButtonsForm()}
              {messageType === 'list' && renderListForm()}
              {messageType === 'carousel' && renderCarouselForm()}
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}