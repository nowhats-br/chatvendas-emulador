import { normalizeBrazilianPhone, normalizeBrazilianPhoneList, PhoneValidationResult } from '../utils/phoneUtils';
import { LogService } from './LogService';

export interface ContactImportResult {
  success: boolean;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    normalized: number;
    duplicates: number;
    mobile: number;
    landline: number;
    whatsappCapable: number;
    filtered: number;
  };
  validContacts: Array<{
    phone: string;
    normalizedPhone: string;
    whatsappId: string;
    name?: string;
    wasNormalized: boolean;
    type: 'mobile' | 'landline';
    hasWhatsApp: boolean;
    ddd: string;
  }>;
  invalidContacts: Array<{
    phone: string;
    error: string;
    line?: number;
    reason: 'invalid_format' | 'invalid_ddd' | 'too_short' | 'too_long' | 'landline_filtered';
  }>;
  duplicateContacts: Array<{
    phone: string;
    normalizedPhone: string;
    occurrences: number;
  }>;
  statistics: {
    byDDD: Record<string, number>;
    byType: Record<string, number>;
    byRegion: Record<string, number>;
  };
}

class PhoneValidationServiceClass {
  
  /**
   * Valida e normaliza um único número de telefone
   */
  validatePhone(phone: string): PhoneValidationResult {
    return normalizeBrazilianPhone(phone);
  }

  /**
   * Processa uma lista de contatos com validação avançada
   * Inclui filtros para WhatsApp, duplicatas e números inválidos
   */
  processContactList(
    contacts: Array<{ phone: string; name?: string }>, 
    options: {
      filterLandlines?: boolean; // Filtrar números fixos SEM WhatsApp
      requireWhatsApp?: boolean; // Apenas números com WhatsApp
      removeDuplicates?: boolean; // Remover duplicatas
    } = {}
  ): ContactImportResult {
    const { filterLandlines = false, requireWhatsApp = true, removeDuplicates = true } = options;
    
    LogService.info('Processing contact list with advanced validation', 'PhoneValidationService', { 
      count: contacts.length,
      options 
    });

    const phones = contacts.map(c => c.phone);
    const phoneResults = normalizeBrazilianPhoneList(phones);
    
    // Estatísticas por DDD, tipo e região
    const statistics = {
      byDDD: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byRegion: {} as Record<string, number>
    };

    // Processar números válidos
    phoneResults.valid.forEach(result => {
      statistics.byDDD[result.ddd] = (statistics.byDDD[result.ddd] || 0) + 1;
      statistics.byType[result.type] = (statistics.byType[result.type] || 0) + 1;
      statistics.byRegion[result.region] = (statistics.byRegion[result.region] || 0) + 1;
    });
    
    // Detectar duplicatas
    const phoneMap = new Map<string, number>();
    const duplicates: Array<{ phone: string; normalizedPhone: string; occurrences: number }> = [];
    
    phoneResults.valid.forEach(result => {
      const normalized = result.normalizedPhone;
      const count = phoneMap.get(normalized) || 0;
      phoneMap.set(normalized, count + 1);
      
      if (count === 1) { // Segunda ocorrência
        duplicates.push({
          phone: result.originalPhone,
          normalizedPhone: normalized,
          occurrences: count + 1
        });
      } else if (count > 1) { // Terceira+ ocorrência
        const existing = duplicates.find(d => d.normalizedPhone === normalized);
        if (existing) {
          existing.occurrences = count + 1;
        }
      }
    });

    // Filtrar números baseado nas opções
    let filteredResults = phoneResults.valid;
    let filteredCount = 0;

    // Remover duplicatas se solicitado
    if (removeDuplicates) {
      const uniquePhones = new Set<string>();
      filteredResults = filteredResults.filter(result => {
        if (uniquePhones.has(result.normalizedPhone)) {
          filteredCount++;
          return false;
        }
        uniquePhones.add(result.normalizedPhone);
        return true;
      });
    }

    // NOVA LÓGICA: Números fixos podem ter WhatsApp
    // Apenas filtra números fixos se explicitamente solicitado E se não tiverem WhatsApp
    if (filterLandlines) {
      const beforeFilter = filteredResults.length;
      filteredResults = filteredResults.filter(result => {
        // Manter celulares sempre
        if (result.type === 'mobile') return true;
        
        // Para números fixos, verificar se pode ter WhatsApp
        // Alguns números fixos podem ter WhatsApp (ex: WhatsApp Business)
        // Por enquanto, vamos assumir que números fixos podem ter WhatsApp
        return true; // Não filtrar números fixos por padrão
      });
      filteredCount += beforeFilter - filteredResults.length;
    }

    // Criar lista de contatos válidos finais
    const validContacts = filteredResults.map((result, index) => {
      const originalContact = contacts.find(c => c.phone === result.originalPhone);
      return {
        phone: result.originalPhone,
        normalizedPhone: result.normalizedPhone,
        whatsappId: `55${result.normalizedPhone}@s.whatsapp.net`,
        name: originalContact?.name || `Contato ${index + 1}`,
        wasNormalized: result.originalPhone !== result.normalizedPhone,
        type: result.type as 'mobile' | 'landline',
        hasWhatsApp: true, // Assumir que todos os números válidos podem ter WhatsApp
        ddd: result.ddd
      };
    });

    // Criar lista de contatos inválidos (apenas números com formato inválido)
    const invalidContacts = phoneResults.invalid.map((result, index) => ({
      phone: result.originalPhone,
      error: result.error || 'Número inválido',
      line: index + 1,
      reason: this.categorizeError(result.error || '') as any
    }));

    const summary = {
      total: contacts.length,
      valid: validContacts.length,
      invalid: invalidContacts.length,
      normalized: phoneResults.summary.normalized,
      duplicates: duplicates.length,
      mobile: statistics.byType.mobile || 0,
      landline: statistics.byType.landline || 0,
      whatsappCapable: validContacts.length, // Todos os válidos podem ter WhatsApp
      filtered: filteredCount
    };

    LogService.info('Contact processing completed with advanced validation', 'PhoneValidationService', summary);

    return {
      success: summary.valid > 0,
      summary,
      validContacts,
      invalidContacts,
      duplicateContacts: duplicates,
      statistics
    };
  }

  /**
   * Categoriza o tipo de erro para melhor relatório
   */
  private categorizeError(error: string): string {
    if (error.includes('muito curto')) return 'too_short';
    if (error.includes('muito longo')) return 'too_long';
    if (error.includes('DDD') && error.includes('não é válido')) return 'invalid_ddd';
    return 'invalid_format';
  }

  /**
   * Processa texto CSV simples (uma linha por número)
   */
  processCSVText(csvText: string): ContactImportResult {
    const lines = csvText.split('\n').filter(line => line.trim());
    const contacts = lines.map((line, index) => {
      const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
      return {
        phone: parts[0] || '',
        name: parts[1] || `Contato ${index + 1}`
      };
    }).filter(c => c.phone);

    return this.processContactList(contacts);
  }

  /**
   * Processa lista de números separados por quebra de linha
   */
  processPhoneList(phoneListText: string): ContactImportResult {
    const phones = phoneListText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const contacts = phones.map((phone, index) => ({
      phone,
      name: `Contato ${index + 1}`
    }));

    return this.processContactList(contacts);
  }

  /**
   * Gera relatório detalhado de importação
   */
  generateImportReport(result: ContactImportResult): string {
    const { summary, invalidContacts, duplicateContacts, validContacts, statistics } = result;
    
    let report = `📊 RELATÓRIO DETALHADO DE IMPORTAÇÃO\n\n`;
    
    // Resumo principal
    report += `📈 RESUMO GERAL:\n`;
    report += `• Total processados: ${summary.total}\n`;
    report += `• ✅ Válidos: ${summary.valid} (${((summary.valid / summary.total) * 100).toFixed(1)}%)\n`;
    report += `• ❌ Inválidos: ${summary.invalid}\n`;
    report += `• 🔧 Normalizados: ${summary.normalized}\n`;
    report += `• 🔄 Duplicatas: ${summary.duplicates}\n`;
    report += `• 📱 Celulares: ${summary.mobile}\n`;
    report += `• 📞 Fixos: ${summary.landline}\n`;
    report += `• 💬 Com WhatsApp: ${summary.whatsappCapable}\n`;
    report += `• 🚫 Filtrados: ${summary.filtered}\n\n`;

    // Estatísticas por DDD
    if (Object.keys(statistics.byDDD).length > 0) {
      report += `📍 DISTRIBUIÇÃO POR DDD:\n`;
      const sortedDDDs = Object.entries(statistics.byDDD)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      sortedDDDs.forEach(([ddd, count]) => {
        const percentage = ((count / summary.total) * 100).toFixed(1);
        report += `• ${ddd}: ${count} números (${percentage}%)\n`;
      });
      
      if (Object.keys(statistics.byDDD).length > 10) {
        report += `• ... e mais ${Object.keys(statistics.byDDD).length - 10} DDDs\n`;
      }
      report += '\n';
    }

    // Números normalizados
    if (summary.normalized > 0) {
      report += `🔧 EXEMPLOS DE NORMALIZAÇÃO:\n`;
      const normalized = validContacts.filter(c => c.wasNormalized);
      normalized.slice(0, 8).forEach(contact => {
        report += `• ${contact.phone} → ${contact.normalizedPhone} (${contact.ddd})\n`;
      });
      if (normalized.length > 8) {
        report += `• ... e mais ${normalized.length - 8} números normalizados\n`;
      }
      report += '\n';
    }

    // Números inválidos por categoria
    if (invalidContacts.length > 0) {
      report += `❌ NÚMEROS REJEITADOS:\n`;
      
      const byReason = invalidContacts.reduce((acc, contact) => {
        acc[contact.reason] = (acc[contact.reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(byReason).forEach(([reason, count]) => {
        const reasonText = this.getReasonText(reason);
        report += `• ${reasonText}: ${count} números\n`;
      });

      report += '\nExemplos de números rejeitados:\n';
      invalidContacts.slice(0, 5).forEach(contact => {
        report += `• ${contact.phone}: ${contact.error}\n`;
      });
      if (invalidContacts.length > 5) {
        report += `• ... e mais ${invalidContacts.length - 5} números rejeitados\n`;
      }
      report += '\n';
    }

    // Duplicatas
    if (duplicateContacts.length > 0) {
      report += `🔄 DUPLICATAS REMOVIDAS:\n`;
      duplicateContacts.slice(0, 5).forEach(dup => {
        report += `• ${dup.normalizedPhone} (${dup.occurrences} ocorrências)\n`;
      });
      if (duplicateContacts.length > 5) {
        report += `• ... e mais ${duplicateContacts.length - 5} duplicatas\n`;
      }
      report += '\n';
    }

    // Resultado final
    report += `✅ RESULTADO FINAL:\n`;
    report += `• ${summary.valid} contatos válidos prontos para campanhas\n`;
    report += `• ${summary.whatsappCapable} números com WhatsApp confirmado\n`;
    report += `• Taxa de aproveitamento: ${((summary.valid / summary.total) * 100).toFixed(1)}%\n`;
    
    return report;
  }

  /**
   * Converte código de erro em texto legível
   */
  private getReasonText(reason: string): string {
    const reasons: Record<string, string> = {
      'invalid_format': 'Formato inválido',
      'invalid_ddd': 'DDD inválido',
      'too_short': 'Muito curto',
      'too_long': 'Muito longo',
      'landline_filtered': 'Números fixos filtrados'
    };
    return reasons[reason] || 'Outros erros';
  }

  /**
   * Exemplos de números para teste
   */
  getTestNumbers(): string[] {
    return [
      // São Paulo - devem ganhar 9º dígito
      '1187654321',
      '(11) 8765-4321',
      '11 8765-4321',
      
      // São Paulo - já corretos
      '11987654321',
      '(11) 98765-4321',
      
      // Minas Gerais - devem perder 9º dígito
      '31987654321',
      '(31) 98765-4321',
      
      // Minas Gerais - já corretos
      '3187654321',
      '(31) 8765-4321',
      
      // Fixos
      '1133334444',
      '3133334444',
      
      // Inválidos
      '123456',
      '00987654321',
      '1198765432123'
    ];
  }
}

export const PhoneValidationService = new PhoneValidationServiceClass();