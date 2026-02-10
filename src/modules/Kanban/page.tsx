import React from 'react';
import { KanbanSquare, Plus, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ContactService, Contact } from '../../services/ContactService';
import { KanbanCard } from './components/KanbanCard';
import { PurchaseHistoryModal } from '../Contatos/components/PurchaseHistoryModal';
import { ScheduleModal } from '../Atendimentos/components/ScheduleModal';
import { Order } from '../../services/OrderService';
import { cn } from '../../lib/utils';

import { attendanceService } from '../../services/AttendanceService';
import { WhatsAppService } from '../../services/WhatsAppService';
import { CreateLeadModal } from './components/CreateLeadModal';
import { ManageStagesModal } from './components/ManageStagesModal';
import { kanbanService, KanbanStage as StageData } from '../../services/KanbanService';
import { Contact as LocalContact } from '../../services/ContactService';

export default function KanbanPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [columns, setColumns] = React.useState<StageData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isManageStagesOpen, setIsManageStagesOpen] = React.useState(false);
  const [contactToEdit, setContactToEdit] = React.useState<Contact | null>(null);

  // Modals
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [historyOrders, setHistoryOrders] = React.useState<Order[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const [apiContacts, apiStages] = await Promise.all([
        attendanceService.getAllContacts(),
        kanbanService.getStages()
      ]);

      setColumns(apiStages);

      const mappedContacts: Contact[] = apiContacts.map((c: any) => ({
        id: c.id,
        name: c.name || c.phone || 'Sem nome',
        phoneNumber: c.phone || '',
        normalizedPhone: c.phone,
        whatsappId: c.whatsapp_id || (c.phone ? `${c.phone}@s.whatsapp.net` : undefined),
        avatar: c.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=random`,
        email: c.email || '',
        tags: typeof c.tags === 'string' ? JSON.parse(c.tags || '[]') : (c.tags || []),
        ltv: c.total_spent || 0,
        walletBalance: c.total_spent || 0,
        notes: c.notes || '',
        lastPurchaseDate: c.last_purchase_date,
        status: (c.status as any) || 'active',
        kanbanStage: c.stage || ''
      }));
      setContacts(mappedContacts);
    } catch (error) {
      console.error('Erro ao recarregar kanban:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleRefresh();

    // Listeners em tempo real via WhatsAppService
    WhatsAppService.on('contactCreated', handleRefresh);
    WhatsAppService.on('contactUpdated', handleRefresh);
    WhatsAppService.on('contactStageChanged', handleRefresh);

    return () => {
      WhatsAppService.off('contactCreated', handleRefresh);
      WhatsAppService.off('contactUpdated', handleRefresh);
      WhatsAppService.off('contactStageChanged', handleRefresh);
    };
  }, []);

  // Handlers
  const handleOpenChat = async (contact: Contact) => {
    try {
      // Tentar achar ticket existente ativo
      const response = await attendanceService.getTickets({ search: contact.phoneNumber });

      // Priorizar ticket aberto/pendente deste contato
      const existingTicket = response.data.find((t: any) =>
        (t.contact_id === contact.id || (contact.phoneNumber && t.contact_phone === contact.phoneNumber)) && t.status !== 'closed'
      );

      if (existingTicket) {
        navigate('/atendimentos', { state: { ticketId: existingTicket.id } });
        return;
      }

      // Se não achou ativo, procura instância usada anteriormente (em tickets fechados)
      const closedTicket = response.data.find((t: any) =>
        (t.contact_id === contact.id || (contact.phoneNumber && t.contact_phone === contact.phoneNumber))
      );

      let instanceId = closedTicket?.instance_id;

      if (!instanceId) {
        // Buscar instâncias disponíveis e pegar a primeira conectada
        const instances = await attendanceService.getInstances();
        const connected = instances.find((i: any) => i.status === 'connected');
        instanceId = connected?.id || instances[0]?.id;
      }

      if (!instanceId) {
        alert("Nenhuma instância conectada para criar o ticket.");
        return;
      }

      // Criar ticket em PENDENTE
      const newTicket = await attendanceService.createTicket({
        contact_id: contact.id,
        instance_id: instanceId,
        status: 'pending'
      });

      navigate('/atendimentos', { state: { ticketId: newTicket.id } });

    } catch (e) {
      console.error("Erro ao abrir chat do Kanban:", e);
      alert("Erro ao abrir chat.");
    }
  };

  const handleOpenHistory = (contact: Contact) => {
    setHistoryOrders(ContactService.getPurchaseHistory(contact.id));
    setSelectedContact(contact);
    setIsHistoryOpen(true);
  };

  const handleOpenFollowUp = (contact: Contact) => {
    setSelectedContact(contact);
    setIsScheduleOpen(true);
  };

  const handleScheduleConfirm = (data: any) => {
    console.log('Follow-up agendado para', selectedContact?.name, data);
    alert('Follow-up agendado com sucesso!');
  };

  const handleMenuAction = async (contact: Contact, action: 'edit' | 'delete' | 'archive') => {
    switch (action) {
      case 'edit':
        setContactToEdit(contact);
        setIsCreateModalOpen(true);
        break;
      case 'delete':
        if (confirm(`Tem certeza que deseja excluir ${contact.name}?`)) {
          try {
            await attendanceService.deleteContact(contact.id);
            handleRefresh();
          } catch (error: any) {
            console.error('Erro ao excluir contato:', error);
            alert(error.response?.data?.error || 'Erro ao excluir contato.');
          }
        }
        break;
      case 'archive':
        if (confirm(`Deseja arquivar ${contact.name}? O contato sairá do funil ativo.`)) {
          try {
            await attendanceService.updateContactStage(contact.id, 'archived');
            handleRefresh();
          } catch (error) {
            console.error('Erro ao arquivar contato:', error);
            alert('Erro ao arquivar contato.');
          }
        }
        break;
    }
  };

  const handleNewLead = () => {
    setIsCreateModalOpen(true);
  };

  // Drag and Drop Logic
  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('contactId');

    if (contactId) {
      // Atualização Otimista
      setContacts(prev => prev.map(c =>
        c.id === contactId ? { ...c, kanbanStage: stage } : c
      ));

      try {
        await attendanceService.updateContactStage(contactId, stage);
      } catch (error) {
        console.error('Erro ao atualizar estágio kanban:', error);
        handleRefresh(); // Reverter em caso de erro
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">

      {/* Modals Reutilizados */}
      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setContactToEdit(null);
        }}
        onSuccess={handleRefresh}
        contact={contactToEdit}
      />
      <ManageStagesModal
        isOpen={isManageStagesOpen}
        onClose={() => setIsManageStagesOpen(false)}
        onSuccess={handleRefresh}
      />
      {isHistoryOpen && (
        <PurchaseHistoryModal
          contact={selectedContact}
          history={historyOrders}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <KanbanSquare className="text-emerald-600" />
              Kanban de Vendas
            </h1>
            <p className="text-gray-500 mt-1">Gerencie seu funil de vendas visualmente.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsManageStagesOpen(true)}
              className="p-2 text-gray-500 hover:text-emerald-600 bg-white rounded-lg border border-gray-200 shadow-sm transition"
              title="Configurar Funil"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-emerald-600 bg-white rounded-lg border border-gray-200 shadow-sm transition disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleNewLead}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium"
            >
              <Plus size={20} /> Novo Lead
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {columns.map((col) => {
            const count = contacts.filter((c: Contact) => c.kanbanStage === col.id).length;
            const totalValue = contacts
              .filter((c: Contact) => c.kanbanStage === col.id)
              .reduce((sum: number, c: Contact) => sum + c.ltv, 0);

            return (
              <div key={col.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <div className={cn("w-full h-1 rounded-full mb-2", col.color.replace('border-', 'bg-'))} />
                <p className="text-xs text-gray-500 uppercase font-bold">{col.label}</p>
                <p className="text-lg font-bold text-gray-800">{count}</p>
                <p className="text-xs text-gray-400">
                  R$ {totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}k` : totalValue.toFixed(0)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="animate-spin text-gray-400" />
              <p className="text-gray-500">Carregando kanban...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-full min-w-[1700px]">
            {columns.map(col => (
              <div
                key={col.id}
                className="flex-1 flex flex-col h-full min-w-[320px] bg-gray-100/50 rounded-xl border border-gray-200"
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
              >
                {/* Column Header */}
                <div className={cn("p-4 border-b-2 bg-white rounded-t-xl flex justify-between items-center", col.color)}>
                  <span className="font-bold text-gray-700">{col.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                    {contacts.filter((c: Contact) => c.kanbanStage === col.id).length}
                  </span>
                </div>

                {/* Cards Area */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {contacts.filter((c: Contact) => c.kanbanStage === col.id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm">Nenhum contato</p>
                      <p className="text-xs">Arraste cards aqui</p>
                    </div>
                  ) : (
                    contacts.filter((c: Contact) => c.kanbanStage === col.id).map((contact: Contact) => (
                      <KanbanCard
                        key={contact.id}
                        contact={contact}
                        onOpenChat={handleOpenChat}
                        onOpenHistory={handleOpenHistory}
                        onOpenFollowUp={handleOpenFollowUp}
                        onMenuAction={handleMenuAction}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
