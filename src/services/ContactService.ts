import { OrderService } from './OrderService';
import { PhoneValidationService, ContactImportResult } from './PhoneValidationService';
import { normalizeBrazilianPhone, toWhatsAppFormat } from '../utils/phoneUtils';

export type KanbanStage = string;

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  normalizedPhone?: string; // Novo: telefone normalizado
  whatsappId?: string; // Novo: ID para WhatsApp
  avatar: string;
  email: string;
  tags: string[];
  ltv: number;
  walletBalance?: number;
  notes?: string;
  lastPurchaseDate?: string;
  lastPurchaseValue?: number;
  lastPurchaseProducts?: string[];
  totalPurchases?: number;
  averageOrderValue?: number;
  preferredProducts?: string[];
  birthday?: string;
  location?: string;
  customFields?: any;
  status: 'active' | 'blocked' | 'lead';
  kanbanStage: KanbanStage;
  source?: string;
}

interface ContactData {
  phone: string;
  normalizedPhone: string;
  whatsappId: string;
  wasNormalized: boolean;
}

// Backend contact interface
interface BackendContact {
  id: string;
  name: string;
  phone: string;
  whatsapp_id?: string;
  email?: string;
  profile_picture?: string;
  stage?: string;
  total_spent?: number;
  tags?: string;
  notes?: string;
  last_seen?: string;
  customer_since?: string;
  created_at?: string;
  updated_at?: string;
}

class ContactServiceClass {
  private contacts: Contact[] = [];
  private readonly API_BASE = 'http://127.0.0.1:3010/api';

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      // Try to load from backend first
      await this.loadFromBackend();
    } catch (error) {
      console.warn('Failed to load from backend, using localStorage:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('chatvendas_contacts');
      if (stored) {
        try {
          const contacts = JSON.parse(stored);
          // Validate and clean contacts data
          this.contacts = contacts.map((contact: any) => {
            // Ensure tags are always strings
            if (contact.tags && Array.isArray(contact.tags)) {
              contact.tags = contact.tags.map((tag: any) => {
                if (typeof tag === 'string') {
                  return tag;
                } else if (tag && typeof tag === 'object') {
                  return tag.name || tag.label || tag.text || String(tag);
                } else {
                  return String(tag);
                }
              });
            } else {
              contact.tags = [];
            }
            return contact;
          });
        } catch (parseError) {
          console.error('Error parsing localStorage contacts, clearing:', parseError);
          localStorage.removeItem('chatvendas_contacts');
          this.contacts = [];
        }
      } else {
        this.contacts = [];
      }
    }
  }

  private async loadFromBackend() {
    try {
      console.log('🔄 Loading contacts from backend...');
      const response = await fetch(`${this.API_BASE}/contacts`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const backendContacts = data.data || data;

      console.log(`📥 Received ${backendContacts.length} contacts from backend`);

      // Convert backend contacts to frontend format
      this.contacts = backendContacts.map(this.convertBackendContact);

      // Also save to localStorage as cache
      this.save();

      console.log(`✅ Successfully loaded ${this.contacts.length} contacts from backend`);
    } catch (error) {
      console.error('❌ Error loading contacts from backend:', error);
      throw error;
    }
  }

  private convertBackendContact(backendContact: BackendContact): Contact {
    let tags: string[] = [];

    // Handle different tag formats from backend
    if (backendContact.tags) {
      try {
        let parsedTags;
        if (typeof backendContact.tags === 'string') {
          parsedTags = JSON.parse(backendContact.tags);
        } else {
          parsedTags = backendContact.tags;
        }

        if (Array.isArray(parsedTags)) {
          tags = parsedTags.map(tag => {
            if (typeof tag === 'string') {
              return tag;
            } else if (tag && typeof tag === 'object') {
              return tag.name || tag.label || tag.text || String(tag);
            } else {
              return String(tag);
            }
          });
        }
      } catch (e) {
        console.warn('Error parsing tags:', e, backendContact.tags);
        // If parsing fails, treat as string
        tags = [String(backendContact.tags)];
      }
    }

    return {
      id: backendContact.id,
      name: backendContact.name,
      phoneNumber: backendContact.phone,
      normalizedPhone: backendContact.phone,
      whatsappId: backendContact.whatsapp_id,
      avatar: backendContact.profile_picture || '',
      email: backendContact.email || '',
      tags,
      ltv: backendContact.total_spent || 0,
      walletBalance: 0,
      notes: backendContact.notes || '',
      lastPurchaseDate: backendContact.last_seen,
      status: 'active',
      kanbanStage: backendContact.stage || 'lead',
      source: 'backend'
    };
  }

  private save() {
    localStorage.setItem('chatvendas_contacts', JSON.stringify(this.contacts));
    window.dispatchEvent(new Event('contacts-update'));
  }

  async getAll(): Promise<Contact[]> {
    try {
      // Always try to get fresh data from backend
      await this.loadFromBackend();
    } catch (error) {
      console.warn('Using cached contacts due to backend error:', error);
    }
    return [...this.contacts];
  }

  getById(id: string): Contact | undefined {
    return this.contacts.find(c => c.id === id);
  }

  async update(id: string, data: Partial<Contact>) {
    try {
      // Update in backend first
      const backendData = {
        name: data.name,
        phone: data.phoneNumber,
        email: data.email,
        stage: data.kanbanStage,
        tags: data.tags,
        notes: data.notes,
        profile_picture: data.avatar
      };

      const response = await fetch(`${this.API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Update local cache
      const index = this.contacts.findIndex(c => c.id === id);
      if (index !== -1) {
        this.contacts[index] = { ...this.contacts[index], ...data };
        this.save();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      // Fallback to local update only
      const index = this.contacts.findIndex(c => c.id === id);
      if (index !== -1) {
        this.contacts[index] = { ...this.contacts[index], ...data };
        this.save();
      }
    }
  }

  updateStage(id: string, stage: KanbanStage) {
    this.update(id, { kanbanStage: stage });
  }

  getPurchaseHistory(_contactId: string) {
    const allOrders = OrderService.getAll();
    return allOrders.slice(0, Math.floor(Math.random() * 5));
  }

  // Novos métodos para validação de telefones

  /**
   * Valida e normaliza um número de telefone
   */
  validatePhone(phone: string) {
    return PhoneValidationService.validatePhone(phone);
  }

  /**
   * Cria um contato com validação de telefone
   */
  async createContactWithValidation(contactData: Omit<Contact, 'id' | 'normalizedPhone' | 'whatsappId'>): Promise<{ success: boolean; contact?: Contact; error?: string }> {
    const phoneValidation = this.validatePhone(contactData.phoneNumber);

    if (!phoneValidation.isValid) {
      return {
        success: false,
        error: phoneValidation.error || 'Número de telefone inválido'
      };
    }

    try {
      // Create in backend first
      const backendData = {
        name: contactData.name,
        phone: phoneValidation.normalizedPhone,
        email: contactData.email,
        stage: contactData.kanbanStage,
        tags: contactData.tags,
        notes: contactData.notes
      };

      const response = await fetch(`${this.API_BASE}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const backendContact = await response.json();
      const contact = this.convertBackendContact(backendContact);

      // Update local cache
      this.contacts.unshift(contact);
      this.save();

      return { success: true, contact };
    } catch (error) {
      console.error('Error creating contact in backend:', error);

      // Fallback to local creation
      const contact: Contact = {
        ...contactData,
        id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        normalizedPhone: phoneValidation.normalizedPhone,
        whatsappId: toWhatsAppFormat(phoneValidation.normalizedPhone)
      };

      this.contacts.unshift(contact);
      this.save();

      return { success: true, contact };
    }
  }

  /**
   * Importa contatos de uma lista de telefones
   */
  importContactsFromPhoneList(phoneListText: string): ContactImportResult {
    const result = PhoneValidationService.processPhoneList(phoneListText);

    if (result.success) {
      // Adicionar contatos válidos ao sistema
      result.validContacts.forEach(contactData => {
        const contact: Contact = {
          id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: contactData.name || 'Contato Importado',
          phoneNumber: contactData.phone,
          normalizedPhone: contactData.normalizedPhone,
          whatsappId: contactData.whatsappId,
          avatar: '', // Avatar será gerado no frontend com iniciais
          email: '',
          tags: ['Importado'],
          ltv: 0,
          walletBalance: 0,
          notes: contactData.wasNormalized ? `Número normalizado de ${contactData.phone}` : '',
          status: 'lead',
          kanbanStage: 'lead'
        };

        this.contacts.unshift(contact);
      });

      this.save();
    }

    return result;
  }

  /**
   * Importa contatos de texto CSV
   */
  importContactsFromCSV(csvText: string): ContactImportResult {
    const result = PhoneValidationService.processCSVText(csvText);

    if (result.success) {
      // Adicionar contatos válidos ao sistema
      result.validContacts.forEach(contactData => {
        const contact: Contact = {
          id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: contactData.name || 'Contato Importado',
          phoneNumber: contactData.phone,
          normalizedPhone: contactData.normalizedPhone,
          whatsappId: contactData.whatsappId,
          avatar: '', // Avatar será gerado no frontend com iniciais
          email: '',
          tags: ['Importado'],
          ltv: 0,
          walletBalance: 0,
          notes: contactData.wasNormalized ? `Número normalizado de ${contactData.phone}` : '',
          status: 'lead',
          kanbanStage: 'lead'
        };

        this.contacts.unshift(contact);
      });

      this.save();
    }

    return result;
  }

  /**
   * Normaliza todos os contatos existentes
   */
  normalizeAllContacts(): { normalized: number; errors: Array<{ id: string; name: string; error: string }> } {
    let normalized = 0;
    const errors: Array<{ id: string; name: string; error: string }> = [];

    this.contacts.forEach(contact => {
      if (!contact.normalizedPhone) {
        const validation = this.validatePhone(contact.phoneNumber);

        if (validation.isValid) {
          contact.normalizedPhone = validation.normalizedPhone;
          contact.whatsappId = toWhatsAppFormat(validation.normalizedPhone);

          if (validation.originalPhone !== validation.normalizedPhone) {
            normalized++;
            contact.notes = (contact.notes || '') + ` [Número normalizado de ${validation.originalPhone}]`;
          }
        } else {
          errors.push({
            id: contact.id,
            name: contact.name,
            error: validation.error || 'Número inválido'
          });
        }
      }
    });

    if (normalized > 0) {
      this.save();
    }

    return { normalized, errors };
  }

  /**
   * Obtém contatos válidos para campanhas (com telefones normalizados)
   */
  getValidContactsForCampaign(): Contact[] {
    return this.contacts.filter(contact =>
      contact.normalizedPhone &&
      contact.whatsappId &&
      contact.status === 'active'
    );
  }
}

export const ContactService = new ContactServiceClass();
