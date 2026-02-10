import React from 'react';
import { ContactService, Contact } from '../../../services/ContactService';
import { FollowUpService } from '../services/FollowUpService';
import { Priority } from '../types';
import { Avatar } from '../../../components/Avatar';

// Ícones customizados para evitar problemas de importação
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M18 6 6 18' }),
  React.createElement('path', { d: 'M6 6l12 12' }));

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
  React.createElement('polyline', { points: '12,6 12,12 16,14' }));

const User = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
  React.createElement('circle', { cx: '12', cy: '7', r: '4' }));

const AlertCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
  React.createElement('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
  React.createElement('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' }));

const MessageSquare = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));

const Plus = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M5 12h14' }),
  React.createElement('path', { d: 'M12 5v14' }));

const Trash2 = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M3 6h18' }),
  React.createElement('path', { d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' }),
  React.createElement('path', { d: 'M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2' }));

const Layers = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('polygon', { points: '12,2 2,7 12,12 22,7 12,2' }),
  React.createElement('polyline', { points: '2,17 12,22 22,17' }),
  React.createElement('polyline', { points: '2,12 12,17 22,12' }));

interface ScheduleMessage {
  id: string;
  message: string;
  delayDays: number;
  delayHours: number;
  delayMinutes: number;
}

interface NewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewScheduleModal({ isOpen, onClose, onSuccess }: NewScheduleModalProps) {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Novo estado para tipo de agendamento
  const [scheduleType, setScheduleType] = React.useState<'single' | 'sequence'>('single');
  
  // Estados para envio único
  const [singleDate, setSingleDate] = React.useState('');
  const [singleTime, setSingleTime] = React.useState('');
  const [singleMessage, setSingleMessage] = React.useState('');
  
  // Estados para sequência
  const [messages, setMessages] = React.useState<ScheduleMessage[]>([
    { id: '1', message: '', delayDays: 0, delayHours: 0, delayMinutes: 30 }
  ]);

  React.useEffect(() => {
    if (isOpen) {
      loadContacts();
      // Definir data padrão para amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSingleDate(tomorrow.toISOString().split('T')[0]);
      setSingleTime('09:00');
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      const contactList = await ContactService.getAll();
      console.log('✅ Successfully loaded', contactList.length, 'contacts from backend');
      setContacts(contactList);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setError('Erro ao carregar contatos');
    }
  };

  const filteredContacts = React.useMemo(() => {
    if (!searchTerm) return contacts.slice(0, 10);
    return contacts
      .filter(contact => 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phoneNumber.includes(searchTerm)
      )
      .slice(0, 10);
  }, [contacts, searchTerm]);

  const addMessage = () => {
    const newMessage: ScheduleMessage = {
      id: Date.now().toString(),
      message: '',
      delayDays: 1,
      delayHours: 0,
      delayMinutes: 0
    };
    setMessages([...messages, newMessage]);
  };

  const removeMessage = (id: string) => {
    if (messages.length > 1) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const updateMessage = (id: string, field: keyof ScheduleMessage, value: string | number) => {
    setMessages(messages.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) return;

    setIsLoading(true);
    setError('');

    try {
      if (scheduleType === 'single') {
        if (!singleDate || !singleTime || !singleMessage.trim()) {
          setError('Preencha todos os campos obrigatórios');
          return;
        }

        const scheduledDateTime = new Date(`${singleDate}T${singleTime}`);
        
        await FollowUpService.createScheduledMessage({
          contactId: selectedContact.id,
          contactName: selectedContact.name,
          contactPhone: selectedContact.phoneNumber,
          contactAvatar: selectedContact.avatar,
          message: singleMessage,
          scheduledDate: scheduledDateTime.toISOString(),
          priority,
          notes,
          autoSend: true
        });
      } else {
        // Sequência
        const validMessages = messages.filter(m => m.message.trim());
        if (validMessages.length === 0) {
          setError('Adicione pelo menos uma mensagem na sequência');
          return;
        }

        await FollowUpService.createMessageSequence({
          contactId: selectedContact.id,
          contactName: selectedContact.name,
          contactPhone: selectedContact.phoneNumber,
          contactAvatar: selectedContact.avatar,
          messages: validMessages,
          priority,
          notes,
          autoSend: true
        });
      }

      onSuccess();
      onClose();
      
      // Reset form
      setSelectedContact(null);
      setSearchTerm('');
      setNotes('');
      setPriority('medium');
      setSingleMessage('');
      setMessages([{ id: '1', message: '', delayDays: 0, delayHours: 0, delayMinutes: 30 }]);
      setScheduleType('single');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setError('Erro ao criar agendamento');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Novo Agendamento</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Contato
              </label>
              
              {!selectedContact ? (
                <div>
                  <input
                    type="text"
                    placeholder="Buscar contato por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  
                  {filteredContacts.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {filteredContacts.map((contact) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => setSelectedContact(contact)}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                        >
                          <Avatar name={contact.name} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                            {contact.tags && contact.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {contact.tags.slice(0, 2).map((tag, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                    {typeof tag === 'string' ? tag : tag.name || 'Tag'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <Avatar name={selectedContact.name} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-800">{selectedContact.name}</p>
                    <p className="text-sm text-emerald-600">{selectedContact.phoneNumber}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedContact(null)}
                    className="p-1 hover:bg-emerald-100 rounded"
                  >
                    <X size={16} className="text-emerald-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Tipo de Agendamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Layers size={16} className="inline mr-1" />
                Tipo de Agendamento
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleType('single')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                    scheduleType === 'single' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare size={20} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">Envio Único</div>
                  <div className="text-xs text-gray-500 mt-1">Uma mensagem em data específica</div>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('sequence')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                    scheduleType === 'sequence' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Layers size={20} className="mx-auto mb-2" />
                  <div className="text-sm font-medium">Sequência</div>
                  <div className="text-xs text-gray-500 mt-1">Múltiplas mensagens com intervalos</div>
                </button>
              </div>
            </div>

            {/* Configuração do Envio Único */}
            {scheduleType === 'single' && (
              <div className="space-y-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h3 className="font-medium text-emerald-800 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Configurar Envio Único
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      value={singleTime}
                      onChange={(e) => setSingleTime(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea
                    value={singleMessage}
                    onChange={(e) => setSingleMessage(e.target.value)}
                    placeholder="Digite a mensagem que será enviada automaticamente..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {singleMessage.length}/1000 caracteres
                  </div>
                </div>
              </div>
            )}

            {/* Configuração da Sequência */}
            {scheduleType === 'sequence' && (
              <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-purple-800 flex items-center gap-2">
                    <Layers size={16} />
                    Configurar Sequência ({messages.length} mensagens)
                  </h3>
                  <button
                    type="button"
                    onClick={addMessage}
                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div key={msg.id} className="bg-white p-4 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-purple-700">
                          Mensagem {index + 1}
                          {index === 0 && ' (Imediata)'}
                        </span>
                        {messages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMessage(msg.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {index > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Dias</label>
                            <input
                              type="number"
                              min="0"
                              value={msg.delayDays}
                              onChange={(e) => updateMessage(msg.id, 'delayDays', parseInt(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Horas</label>
                            <input
                              type="number"
                              min="0"
                              max="23"
                              value={msg.delayHours}
                              onChange={(e) => updateMessage(msg.id, 'delayHours', parseInt(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Minutos</label>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={msg.delayMinutes}
                              onChange={(e) => updateMessage(msg.id, 'delayMinutes', parseInt(e.target.value) || 0)}
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      )}

                      <textarea
                        value={msg.message}
                        onChange={(e) => updateMessage(msg.id, 'message', e.target.value)}
                        placeholder={`Digite a ${index + 1}ª mensagem da sequência...`}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle size={16} className="inline mr-1" />
                Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare size={16} className="inline mr-1" />
                Observações (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este agendamento..."
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedContact || isLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isLoading ? 'Agendando...' : 
                 scheduleType === 'single' ? 'Agendar Envio' : 'Criar Sequência'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}