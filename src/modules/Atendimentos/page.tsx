import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TicketList } from './components/TicketList';
import { ChatWindow } from './components/ChatWindow';
import { RightPanel } from './components/RightPanel';
import { CatalogPanel } from './components/CatalogPanel';
import { CartPanel } from './components/CartPanel';
import { QuickRepliesPanel } from './components/QuickRepliesPanel';
import { ScheduleModal } from './components/ScheduleModal';
import { validateModuleIntegrity } from './security/validator';
import { attendanceService, Ticket as ApiTicket, ChatMessage } from '../../services/AttendanceService';
import { WhatsAppService } from '../../services/WhatsAppService';
import { Ticket, CartItem, Product, TicketStatus, TicketOrigin } from './types';
import { cn } from '../../lib/utils';

type RightPanelMode = 'default' | 'cart' | 'quick-replies' | 'none';

// Função para converter ticket da API para o formato local
const convertApiTicketToLocal = (apiTicket: ApiTicket): Ticket => {
  const rawName = apiTicket.contact_name || '';
  const phone = apiTicket.contact_phone || '';

  // Verifica se o nome é genérico (ex: "Contato 5562...", o próprio número, ou vazio)
  const isGeneric = !rawName ||
    rawName.startsWith('Contato ') ||
    rawName.replace(/\D/g, '') === phone.replace(/\D/g, '');

  const displayName = isGeneric ? (phone || 'Contato sem nome') : rawName;

  return {
    id: apiTicket.id,
    name: displayName,
    avatar: apiTicket.contact_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=059669&color=fff`,
    phoneNumber: phone,
    lastMessage: apiTicket.last_message || 'Sem mensagens',
    time: apiTicket.last_message_time ? new Date(apiTicket.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    unread: apiTicket.unread_count || 0,
    status: apiTicket.status === 'closed' ? 'resolved' : apiTicket.status as any,
    onlineStatus: 'offline', // TODO: implementar status online real
    department: apiTicket.department || 'Geral',
    tags: typeof apiTicket.contact_tags === 'string' ? JSON.parse(apiTicket.contact_tags || '[]') : (apiTicket.contact_tags || []),
    origin: (apiTicket.origin as TicketOrigin) || 'organic',
    instanceName: apiTicket.instance_name,
    provider: apiTicket.instance_provider,
    hasWallet: (apiTicket.contact_total_spent || 0) > 0,
    hasKanban: !!apiTicket.contact_stage && apiTicket.contact_stage !== 'lead',
    hasCrm: !!apiTicket.contact_tags && apiTicket.contact_tags !== '[]',
    notes: apiTicket.contact_notes || '',
    walletBalance: apiTicket.contact_total_spent || 0,
    contact_id: apiTicket.contact_id,
    contact_stage: apiTicket.contact_stage,
    lastSeen: apiTicket.contact_last_seen
  };
};

export default function AtendimentosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tickets, setTickets] = React.useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [messagesLoading, setMessagesLoading] = React.useState(false);

  // Estados de Interface e Carrinho POR TICKET
  // Dicionário de modos de painel por ticket
  const [panelsByTicket, setPanelsByTicket] = React.useState<Record<string, RightPanelMode>>({});
  const [activeTab, setActiveTab] = React.useState<TicketStatus>('open');
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);

  // Estados do Carrinho por Ticket: { items, freight, discount }
  type CartState = { items: CartItem[], freight: number, discount: number };
  const [cartsByTicket, setCartsByTicket] = React.useState<Record<string, CartState>>({});

  // --- Helpers derivados do Ticket Selecionado ---

  // Modo do Painel Direito (ex: 'default', 'cart', 'none')
  const rightPanelMode = React.useMemo(() => {
    return selectedTicketId ? (panelsByTicket[selectedTicketId] || 'default') : 'default'; // default é o estado inicial seguro
  }, [selectedTicketId, panelsByTicket]);

  const setRightPanelMode = (mode: RightPanelMode | ((prev: RightPanelMode) => RightPanelMode)) => {
    if (!selectedTicketId) return;
    setPanelsByTicket(prev => {
      const current = prev[selectedTicketId] || 'default';
      const next = typeof mode === 'function' ? (mode as any)(current) : mode;
      return { ...prev, [selectedTicketId]: next };
    });
  };

  // Dados do Carrinho Atual
  const currentCart = React.useMemo(() => {
    return selectedTicketId ? (cartsByTicket[selectedTicketId] || { items: [], freight: 0, discount: 0 }) : { items: [], freight: 0, discount: 0 };
  }, [selectedTicketId, cartsByTicket]);

  const cartItems = currentCart.items;
  const freight = currentCart.freight;
  const discount = currentCart.discount;

  // Função genérica para atualizar o carrinho do ticket atual
  const updateCurrentCart = (updates: Partial<CartState> | ((prev: CartState) => Partial<CartState>)) => {
    if (!selectedTicketId) return;
    setCartsByTicket(prev => {
      const current = prev[selectedTicketId] || { items: [], freight: 0, discount: 0 };
      const changes = typeof updates === 'function' ? (updates as any)(current) : updates;
      return { ...prev, [selectedTicketId]: { ...current, ...changes } };
    });
  };

  const setFreight = (val: number) => updateCurrentCart({ freight: val });
  const setDiscount = (val: number) => updateCurrentCart({ discount: val });

  // Limpar carrinho (chamado após venda concluída)
  const handleClearCart = () => {
    if (!selectedTicketId) return;
    setCartsByTicket(prev => {
      const newState = { ...prev };
      delete newState[selectedTicketId]; // Remove o carrinho deste ticket (reseta para vazio no get)
      return newState;
    });
    setRightPanelMode('default');
  };

  // Estado da Mensagem
  const [messageInput, setMessageInput] = React.useState('');

  // Inicialização
  React.useEffect(() => {
    validateModuleIntegrity();
    loadTickets();

    // Listeners para Atualização em Tempo Real
    const handleNewMessage = (payload: any) => {
      console.log('📨 Nova mensagem recebida via WebSocket:', payload);

      // Sempre recarregar a lista de tickets para atualizar última mensagem e contador
      loadTickets();

      // Se a mensagem for do ticket selecionado, recarregar mensagens silenciosamente
      if (selectedTicketId === payload.ticketId) {
        loadMessages(payload.ticketId, true);
      }
    };

    const handleNewTicket = (payload: any) => {
      console.log('🎫 Novo ticket recebido via WebSocket:', payload);
      loadTickets();
    };

    const handleTicketUpdated = (payload: any) => {
      console.log('📝 Ticket atualizado via WebSocket:', payload);
      loadTickets();
    };

    const handleTicketDeleted = (payload: any) => {
      console.log('🗑️ Ticket deletado via WebSocket:', payload);

      // Se era o ticket selecionado e foi mesclado
      if (selectedTicketId === payload.ticketId) {
        if (payload.mergedInto) {
          console.log(`🔄 Ticket mesclado para: ${payload.mergedInto}`);
          setSelectedTicketId(payload.mergedInto);
        } else {
          setSelectedTicketId(null);
        }
      }

      loadTickets();
    };

    const handleMessageUpdated = (payload: any) => {
      console.log('✏️ Mensagem editada via WebSocket:', payload);
      if (selectedTicketId !== payload.ticketId) return;

      setMessages(prev => prev.map(msg =>
        msg.id === payload.message.id
          ? { ...msg, content: payload.message.content }
          : msg
      ));
    };

    const handleMessageDeleted = (payload: any) => {
      console.log('🗑️ Mensagem deletada via WebSocket:', payload);
      // O payload pode vir apenas com messageId ou ticketId+messageId
      // Para segurança, filtramos apenas pelo ID da mensagem
      setMessages(prev => prev.filter(msg => msg.id !== payload.messageId));
    };

    WhatsAppService.on('newMessage', handleNewMessage);
    WhatsAppService.on('newTicket', handleNewTicket);
    WhatsAppService.on('ticketUpdated', handleTicketUpdated);
    WhatsAppService.on('ticketStatusUpdated', handleTicketUpdated);
    WhatsAppService.on('ticketDeleted', handleTicketDeleted);
    WhatsAppService.on('messageUpdated', handleMessageUpdated);
    WhatsAppService.on('messageDeleted', handleMessageDeleted);

    return () => {
      WhatsAppService.off('newMessage', handleNewMessage);
      WhatsAppService.off('newTicket', handleNewTicket);
      WhatsAppService.off('ticketUpdated', handleTicketUpdated);
      WhatsAppService.off('ticketStatusUpdated', handleTicketUpdated);
      WhatsAppService.off('ticketDeleted', handleTicketDeleted);
      WhatsAppService.off('messageUpdated', handleMessageUpdated);
      WhatsAppService.off('messageDeleted', handleMessageDeleted);
    };
  }, [selectedTicketId]); // Adicionado selectedTicketId como dependência para o listener de novas mensagens

  // Carregar mensagens quando ticket é selecionado
  React.useEffect(() => {
    if (selectedTicketId) {
      loadMessages(selectedTicketId);
    } else {
      setMessages([]);
    }
  }, [selectedTicketId]);

  const loadTickets = async () => {
    try {
      if (tickets.length === 0) setLoading(true);
      const response = await attendanceService.getTickets({
        limit: 50 // Carregar mais tickets para uma melhor experiência
      });

      const convertedTickets = response.data.map(convertApiTicketToLocal);
      setTickets(convertedTickets);

      // Se não há ticket selecionado, tenta selecionar via state (Kanban) ou padrão
      const state = location.state as { ticketId?: string } | null;
      if (state?.ticketId) {
        const targetTicket = convertedTickets.find(t => t.id === state.ticketId);
        if (targetTicket) {
          setSelectedTicketId(targetTicket.id);
          // Se o ticket estiver em status diferente da aba ativa, mudar a aba?
          // O ActiveTab define quais aparecem na lista. Se o ticket alvo nao estiver na aba, ele nao aparece na lista mas pode estar selecionado?
          // Sim, mas a lista filtra por ActiveTab.
          // Então precisamos mudar o ActiveTab se necessário.
          if (targetTicket.status !== activeTab) {
            setActiveTab(targetTicket.status as any); // Type assertion pois status ja validado
          }
          // Limpar state para evitar loop visual (history.replace é melhor)
          window.history.replaceState({}, document.title);
        }
      } else if (!selectedTicketId && convertedTickets.length > 0) {
        // Prioridade: Ticket da aba atual com mensagem não lida -> Ticket da aba atual -> Qualquer ticket
        const tabTickets = convertedTickets.filter(t => t.status === activeTab);
        const firstUnread = tabTickets.find(t => t.unread > 0);
        const firstAvailable = tabTickets[0];

        if (firstUnread) {
          setSelectedTicketId(firstUnread.id);
        } else if (firstAvailable) {
          setSelectedTicketId(firstAvailable.id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: string, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const response = await attendanceService.getMessages(ticketId, {
        limit: 100
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      if (!silent) setMessages([]);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const activeTicket = tickets.find((t: Ticket) => t.id === selectedTicketId) || null;

  // --- Lógica do Carrinho ---
  const handleAddToCart = (product: Product) => {
    if (!selectedTicketId) return;
    updateCurrentCart((prevCart) => {
      const existing = prevCart.items.find((item: CartItem) => item.id === product.id);
      let newItems;
      if (existing) {
        newItems = prevCart.items.map((item: CartItem) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newItems = [...prevCart.items, { ...product, qty: 1 }];
      }
      return { items: newItems };
    });
    setRightPanelMode('cart');
  };

  const handleRemoveFromCart = (id: string) => {
    updateCurrentCart(prev => ({ items: prev.items.filter(item => item.id !== id) }));
  };

  const handleUpdateQty = (id: string, delta: number) => {
    updateCurrentCart(prev => ({
      items: prev.items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    }));
  };

  // --- Handlers de Interface ---
  const handleToggleDefaultPanel = () => {
    setRightPanelMode((prev: RightPanelMode) => prev === 'default' ? 'none' : 'default');
  };

  const handleToggleCart = () => {
    setRightPanelMode((prev: RightPanelMode) => prev === 'cart' ? 'default' : 'cart');
  };

  const handleOpenQuickReplies = () => {
    setRightPanelMode((prev: RightPanelMode) => prev === 'quick-replies' ? 'none' : 'quick-replies');
  };

  // --- Handlers de Ticket ---
  const handleResolveTicket = async () => {
    if (!selectedTicketId) return;

    try {
      await attendanceService.updateTicketStatus(selectedTicketId, 'closed');

      // Atualizar estado local
      setTickets((prev: Ticket[]) => prev.map((t: Ticket) =>
        t.id === selectedTicketId ? { ...t, status: 'resolved' } : t
      ));
    } catch (error) {
      console.error('Erro ao resolver ticket:', error);
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedTicketId) return;

    try {
      await attendanceService.updateTicketStatus(selectedTicketId, 'open');

      // Atualizar estado local
      setTickets((prev: Ticket[]) => prev.map((t: Ticket) =>
        t.id === selectedTicketId ? { ...t, status: 'open' } : t
      ));

      // Mudar automaticamente para a aba "Aberto"
      setActiveTab('open');
    } catch (error) {
      console.error('Erro ao reabrir ticket:', error);
    }
  };

  const handleReturnToPending = async () => {
    if (!selectedTicketId) return;

    try {
      await attendanceService.updateTicketStatus(selectedTicketId, 'pending');

      // Atualizar estado local
      setTickets((prev: Ticket[]) => prev.map((t: Ticket) =>
        t.id === selectedTicketId ? { ...t, status: 'pending' } : t
      ));

      // Mudar automaticamente para a aba "Pendente"
      setActiveTab('pending');

    } catch (error) {
      console.error('Erro ao retornar ticket para pendente:', error);
    }
  };

  const handleOpenTicket = async (id?: string) => {
    const targetId = id || selectedTicketId;
    if (!targetId) return;

    try {
      await attendanceService.updateTicketStatus(targetId, 'open');

      // Atualizar estado local
      setTickets((prev: Ticket[]) => prev.map((t: Ticket) =>
        t.id === targetId ? { ...t, status: 'open' } : t
      ));

      // Selecionar o ticket
      setSelectedTicketId(targetId);

      // Mudar automaticamente para a aba "Aberto"
      setActiveTab('open');

      console.log('✅ Ticket aberto e aba alterada para "Aberto"');
    } catch (error) {
      console.error('Erro ao abrir ticket:', error);
    }
  };

  const handleScheduleConfirm = (scheduleData: any) => {
    console.log('Dados do Agendamento:', scheduleData);
    alert(`Agendamento confirmado!`);
  };

  const handleInsertMessage = (text: string) => {
    setMessageInput((prev: string) => prev + (prev ? ' ' : '') + text);
  };

  const handleSendCatalog = async (product: Product) => {
    if (!selectedTicketId || !activeTicket) return;

    try {
      const getImageUrl = (url?: string) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
        const backendUrl = 'http://127.0.0.1:3002';
        return `${backendUrl}${url}`;
      };

      const card = {
        title: product.name,
        description: product.description,
        imageUrl: getImageUrl(product.images?.[0]),
        price: product.price,
        buttons: [
          { id: `prod_${product.id}_buy`, text: 'Comprar Agora' }
        ]
      };

      await handleSendMessage(JSON.stringify([card]), 'carousel');
    } catch (error) {
      console.error('Erro ao enviar catálogo:', error);
    }
  };

  const handleSendMessage = async (content: string, type: any = 'text', media?: File) => {
    if (!selectedTicketId || !activeTicket) return;

    try {
      // Buscar dados do ticket para ter IDs atualizados
      const apiTicket = await attendanceService.getTicket(selectedTicketId);

      await attendanceService.sendMessage({
        instanceId: apiTicket.instance_id,
        contactId: apiTicket.contact_id,
        ticketId: selectedTicketId,
        type,
        content,
        media
      });

      // Recarregar mensagens
      await loadMessages(selectedTicketId);

      // Limpar input apenas se for texto
      if (type === 'text') {
        setMessageInput('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Verifique a conexão.');
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex h-full w-full bg-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando atendimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white relative overflow-hidden">
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      {/* Área Esquerda (Lista + Catálogo) */}
      <div className="relative h-full flex-shrink-0 hidden md:block">
        <TicketList
          tickets={tickets}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
          onOpenTicket={handleOpenTicket}
        />

        {isCatalogOpen && (
          <CatalogPanel
            onClose={() => setIsCatalogOpen(false)}
            onAddToCart={handleAddToCart}
            onSendCatalog={handleSendCatalog}
          />
        )}
      </div>

      {/* Área Central (Chat) */}
      <ChatWindow
        ticket={activeTicket}
        messages={messages}
        messagesLoading={messagesLoading}
        onToggleRightPanel={handleToggleDefaultPanel}
        onToggleCart={handleToggleCart}
        isRightPanelOpen={rightPanelMode !== 'none'}
        onResolveTicket={handleResolveTicket}
        onReopenTicket={handleReopenTicket}
        onReturnToPending={handleReturnToPending}
        onOpenTicket={handleOpenTicket}
        onOpenSchedule={() => setIsScheduleModalOpen(true)}
        onOpenQuickReplies={handleOpenQuickReplies}
        message={messageInput}
        setMessage={setMessageInput}
        onSendMessage={handleSendMessage}
      />

      {/* Área Direita (Paineis) */}
      <div className={cn(
        "relative h-full flex-shrink-0 transition-all duration-300 ease-in-out border-l border-gray-200",
        rightPanelMode === 'none' ? "w-0 overflow-hidden border-none" : "w-[350px]"
      )}>
        {rightPanelMode === 'default' && (
          <RightPanel
            ticket={activeTicket} // Passa o ticket ativo para o contexto do CRM
            onOpenCatalog={() => setIsCatalogOpen(true)}
            onInsertMessage={handleInsertMessage}
          />
        )}

        {rightPanelMode === 'cart' && (
          <CartPanel
            onClose={() => setRightPanelMode('default')}
            items={cartItems}
            freight={freight}
            discount={discount}
            ticketId={selectedTicketId}
            customerName={activeTicket?.name}
            ticket={activeTicket}
            onUpdateFreight={setFreight}
            onUpdateDiscount={setDiscount}
            onRemoveItem={handleRemoveFromCart}
            onUpdateQty={handleUpdateQty}
            onClearCart={handleClearCart}
          />
        )}

        {rightPanelMode === 'quick-replies' && (
          <QuickRepliesPanel
            onClose={() => setRightPanelMode('none')}
            onInsertMessage={handleInsertMessage}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}
