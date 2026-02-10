import { getDatabase } from './init.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Popula o banco de dados com dados de exemplo para produção
 */
export async function seedDatabase() {
  const db = getDatabase();
  
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Verificar se já existem dados
    const contactsCount = await db.get('SELECT COUNT(*) as count FROM contacts');
    if (contactsCount.count > 0) {
      console.log('✅ Banco já possui dados, pulando seed');
      return;
    }

    // 1. Inserir instâncias de exemplo
    const instances = [
      {
        id: uuidv4(),
        name: 'Vendas Principal',
        phone_number: null,
        status: 'disconnected',
        provider: 'baileys'
      },
      {
        id: uuidv4(),
        name: 'Suporte',
        phone_number: null,
        status: 'disconnected',
        provider: 'baileys'
      }
    ];

    for (const instance of instances) {
      await db.run(`
        INSERT INTO instances (id, name, phone_number, status, provider)
        VALUES (?, ?, ?, ?, ?)
      `, [instance.id, instance.name, instance.phone_number, instance.status, instance.provider]);
    }

    // 2. Inserir contatos de exemplo
    const contacts = [
      {
        id: uuidv4(),
        name: 'João Silva',
        phone: '5511999999999',
        whatsapp_id: '5511999999999@c.us',
        stage: 'lead',
        total_spent: 0
      },
      {
        id: uuidv4(),
        name: 'Maria Santos',
        phone: '5511888888888',
        whatsapp_id: '5511888888888@c.us',
        stage: 'negotiation',
        total_spent: 150.00
      },
      {
        id: uuidv4(),
        name: 'Pedro Costa',
        phone: '5511777777777',
        whatsapp_id: '5511777777777@c.us',
        stage: 'closed',
        total_spent: 299.90
      }
    ];

    for (const contact of contacts) {
      await db.run(`
        INSERT INTO contacts (id, name, phone, whatsapp_id, stage, total_spent)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [contact.id, contact.name, contact.phone, contact.whatsapp_id, contact.stage, contact.total_spent]);
    }

    // 3. Inserir tickets de exemplo
    const tickets = [];
    for (let i = 0; i < contacts.length; i++) {
      const ticket = {
        id: uuidv4(),
        contact_id: contacts[i].id,
        instance_id: instances[0].id,
        status: i === 0 ? 'open' : 'closed',
        subject: `Atendimento ${contacts[i].name}`,
        priority: 'normal'
      };
      tickets.push(ticket);

      await db.run(`
        INSERT INTO tickets (id, contact_id, instance_id, status, subject, priority)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [ticket.id, ticket.contact_id, ticket.instance_id, ticket.status, ticket.subject, ticket.priority]);
    }

    // 4. Inserir mensagens de exemplo
    const messages = [
      {
        id: uuidv4(),
        ticket_id: tickets[0].id,
        contact_id: contacts[0].id,
        instance_id: instances[0].id,
        type: 'text',
        content: 'Olá! Gostaria de saber mais sobre seus produtos.',
        from_me: 0,
        status: 'delivered'
      },
      {
        id: uuidv4(),
        ticket_id: tickets[0].id,
        contact_id: contacts[0].id,
        instance_id: instances[0].id,
        type: 'text',
        content: 'Olá João! Claro, temos várias opções disponíveis. O que você está procurando?',
        from_me: 1,
        status: 'delivered'
      }
    ];

    for (const message of messages) {
      await db.run(`
        INSERT INTO messages (id, ticket_id, contact_id, instance_id, type, content, from_me, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [message.id, message.ticket_id, message.contact_id, message.instance_id, message.type, message.content, message.from_me, message.status]);
    }

    // 5. Inserir pedidos de exemplo
    const orders = [
      {
        id: uuidv4(),
        ticket_id: tickets[1].id,
        contact_id: contacts[1].id,
        instance_id: instances[0].id,
        total_amount: 150.00,
        status: 'completed',
        payment_method: 'pix',
        items: JSON.stringify([
          { name: 'Produto A', quantity: 1, price: 150.00 }
        ])
      },
      {
        id: uuidv4(),
        ticket_id: tickets[2].id,
        contact_id: contacts[2].id,
        instance_id: instances[0].id,
        total_amount: 299.90,
        status: 'completed',
        payment_method: 'cartao',
        items: JSON.stringify([
          { name: 'Produto B', quantity: 2, price: 149.95 }
        ])
      }
    ];

    for (const order of orders) {
      await db.run(`
        INSERT INTO orders (id, ticket_id, contact_id, instance_id, total_amount, status, payment_method, items)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [order.id, order.ticket_id, order.contact_id, order.instance_id, order.total_amount, order.status, order.payment_method, order.items]);
    }

    // 6. Inserir produtos de exemplo
    const products = [
      {
        id: uuidv4(),
        name: 'Produto A',
        description: 'Descrição do Produto A',
        price: 150.00,
        category: 'Categoria 1',
        active: 1
      },
      {
        id: uuidv4(),
        name: 'Produto B',
        description: 'Descrição do Produto B',
        price: 149.95,
        category: 'Categoria 2',
        active: 1
      }
    ];

    for (const product of products) {
      await db.run(`
        INSERT INTO products (id, name, description, price, category, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [product.id, product.name, product.description, product.price, product.category, product.active]);
    }

    // 7. Inserir campanhas de exemplo
    const campaigns = [
      {
        id: uuidv4(),
        name: 'Campanha de Boas-vindas',
        description: 'Mensagem automática para novos contatos',
        message_type: 'text',
        message_content: 'Bem-vindo! Como podemos ajudar você hoje?',
        status: 'completed',
        total_contacts: 10,
        messages_sent: 10,
        messages_delivered: 9,
        messages_read: 7,
        messages_failed: 0
      }
    ];

    for (const campaign of campaigns) {
      await db.run(`
        INSERT INTO campaigns (id, name, description, message_type, message_content, status, total_contacts, messages_sent, messages_delivered, messages_read, messages_failed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [campaign.id, campaign.name, campaign.description, campaign.message_type, campaign.message_content, campaign.status, campaign.total_contacts, campaign.messages_sent, campaign.messages_delivered, campaign.messages_read, campaign.messages_failed]);
    }

    // 8. Inserir transações de exemplo
    const transactions = [
      {
        id: uuidv4(),
        type: 'income',
        category: 'vendas',
        amount: 150.00,
        description: 'Venda - Produto A',
        status: 'completed'
      },
      {
        id: uuidv4(),
        type: 'income',
        category: 'vendas',
        amount: 299.90,
        description: 'Venda - Produto B',
        status: 'completed'
      },
      {
        id: uuidv4(),
        type: 'expense',
        category: 'marketing',
        amount: 50.00,
        description: 'Anúncios Facebook',
        status: 'completed'
      }
    ];

    for (const transaction of transactions) {
      await db.run(`
        INSERT INTO transactions (id, type, category, amount, description, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [transaction.id, transaction.type, transaction.category, transaction.amount, transaction.description, transaction.status]);
    }

    console.log('✅ Seed do banco de dados concluído com sucesso!');
    console.log(`📊 Dados inseridos:`);
    console.log(`   - ${instances.length} instâncias`);
    console.log(`   - ${contacts.length} contatos`);
    console.log(`   - ${tickets.length} tickets`);
    console.log(`   - ${messages.length} mensagens`);
    console.log(`   - ${orders.length} pedidos`);
    console.log(`   - ${products.length} produtos`);
    console.log(`   - ${campaigns.length} campanhas`);
    console.log(`   - ${transactions.length} transações`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}