import React from 'react';
import { CampaignService } from '../../../services/CampaignService';
import { ProductCarouselSelector } from '../../Campanhas/components/ProductCarouselSelector';
import { AudioConverter } from '../../../utils/audioConverter';
import { AudioPreview } from '../../../components/ui/AudioPreview';

interface ScheduleModalFixedProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  allowInteractive?: boolean;
  selectedInstances?: string[];
  instances?: any[];
}

type MessageType = 'text' | 'media' | 'audio' | 'buttons' | 'list' | 'carousel' | 'poll';

export function ScheduleModalFixed({
  isOpen,
  onClose,
  onConfirm,
  allowInteractive = true,
  selectedInstances = [],
  instances = []
}: ScheduleModalFixedProps) {
  const [messageType, setMessageType] = React.useState<MessageType>('text');
  const [textMessage, setTextMessage] = React.useState('');
  const [mediaFiles, setMediaFiles] = React.useState<any[]>([]);
  const [mediaCaption, setMediaCaption] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  // Estados para Áudio
  const [audioFiles, setAudioFiles] = React.useState<any[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [recordingInterval, setRecordingInterval] = React.useState<number | null>(null);

  // Estados para Botões (Whaileys)
  const [buttons, setButtons] = React.useState([
    { id: 'btn_1', text: 'Sim, quero!', type: 'quick_reply' }
  ]);
  const [btnText, setBtnText] = React.useState('');
  const [btnFooter, setBtnFooter] = React.useState('');

  // Estados para Lista (Whaileys)
  const [listText, setListText] = React.useState('');
  const [listFooter, setListFooter] = React.useState('');
  const [listBtnText, setListBtnText] = React.useState('Ver opções');
  const [listSections, setListSections] = React.useState([
    {
      title: 'Opções disponíveis',
      rows: [{ id: 'row_1', title: 'Opção 1', description: 'Descrição da opção 1' }]
    }
  ]);

  // Estados para Enquete (Poll)
  const [pollName, setPollName] = React.useState('');
  const [pollOptions, setPollOptions] = React.useState<string[]>(['Opção 1', 'Opção 2']);
  const [pollAllowMultiple, setPollAllowMultiple] = React.useState(false);

  // Estados para Carrossel
  const [carouselMode, setCarouselMode] = React.useState<'manual' | 'products'>('manual');
  const [carouselCards, setCarouselCards] = React.useState([
    {
      id: 'card_1',
      title: 'Produto 1',
      description: 'Descrição do produto',
      imageFile: null as File | null,
      imageUrl: '',
      price: 0,
      button1: { text: 'Ver mais', type: 'reply' },
      button2: { text: 'Comprar', type: 'reply' }
    }
  ]);
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = React.useState(false);

  // Verificar se as instâncias selecionadas são Whaileys
  const isWhaileyInstance = React.useMemo(() => {
    if (!selectedInstances.length || !instances.length) return false;
    return selectedInstances.some(id => {
      const instance = instances.find(i => i.id === id);
      return instance?.provider === 'whaileys';
    });
  }, [selectedInstances, instances]);

  // Tipos de mensagem disponíveis baseados no provider
  const availableTypes = React.useMemo(() => {
    const baseTypes = [
      { id: 'text', label: '📝 Texto', icon: '📝' },
      { id: 'media', label: '🖼️ Mídia', icon: '🖼️' },
      { id: 'audio', label: '🎤 Áudio', icon: '🎤' },
      { id: 'poll', label: '📊 Enquete', icon: '📊' }
    ];

    if (isWhaileyInstance && allowInteractive) {
      baseTypes.push(
        { id: 'buttons', label: '🔘 Botões', icon: '🔘' },
        { id: 'list', label: '📋 Lista', icon: '📋' },
        { id: 'carousel', label: '🎠 Carrossel', icon: '🎠' }
      );
    }

    return baseTypes;
  }, [isWhaileyInstance, allowInteractive]);

  // Reset quando modal abre
  React.useEffect(() => {
    if (isOpen) {
      setMessageType('text');
      setTextMessage('');
      setMediaFiles([]);
      setMediaCaption('');
      setAudioFiles([]);
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      if (mediaRecorder) {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
      setBtnText('');
      setBtnFooter('');
      setButtons([{ id: 'btn_1', text: 'Sim, quero!', type: 'quick_reply' }]);
      setListText('');
      setListFooter('');
      setListBtnText('Ver opções');
      setListSections([{
        title: 'Opções disponíveis',
        rows: [{ id: 'row_1', title: 'Opção 1', description: 'Descrição da opção 1' }]
      }]);
      setPollName('');
      setPollOptions(['Opção 1', 'Opção 2']);
      setPollAllowMultiple(false);
      setCarouselMode('manual');
      setCarouselCards([{
        id: 'card_1',
        title: 'Produto 1',
        description: 'Descrição do produto',
        imageFile: null,
        imageUrl: '',
        price: 0,
        button1: { text: 'Ver mais', type: 'reply' },
        button2: { text: 'Comprar', type: 'reply' }
      }]);
      setSelectedProductIds([]);
      setShowProductSelector(false);
    }
  }, [isOpen, recordingInterval, mediaRecorder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const uploadedFiles = await CampaignService.uploadMedia(Array.from(files));
      setMediaFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo(s)');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (idx: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Funções para áudio
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const audioFilesArray = Array.from(files);
      
      // Validar arquivos de áudio
      const validFiles = audioFilesArray.filter(file => {
        if (!AudioConverter.isAudioFileSupported(file)) {
          alert(`Arquivo não suportado: ${file.name}`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        alert('Nenhum arquivo de áudio válido selecionado');
        return;
      }
      
      // Converter MP3 para OGG se necessário
      const processedFiles = await Promise.all(
        validFiles.map(async (file) => {
          if (file.type === 'audio/mp3' || file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')) {
            console.log(`🔄 Convertendo ${file.name} de MP3 para OGG...`);
            return await AudioConverter.convertMp3ToOgg(file);
          }
          return file;
        })
      );

      const uploadedFiles = await CampaignService.uploadMedia(processedFiles);
      
      // Adicionar informações extras aos arquivos
      const filesWithInfo = await Promise.all(
        uploadedFiles.map(async (uploadedFile, index) => {
          const originalFile = processedFiles[index];
          const audioInfo = await AudioConverter.getAudioInfo(originalFile);
          
          return {
            ...uploadedFile,
            duration: audioInfo.duration,
            formattedSize: AudioConverter.formatFileSize(uploadedFile.size),
            formattedDuration: audioInfo.duration ? AudioConverter.formatDuration(audioInfo.duration) : undefined
          };
        })
      );

      setAudioFiles(prev => [...prev, ...filesWithInfo]);
    } catch (error) {
      console.error('Erro no upload de áudio:', error);
      alert('Erro ao enviar arquivo(s) de áudio');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAudio = (idx: number) => {
    setAudioFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        // Converter para OGG usando o utilitário
        try {
          const oggFile = await AudioConverter.convertWebmToOgg(blob);
          const uploadedFiles = await CampaignService.uploadMedia([oggFile]);
          
          // Adicionar informações extras
          const audioInfo = await AudioConverter.getAudioInfo(oggFile);
          const fileWithInfo = {
            ...uploadedFiles[0],
            duration: audioInfo.duration,
            formattedSize: AudioConverter.formatFileSize(uploadedFiles[0].size),
            formattedDuration: audioInfo.duration ? AudioConverter.formatDuration(audioInfo.duration) : undefined
          };
          
          setAudioFiles(prev => [...prev, fileWithInfo]);
        } catch (error) {
          console.error('Erro ao processar gravação:', error);
          alert('Erro ao processar gravação de áudio');
        }
        
        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar contador de tempo
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);

      recorder.start();
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
    }
  };

  const formatRecordingTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons(prev => [...prev, {
        id: `btn_${Date.now()}`,
        text: '',
        type: 'quick_reply'
      }]);
    }
  };

  const removeButton = (id: string) => {
    setButtons(prev => prev.filter(btn => btn.id !== id));
  };

  const updateButton = (id: string, field: string, value: string) => {
    setButtons(prev => prev.map(btn =>
      btn.id === id ? { ...btn, [field]: value } : btn
    ));
  };

  const addListRow = (sectionIdx: number) => {
    setListSections(prev => prev.map((section, idx) =>
      idx === sectionIdx
        ? {
          ...section,
          rows: [...section.rows, {
            id: `row_${Date.now()}`,
            title: '',
            description: ''
          }]
        }
        : section
    ));
  };

  const removeListRow = (sectionIdx: number, rowIdx: number) => {
    setListSections(prev => prev.map((section, idx) =>
      idx === sectionIdx
        ? { ...section, rows: section.rows.filter((_, rIdx) => rIdx !== rowIdx) }
        : section
    ));
  };

  const updateListRow = (sectionIdx: number, rowIdx: number, field: string, value: string) => {
    setListSections(prev => prev.map((section, idx) =>
      idx === sectionIdx
        ? {
          ...section,
          rows: section.rows.map((row, rIdx) =>
            rIdx === rowIdx ? { ...row, [field]: value } : row
          )
        }
        : section
    ));
  };

  const addCarouselCard = () => {
    setCarouselCards(prev => [...prev, {
      id: `card_${Date.now()}`,
      title: '',
      description: '',
      imageFile: null,
      imageUrl: '',
      price: 0,
      button1: { text: 'Ver mais', type: 'reply' },
      button2: { text: 'Comprar', type: 'reply' }
    }]);
  };

  const removeCarouselCard = (id: string) => {
    setCarouselCards(prev => prev.filter(card => card.id !== id));
  };

  const updateCarouselCard = (id: string, field: string, value: any) => {
    setCarouselCards(prev => prev.map(card =>
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const handleCarouselImageUpload = async (cardId: string, file: File) => {
    try {
      setIsUploading(true);
      const uploadedFiles = await CampaignService.uploadMedia([file]);
      if (uploadedFiles && uploadedFiles.length > 0) {
        updateCarouselCard(cardId, 'imageFile', file);
        updateCarouselCard(cardId, 'imageUrl', uploadedFiles[0].url);
      }
    } catch (error) {
      console.error('Erro no upload da imagem do carrossel:', error);
      alert('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProductsSelected = (products: any[]) => {
    const productCards = products.map(product => ({
      id: `product_${product.id}`,
      title: product.name,
      description: product.description || product.short_description || '',
      imageFile: null,
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : '',
      price: product.price,
      button1: { text: 'Ver mais', type: 'reply' },
      button2: { text: 'Comprar', type: 'reply' },
      productId: product.id
    }));

    setCarouselCards(productCards);
    setSelectedProductIds(products.map(p => p.id));
  };

  const buildPayload = async () => {
    const payload: any = {
      type: messageType,
      content: {}
    };

    switch (messageType) {
      case 'text':
        payload.content = { text: textMessage };
        break;
      case 'media':
        payload.content = {
          mediaFiles: mediaFiles,
          caption: mediaCaption
        };
        break;
      case 'audio':
        payload.content = {
          audioFiles: audioFiles
        };
        break;
      case 'buttons':
        payload.content = {
          text: btnText,
          footer: btnFooter,
          buttons: buttons.map(btn => ({
            id: btn.id,
            text: btn.text,
            type: btn.type,
            url: btn.type === 'cta_url' ? (btn as any).url : undefined,
            phoneNumber: btn.type === 'cta_call' ? (btn as any).phoneNumber : undefined
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
        // Upload de imagens dos cards primeiro
        const cardsWithMedia = await Promise.all(
          carouselCards.map(async (card) => {
            let finalImageUrl = card.imageUrl;

            // Se tem arquivo local, fazer upload
            if (card.imageFile) {
              try {
                const uploadedFiles = await CampaignService.uploadMedia([card.imageFile]);
                if (uploadedFiles && uploadedFiles.length > 0) {
                  finalImageUrl = uploadedFiles[0].url;
                }
              } catch (error) {
                console.error('Erro no upload da imagem do card:', error);
              }
            }

            return {
              id: card.id,
              title: card.title,
              description: card.description,
              imageUrl: finalImageUrl,
              price: card.price,
              buttons: [
                card.button1 ? { id: `${card.id}_b1`, text: card.button1.text, type: 'reply' } : null,
                card.button2 ? { id: `${card.id}_b2`, text: card.button2.text, type: 'reply' } : null
              ].filter(Boolean)
            };
          })
        );

        payload.content = { cards: cardsWithMedia };
        break;
      case 'poll':
        payload.content = {
          name: pollName,
          options: pollOptions,
          selectableOptionsCount: pollAllowMultiple ? 0 : 1
        };
        break;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = await buildPayload();
      onConfirm(payload);
      onClose();
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      alert('Erro ao processar mensagem. Tente novamente.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: 'white',
            padding: '20px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                🚀 Construtor de Mensagem
              </h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
                {isWhaileyInstance ? 'Whaileys' : 'Baileys'} • {availableTypes.length} tipos disponíveis
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

            {/* Content */}
            <div style={{
              padding: '30px',
              flex: 1,
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 200px)'
            }}>

              {/* Message Type Selector */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#374151'
                }}>
                  Tipo de Mensagem
                </label>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  padding: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px'
                }}>
                  {availableTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMessageType(type.id as MessageType)}
                      style={{
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        backgroundColor: messageType === type.id ? '#059669' : 'white',
                        color: messageType === type.id ? 'white' : '#374151',
                        boxShadow: messageType === type.id ? '0 4px 12px rgba(5,150,105,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{type.icon}</span>
                      {type.label.replace(/^.+ /, '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Content */}
              <div style={{
                backgroundColor: '#f9fafb',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                minHeight: '300px'
              }}>

                {/* Text Message */}
                {messageType === 'text' && (
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#374151'
                    }}>
                      Conteúdo da Mensagem
                    </label>
                    <textarea
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '16px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                )}

                {/* Media Message */}
                {messageType === 'media' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Arquivos de Mídia
                      </label>
                      <div style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: 'white'
                      }}>
                        <input
                          type="file"
                          id="media-upload"
                          multiple
                          accept="image/*,video/*,audio/*"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="media-upload"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {isUploading ? '⏳' : '📎'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>
                              {isUploading ? 'Enviando...' : 'Clique para adicionar mídia'}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              Imagens, vídeos ou áudios
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {mediaFiles.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Arquivos selecionados:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {mediaFiles.map((file, idx) => (
                            <div key={idx} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              backgroundColor: 'white',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}>
                              <span>📎 {file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeMedia(idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Legenda (Opcional)
                      </label>
                      <textarea
                        value={mediaCaption}
                        onChange={(e) => setMediaCaption(e.target.value)}
                        placeholder="Digite a legenda que acompanhará a mídia..."
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Audio Message */}
                {messageType === 'audio' && (
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🎤 Gravação de Áudio
                      </h3>

                      <div style={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '24px',
                        textAlign: 'center'
                      }}>
                        {!isRecording ? (
                          <div>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#ef4444',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                              margin: '0 auto 16px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                            }}
                              onClick={startRecording}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.backgroundColor = '#dc2626';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.backgroundColor = '#ef4444';
                              }}
                            >
                              🎤
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                              Clique para gravar áudio
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                              Pressione o botão vermelho para iniciar a gravação
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#ef4444',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                              margin: '0 auto 16px',
                              animation: 'pulse 1.5s infinite',
                              cursor: 'pointer'
                            }}
                              onClick={stopRecording}
                            >
                              ⏹️
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#ef4444' }}>
                              Gravando... {formatRecordingTime(recordingTime)}
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                              Clique no botão para parar a gravação
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <h3 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        📁 Upload de Arquivo de Áudio
                      </h3>

                      <div style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: 'white'
                      }}>
                        <input
                          type="file"
                          id="audio-upload"
                          multiple
                          accept="audio/*,.mp3,.ogg,.wav,.m4a"
                          onChange={handleAudioUpload}
                          style={{ display: 'none' }}
                        />
                        <label
                          htmlFor="audio-upload"
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                          }}>
                            {isUploading ? '⏳' : '🎵'}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>
                              {isUploading ? 'Enviando...' : 'Clique para adicionar arquivos de áudio'}
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                              Formatos: MP3, OGG, WAV, M4A (MP3 será convertido para OGG)
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {audioFiles.length > 0 && (
                      <div>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151',
                          marginBottom: '12px'
                        }}>
                          Arquivos de áudio selecionados:
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {audioFiles.map((file, idx) => (
                            <AudioPreview
                              key={idx}
                              file={file}
                              onRemove={() => removeAudio(idx)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons Message (Whaileys only) */}
                {messageType === 'buttons' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Texto Principal
                      </label>
                      <textarea
                        value={btnText}
                        onChange={(e) => setBtnText(e.target.value)}
                        placeholder="Digite o texto que aparece antes dos botões..."
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Rodapé (Opcional)
                      </label>
                      <input
                        type="text"
                        value={btnFooter}
                        onChange={(e) => setBtnFooter(e.target.value)}
                        placeholder="Ex: Selecione uma opção"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151'
                        }}>
                          Botões (Máximo 3)
                        </label>
                        {buttons.length < 3 && (
                          <button
                            type="button"
                            onClick={addButton}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            + Adicionar
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {buttons.map((btn, idx) => (
                          <div key={btn.id} style={{
                            padding: '16px',
                            backgroundColor: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                placeholder={`Texto do Botão ${idx + 1}`}
                                value={btn.text}
                                onChange={(e) => updateButton(btn.id, 'text', e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '14px'
                                }}
                              />
                              {buttons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeButton(btn.id)}
                                  style={{
                                    padding: '8px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>

                            <select
                              value={btn.type}
                              onChange={(e) => updateButton(btn.id, 'type', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            >
                              <option value="quick_reply">💬 Resposta Rápida</option>
                              <option value="cta_url">🔗 Link (URL)</option>
                              <option value="cta_call">📞 Chamada</option>
                            </select>

                            {btn.type === 'cta_url' && (
                              <input
                                type="url"
                                placeholder="https://exemplo.com"
                                value={(btn as any).url || ''}
                                onChange={(e) => updateButton(btn.id, 'url', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  marginTop: '8px'
                                }}
                              />
                            )}

                            {btn.type === 'cta_call' && (
                              <input
                                type="tel"
                                placeholder="+5511999999999"
                                value={(btn as any).phoneNumber || ''}
                                onChange={(e) => updateButton(btn.id, 'phoneNumber', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  marginTop: '8px'
                                }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* List Message (Whaileys only) */}
                {messageType === 'list' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Texto Principal
                      </label>
                      <textarea
                        value={listText}
                        onChange={(e) => setListText(e.target.value)}
                        placeholder="Digite o texto que aparece antes da lista..."
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151'
                        }}>
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          value={listBtnText}
                          onChange={(e) => setListBtnText(e.target.value)}
                          placeholder="Ex: Ver opções"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151'
                        }}>
                          Rodapé (Opcional)
                        </label>
                        <input
                          type="text"
                          value={listFooter}
                          onChange={(e) => setListFooter(e.target.value)}
                          placeholder="Ex: Escolha uma opção"
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Seções da Lista
                      </label>

                      {listSections.map((section, sIdx) => (
                        <div key={sIdx} style={{
                          marginBottom: '16px',
                          padding: '16px',
                          backgroundColor: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px'
                        }}>
                          <input
                            type="text"
                            placeholder="Título da Seção"
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...listSections];
                              newSections[sIdx].title = e.target.value;
                              setListSections(newSections);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              marginBottom: '12px'
                            }}
                          />

                          {section.rows.map((row, rIdx) => (
                            <div key={row.id} style={{
                              display: 'flex',
                              gap: '8px',
                              marginBottom: '8px',
                              alignItems: 'flex-start'
                            }}>
                              <div style={{ flex: 1 }}>
                                <input
                                  type="text"
                                  placeholder="Título da opção"
                                  value={row.title}
                                  onChange={(e) => updateListRow(sIdx, rIdx, 'title', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    marginBottom: '4px'
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Descrição (opcional)"
                                  value={row.description}
                                  onChange={(e) => updateListRow(sIdx, rIdx, 'description', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeListRow(sIdx, rIdx)}
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addListRow(sIdx)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            + Adicionar Opção
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Poll Message */}
                {messageType === 'poll' && (
                  <div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Pergunta da Enquete
                      </label>
                      <input
                        type="text"
                        value={pollName}
                        onChange={(e) => setPollName(e.target.value)}
                        placeholder="Ex: Qual sua cor favorita?"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <label style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#374151'
                        }}>
                          Opções
                        </label>
                        <button
                          type="button"
                          onClick={() => setPollOptions([...pollOptions, `Opção ${pollOptions.length + 1}`])}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          + Adicionar Opção
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {pollOptions.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...pollOptions];
                                newOpts[idx] = e.target.value;
                                setPollOptions(newOpts);
                              }}
                              placeholder={`Opção ${idx + 1}`}
                              style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                            {pollOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="poll-multiple-fixed"
                        checked={pollAllowMultiple}
                        onChange={(e) => setPollAllowMultiple(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="poll-multiple-fixed" style={{ fontSize: '14px', color: '#4b5563', cursor: 'pointer' }}>
                        Permitir múltiplas escolhas
                      </label>
                    </div>
                  </div>
                )}

                {/* Carousel Message */}
                {messageType === 'carousel' && (
                  <div>
                    {/* Modo de Carrossel */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '12px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#374151'
                      }}>
                        Modo do Carrossel
                      </label>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        padding: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '8px'
                      }}>
                        <button
                          type="button"
                          onClick={() => setCarouselMode('manual')}
                          style={{
                            padding: '10px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: carouselMode === 'manual' ? '#3b82f6' : 'white',
                            color: carouselMode === 'manual' ? 'white' : '#374151',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✏️ Manual
                        </button>
                        <button
                          type="button"
                          onClick={() => setCarouselMode('products')}
                          style={{
                            padding: '10px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: carouselMode === 'products' ? '#3b82f6' : 'white',
                            color: carouselMode === 'products' ? 'white' : '#374151',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          🛍️ Produtos Cadastrados
                        </button>
                      </div>
                    </div>

                    {/* Modo Produtos */}
                    {carouselMode === 'products' && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{
                          border: '2px dashed #d1d5db',
                          borderRadius: '8px',
                          padding: '40px',
                          textAlign: 'center',
                          backgroundColor: 'white'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            margin: '0 auto 16px'
                          }}>
                            🛍️
                          </div>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                            {selectedProductIds.length > 0
                              ? `${selectedProductIds.length} produtos selecionados`
                              : 'Selecione produtos do catálogo'
                            }
                          </h3>
                          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                            Os produtos serão automaticamente formatados para o carrossel
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowProductSelector(true)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            {selectedProductIds.length > 0 ? 'Alterar Seleção' : 'Escolher Produtos'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Modo Manual */}
                    {carouselMode === 'manual' && (
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px'
                        }}>
                          <label style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151'
                          }}>
                            Cards do Carrossel
                          </label>
                          <button
                            type="button"
                            onClick={addCarouselCard}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            + Adicionar Card
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {carouselCards.map((card, idx) => (
                            <div key={card.id} style={{
                              padding: '20px',
                              backgroundColor: 'white',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              position: 'relative'
                            }}>
                              {carouselCards.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCarouselCard(card.id)}
                                  style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    padding: '4px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                  }}
                                >
                                  🗑️
                                </button>
                              )}

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <input
                                  type="text"
                                  placeholder="Título do produto"
                                  value={card.title}
                                  onChange={(e) => updateCarouselCard(card.id, 'title', e.target.value)}
                                  style={{
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                />
                                <input
                                  type="number"
                                  placeholder="Preço (R$)"
                                  value={card.price}
                                  onChange={(e) => updateCarouselCard(card.id, 'price', parseFloat(e.target.value) || 0)}
                                  style={{
                                    padding: '8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}
                                />
                              </div>

                              <input
                                type="text"
                                placeholder="Descrição do produto"
                                value={card.description}
                                onChange={(e) => updateCarouselCard(card.id, 'description', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  marginBottom: '12px'
                                }}
                              />

                              {/* Upload de Imagem */}
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{
                                  display: 'block',
                                  marginBottom: '8px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: '#374151'
                                }}>
                                  Imagem do Produto
                                </label>
                                <div style={{
                                  border: '2px dashed #d1d5db',
                                  borderRadius: '6px',
                                  padding: '16px',
                                  textAlign: 'center',
                                  backgroundColor: '#f9fafb'
                                }}>
                                  <input
                                    type="file"
                                    id={`image-${card.id}`}
                                    accept="image/*,video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        handleCarouselImageUpload(card.id, file);
                                      }
                                    }}
                                    style={{ display: 'none' }}
                                  />
                                  <label
                                    htmlFor={`image-${card.id}`}
                                    style={{
                                      cursor: 'pointer',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}
                                  >
                                    {card.imageFile || card.imageUrl ? (
                                      <div style={{ position: 'relative' }}>
                                        {card.imageFile && (
                                          <img
                                            src={URL.createObjectURL(card.imageFile)}
                                            alt="Preview"
                                            style={{
                                              width: '80px',
                                              height: '80px',
                                              objectFit: 'cover',
                                              borderRadius: '4px'
                                            }}
                                          />
                                        )}
                                        <div style={{
                                          marginTop: '4px',
                                          fontSize: '10px',
                                          color: '#059669',
                                          fontWeight: 'bold'
                                        }}>
                                          ✓ {card.imageFile ? card.imageFile.name : 'Imagem carregada'}
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div style={{
                                          width: '32px',
                                          height: '32px',
                                          backgroundColor: '#e5e7eb',
                                          borderRadius: '50%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '16px'
                                        }}>
                                          {isUploading ? '⏳' : '🖼️'}
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                          {isUploading ? 'Enviando...' : 'Clique para adicionar imagem'}
                                        </span>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Texto Botão 1"
                                  value={card.button1?.text || ''}
                                  onChange={(e) => updateCarouselCard(card.id, 'button1', { text: e.target.value, type: 'reply' })}
                                  style={{
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                  }}
                                />
                                <input
                                  type="text"
                                  placeholder="Texto Botão 2"
                                  value={card.button2?.text || ''}
                                  onChange={(e) => updateCarouselCard(card.id, 'button2', { text: e.target.value, type: 'reply' })}
                                  style={{
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '20px 30px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ✓ Confirmar Mensagem
              </button>
            </div>
          </form>
        </div>

        {/* Modal de Seleção de Produtos */}
        <ProductCarouselSelector
          isOpen={showProductSelector}
          onClose={() => setShowProductSelector(false)}
          onSelect={handleProductsSelected}
          selectedProducts={selectedProductIds}
        />
      </div>
    </>
  );
}