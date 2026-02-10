import React from 'react';
import { cn } from '../../../lib/utils';
import { Ticket, TicketStatus, TicketOrigin } from '../types';
const HeadsetChatIcon = ({ size = 38, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 100 100', fill: 'currentColor', className,
    style: { color: '#1e3a8a' } // Azul Marinho Profundo (quase preto)
  },
    // Balão de Chat Central
    React.createElement('path', { d: 'M50 20c-16.5 0-30 13.5-30 30 0 5.6 1.5 10.9 4.3 15.4L20 80l14.6-4.3c4.5 2.8 9.8 4.3 15.4 4.3 16.5 0 30-13.5 30-30S66.5 20 50 20z' }),
    // Três Pontos Brancos
    React.createElement('circle', { cx: '38', cy: '50', r: '3.5', fill: 'white' }),
    React.createElement('circle', { cx: '50', cy: '50', r: '3.5', fill: 'white' }),
    React.createElement('circle', { cx: '62', cy: '50', r: '3.5', fill: 'white' }),
    // Arco do Headset e Fones
    React.createElement('path', { d: 'M50 5C25.1 5 5 25.1 5 50v8c0 4.4 3.6 8 8 8h4S17 42 17 42h-4v-8c0-20.4 16.6-37 37-37s37 16.6 37 37v8h-4v24h4c4.4 0 8-3.6 8-8v-8c0-24.9-20.1-45-45-45z' }),
    // Microfone
    React.createElement('path', { d: 'M87 66v10c0 10.5-8.5 19-19 19H50.5c-2.8 0-5-2.2-5-5s2.2-5 5-5H68c5 0 9-4 9-9V66' }));


// Componentes de ícones usando React.createElement
const Search = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
    React.createElement('path', { d: 'm21 21-4.35-4.35' }));

const Filter = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('polygon', { points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46' }));

const Archive = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('rect', { width: '20', height: '5', x: '2', y: '3', rx: '1' }),
    React.createElement('path', { d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' }),
    React.createElement('path', { d: 'M10 12h4' }));

const Bot = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M12 8V4H8' }),
    React.createElement('rect', { width: '16', height: '12', x: '4', y: '8', rx: '2' }),
    React.createElement('path', { d: 'M2 14h2' }),
    React.createElement('path', { d: 'M20 14h2' }),
    React.createElement('path', { d: 'M15 13v2' }),
    React.createElement('path', { d: 'M9 13v2' }));

const Megaphone = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'm3 11 18-5v12L3 14v-3z' }),
    React.createElement('path', { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' }));

const Clock = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'M12 6v6l4 2' }));

const User = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '12', cy: '7', r: '4' }));

const Phone = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }));

const Headset = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M3 11a9 9 0 0 1 18 0v3a3 3 0 0 1-3 3h-1v-4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4H6a3 3 0 0 1-3-3v-3Z' }),
    React.createElement('path', { d: 'M21 14v2a7 7 0 0 1-7 7h-2' }));

const Mail = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }),
    React.createElement('path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }));

const MailOpen = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M12 13 2 6l10-4 10 4Z' }),
    React.createElement('path', { d: 'm2 6 10 7 10-7' }),
    React.createElement('path', { d: 'M2 6v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6' }));

const WalletIcon = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v-2a2 2 0 0 0-2-2H2' }),
    React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }));

const KanbanIcon = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('rect', { width: '18', height: '18', x: '3', y: '3', rx: '2' }),
    React.createElement('path', { d: 'M9 3v18' }),
    React.createElement('path', { d: 'M3 9h18' }),
    React.createElement('path', { d: 'M3 15h18' }));

const TicketIcon = ({ size = 16, className = "", title = "" }: { size?: number; className?: string; title?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, title
  },
    React.createElement('path', { d: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z' }),
    React.createElement('path', { d: 'M13 5v2' }),
    React.createElement('path', { d: 'M13 17v2' }),
    React.createElement('path', { d: 'M13 11v2' }));

interface TicketListProps {
  tickets: Ticket[];
  activeTab: TicketStatus;
  onTabChange: (status: TicketStatus) => void;
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  onOpenTicket?: (id: string) => void;
}

const originConfig: Record<TicketOrigin, { icon: any; label: string }> = {
  chatbot: { icon: Bot, label: 'Bot' },
  campaign: { icon: Megaphone, label: 'Campanha' },
  followup: { icon: Clock, label: 'Follow-up' },
  organic: { icon: User, label: 'Orgânico' }
};

const statusConfig: Record<TicketStatus, { color: string; bg: string; border: string }> = {
  pending: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-400' },
  open: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-400' },
  resolved: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-400' }
};

export function TicketList({ tickets, activeTab, onTabChange, selectedTicketId, onSelectTicket, onOpenTicket }: TicketListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filtragem Rigorosa por Status e Busca
  const filteredTickets = tickets.filter((t: Ticket) => {
    const matchesStatus = t.status === activeTab;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phoneNumber.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    pending: tickets.filter((t: Ticket) => t.status === 'pending').length,
    open: tickets.filter((t: Ticket) => t.status === 'open').length,
    resolved: tickets.filter((t: Ticket) => t.status === 'resolved').length,
  };

  return (
    <div className="w-[340px] h-full bg-[#f8f9fa] dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#222] flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-[#111] border-b border-gray-100 dark:border-[#222] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Atendimentos</h2>
          <div className="flex gap-1 text-gray-500 dark:text-gray-400">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#222] rounded-lg transition-colors"><Filter size={18} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 dark:border-[#333] rounded-xl bg-gray-50 dark:bg-[#1c1c1c] text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-gray-400 dark:text-gray-200 transition-all"
            placeholder="Buscar nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-2 gap-1 bg-[#f8f9fa] dark:bg-[#0a0a0a] shrink-0 border-b border-gray-200 dark:border-[#222]">
        {[
          { id: 'open', label: 'Abertos', count: counts.open },
          { id: 'pending', label: 'Pendentes', count: counts.pending },
          { id: 'resolved', label: 'Resolvidos', count: counts.resolved }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TicketStatus)}
            className={cn(
              "flex-1 pb-3 text-xs font-bold transition-all relative",
              activeTab === tab.id
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] px-1.5 rounded-full",
                activeTab === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              )}>{tab.count}</span>
            </div>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#333]">
        {filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-600">
            <Archive size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum ticket nesta aba.</p>
          </div>
        ) : (
          filteredTickets.map((ticket: Ticket) => {
            const origin = originConfig[ticket.origin];
            const OriginIcon = origin.icon;
            const statusStyle = statusConfig[ticket.status];

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={cn(
                  "relative bg-white dark:bg-[#111] rounded-xl p-3 border shadow-sm transition-all duration-200 cursor-pointer group hover:shadow-md min-h-[120px]", // Reduzido de ~158px para 120px
                  selectedTicketId === ticket.id
                    ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/10"
                    : "border-gray-100 dark:border-[#222] hover:border-gray-300",
                  // Hover colors baseadas na origem
                  ticket.origin === 'organic' && "hover:bg-green-50/50 dark:hover:bg-green-900/10 hover:border-green-200",
                  ticket.origin === 'chatbot' && "hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-200",
                  ticket.origin === 'campaign' && "hover:bg-purple-50/50 dark:hover:bg-purple-900/10 hover:border-purple-200",
                  ticket.origin === 'followup' && "hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:border-orange-200"
                )}
              >
                {/* Indicador Lateral de Status */}
                <div className={cn(
                  "absolute left-0 top-2 bottom-2 w-1 rounded-r-full opacity-80",
                  statusStyle.bg === 'bg-yellow-50' ? 'bg-yellow-400' :
                    statusStyle.bg === 'bg-blue-50' ? 'bg-blue-400' : 'bg-green-400'
                )} />

                {/* Cabeçalho da Instância (Card Pequeno) */}
                <div className="flex items-center gap-1.5 mb-1.5 ml-[44px]">
                  {ticket.instanceName && (
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-emerald-900/20 text-gray-600 dark:text-emerald-400 rounded text-[9px] font-bold border border-gray-200 dark:border-emerald-500/30 truncate max-w-[120px]">
                      {ticket.instanceName}
                    </span>
                  )}
                  {ticket.provider && (
                    <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold border border-blue-100 dark:border-blue-500/30 uppercase">
                      {ticket.provider}
                    </span>
                  )}
                </div>

                <div className="pl-2 flex gap-2.5">
                  {/* Avatar / Headset Logic */}
                  <div className="relative shrink-0">
                    {/* Nos estados Pendente e Resolvido, mostra o ícone de Headset por padrão */}
                    {ticket.status === 'pending' || ticket.status === 'resolved' ? (
                      <div
                        className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/50 group-hover:scale-110 transition-all duration-200 cursor-pointer overflow-hidden shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenTicket) {
                            onOpenTicket(ticket.id);
                          } else {
                            onSelectTicket(ticket.id);
                          }
                        }}
                        title={ticket.status === 'resolved' ? "Reabrir atendimento" : "Clique para abrir atendimento"}
                      >
                        <HeadsetChatIcon
                          size={32}
                          className="opacity-100 transition-opacity"
                        />
                      </div>
                    ) : (
                      /* No estado Aberto, mostra a foto do perfil real */
                      <img
                        src={ticket.avatar}
                        alt={ticket.name}
                        className="w-10 h-10 rounded-full object-cover border border-emerald-100 dark:border-emerald-900/30 group-hover:scale-105 transition-transform duration-200 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTicket(ticket.id);
                        }}
                      />
                    )}

                    {/* Indicadores de origem sobre a foto */}
                    {ticket.origin === 'chatbot' && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-white dark:border-[#111] shadow-sm">
                        <Bot size={8} />
                      </div>
                    )}
                    {ticket.origin === 'campaign' && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white p-0.5 rounded-full border-2 border-white dark:border-[#111] shadow-sm">
                        <Megaphone size={8} />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={cn(
                        "text-sm font-bold truncate pr-2",
                        ticket.unread > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {ticket.name}
                      </h3>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className={cn(
                          "text-[10px] whitespace-nowrap",
                          ticket.unread > 0 ? "text-emerald-600 font-bold" : "text-gray-400"
                        )}>{ticket.time}</span>
                        {ticket.status === 'pending' ? (
                          <Mail size={10} className="text-gray-400" />
                        ) : (
                          <MailOpen size={10} className="text-emerald-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <Phone size={9} />
                        {ticket.phoneNumber}
                      </div>

                      {/* Ícones de Relacionamento (Carteira, Kanban, CRM) */}
                      <div className="flex gap-1.5 px-1">
                        {ticket.hasWallet && (
                          <WalletIcon size={11} className="text-blue-500" title="Possui Saldo" />
                        )}
                        {ticket.hasKanban && (
                          <KanbanIcon size={11} className="text-purple-500" title="No Kanban" />
                        )}
                        {ticket.hasCrm && (
                          <TicketIcon size={11} className="text-orange-500" title="Histórico/CRM" />
                        )}
                      </div>
                    </div>

                    <p className={cn(
                      "text-xs truncate mb-1.5",
                      ticket.unread > 0 ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-500"
                    )}>
                      {ticket.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.tags && ticket.tags.slice(0, 3).map((tag: any, index) => {
                          const tagName = typeof tag === 'string' ? tag : (tag.name || '');
                          const tagColor = typeof tag === 'object' && tag.color ? tag.color : '#6B7280';

                          return (
                            <span
                              key={`${tagName}-${index}`}
                              className="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border flex items-center gap-1 transition-all"
                              style={{
                                backgroundColor: `${tagColor}15`, // 15% opacity bg
                                color: tagColor,
                                borderColor: `${tagColor}30` // 30% opacity border
                              }}
                            >
                              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: tagColor }} />
                              {tagName}
                            </span>
                          );
                        })}
                      </div>

                      {ticket.unread > 0 && (
                        <span className="flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow-sm">
                          {ticket.unread}
                        </span>
                      )}

                      {ticket.status === 'resolved' && (
                        <button
                          className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenTicket) onOpenTicket(ticket.id);
                          }}
                        >
                          Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
