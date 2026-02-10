/**
 * EXEMPLO DE INTEGRAÇÃO - Módulo de Tickets
 * 
 * Este arquivo mostra como integrar o sistema automático de follow-up
 * com o módulo de tickets do sistema.
 * 
 * Copie e adapte este código para seus módulos existentes.
 */

import { SaleIntegration } from '../utils/SaleIntegration';

// Exemplo 1: Quando um ticket é fechado com venda
export function onTicketStatusChanged(ticketId: string, oldStatus: string, newStatus: string, ticketData: any) {
  // Verificar se o ticket foi fechado e contém dados de venda
  if (newStatus === 'closed' && ticketData.saleValue && ticketData.saleValue > 0) {
    console.log('🎯 Ticket fechado com venda detectada');
    
    SaleIntegration.notifyTicketStatusChange({
      ticketId,
      contactId: ticketData.contactId,
      oldStatus,
      newStatus,
      saleData: {
        contactId: ticketData.contactId,
        orderId: ticketId,
        value: ticketData.saleValue,
        products: ticketData.products || [],
        saleDate: new Date().toISOString()
      }
    });
  }
  
  // Verificar se foi movido para status que indica venda
  if (['financial', 'sold', 'payment_confirmed'].includes(newStatus)) {
    console.log('💰 Ticket movido para status de venda');
    
    SaleIntegration.onTicketClosed(
      ticketId,
      ticketData.contactId,
      ticketData.saleValue || 0,
      ticketData.products || []
    );
  }
}

// Exemplo 2: Quando um pagamento é confirmado
export function onPaymentConfirmed(paymentData: any) {
  console.log('💳 Pagamento confirmado - Disparando follow-up');
  
  SaleIntegration.notifySaleCompleted({
    contactId: paymentData.contactId,
    orderId: paymentData.orderId,
    value: paymentData.amount,
    products: paymentData.items.map((item: any) => item.name),
    saleDate: paymentData.confirmedAt
  });
}

// Exemplo 3: Integração com formulário de fechamento de ticket
export function handleTicketCloseForm(formData: any) {
  const { ticketId, contactId, saleValue, products, hasSale } = formData;
  
  if (hasSale && saleValue > 0) {
    console.log('📝 Formulário de fechamento com venda');
    
    SaleIntegration.onTicketClosed(ticketId, contactId, saleValue, products);
  }
}

// Exemplo 4: Listener para mudanças em tempo real
export function setupTicketListeners() {
  // Escutar mudanças via WebSocket ou polling
  window.addEventListener('ticket_updated', (event: any) => {
    const { ticket, oldTicket } = event.detail;
    
    if (ticket.status !== oldTicket.status) {
      onTicketStatusChanged(ticket.id, oldTicket.status, ticket.status, ticket);
    }
  });
  
  // Escutar confirmações de pagamento
  window.addEventListener('payment_confirmed', (event: any) => {
    onPaymentConfirmed(event.detail);
  });
}

// Exemplo 5: Integração com API de tickets
export class TicketService {
  static async closeTicket(ticketId: string, closeData: any) {
    try {
      // Fechar ticket via API
      const response = await fetch(`/api/tickets/${ticketId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(closeData)
      });
      
      if (response.ok) {
        const ticket = await response.json();
        
        // Se houve venda, notificar o sistema de follow-up
        if (closeData.hasSale && closeData.saleValue > 0) {
          SaleIntegration.onTicketClosed(
            ticketId,
            ticket.contactId,
            closeData.saleValue,
            closeData.products
          );
        }
        
        return ticket;
      }
    } catch (error) {
      console.error('Erro ao fechar ticket:', error);
    }
  }
  
  static async updateTicketStatus(ticketId: string, newStatus: string, additionalData?: any) {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData })
      });
      
      if (response.ok) {
        const ticket = await response.json();
        
        // Notificar mudança de status
        onTicketStatusChanged(ticketId, ticket.oldStatus, newStatus, ticket);
        
        return ticket;
      }
    } catch (error) {
      console.error('Erro ao atualizar status do ticket:', error);
    }
  }
}

// Exemplo 6: Componente React para formulário de fechamento
/*
import React, { useState } from 'react';
import { SaleIntegration } from '../FollowUp/utils/SaleIntegration';

export function TicketCloseForm({ ticketId, contactId, onClose }) {
  const [hasSale, setHasSale] = useState(false);
  const [saleValue, setSaleValue] = useState(0);
  const [products, setProducts] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Fechar ticket
    await TicketService.closeTicket(ticketId, {
      hasSale,
      saleValue,
      products
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={hasSale}
            onChange={(e) => setHasSale(e.target.checked)}
          />
          Houve venda?
        </label>
      </div>
      
      {hasSale && (
        <>
          <div>
            <label>Valor da venda:</label>
            <input
              type="number"
              value={saleValue}
              onChange={(e) => setSaleValue(Number(e.target.value))}
            />
          </div>
          
          <div>
            <label>Produtos vendidos:</label>
            <input
              type="text"
              placeholder="Produto 1, Produto 2..."
              onChange={(e) => setProducts(e.target.value.split(',').map(p => p.trim()))}
            />
          </div>
        </>
      )}
      
      <button type="submit">Fechar Ticket</button>
    </form>
  );
}
*/

// Inicializar listeners quando o módulo for carregado
if (typeof window !== 'undefined') {
  setupTicketListeners();
}