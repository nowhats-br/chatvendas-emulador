/**
 * Utilitários para tratamento de números de telefone brasileiros
 * 
 * Regras ANATEL CORRETAS:
 * - DDDs 11-28: Celulares DEVEM ter 9 dígitos (9XXXX-XXXX)
 * - DDDs 31-99: Celulares NÃO PODEM ter 9 dígitos (XXXX-XXXX - apenas 8 dígitos)
 */

/**
 * DDDs que DEVEM ter 9 dígitos (São Paulo, Rio de Janeiro e região)
 */
const DDD_9_DIGITS = [
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // São Paulo
  '21', '22', '24', '27', '28' // Rio de Janeiro e Espírito Santo
];

/**
 * DDDs que NÃO PODEM ter 9 dígitos (resto do Brasil - apenas 8 dígitos)
 */
const DDD_8_DIGITS = [
  '31', '32', '33', '34', '35', '37', '38', // Minas Gerais
  '41', '42', '43', '44', '45', '46', // Paraná
  '47', '48', '49', // Santa Catarina
  '51', '53', '54', '55', // Rio Grande do Sul
  '61', // Distrito Federal
  '62', '64', // Goiás
  '63', // Tocantins
  '65', '66', // Mato Grosso
  '67', // Mato Grosso do Sul
  '68', // Acre
  '69', // Rondônia
  '71', '73', '74', '75', '77', // Bahia
  '79', // Sergipe
  '81', '87', // Pernambuco
  '82', // Alagoas
  '83', // Paraíba
  '84', // Rio Grande do Norte
  '85', '88', // Ceará
  '86', '89', // Piauí
  '91', '93', '94', // Pará
  '92', '97', // Amazonas
  '95', // Roraima
  '96', // Amapá
  '98', '99' // Maranhão
];

/**
 * Remove todos os caracteres não numéricos do telefone
 */
function cleanPhone(phone) {
  return phone.replace(/\D/g, '');
}

/**
 * Identifica se é celular baseado no primeiro dígito
 */
function isMobile(number) {
  if (!number || number.length < 8) return false;
  const firstDigit = number.charAt(0);
  return ['6', '7', '8', '9'].includes(firstDigit);
}

/**
 * Normaliza número brasileiro seguindo as regras CORRETAS da ANATEL
 */
export function normalizeBrazilianPhone(phone) {
  const originalPhone = phone;
  let cleanedPhone = cleanPhone(phone);

  // Remover código do país se presente
  if (cleanedPhone.startsWith('55')) {
    cleanedPhone = cleanedPhone.substring(2);
  }

  // Verificar se tem pelo menos 10 dígitos (DDD + número)
  if (cleanedPhone.length < 10) {
    return {
      isValid: false,
      originalPhone,
      normalizedPhone: cleanedPhone,
      ddd: '',
      number: '',
      type: 'invalid',
      region: 'invalid',
      error: 'Número muito curto. Deve ter pelo menos DDD + 8 dígitos.'
    };
  }

  // Extrair DDD (primeiros 2 dígitos)
  const ddd = cleanedPhone.substring(0, 2);
  let number = cleanedPhone.substring(2);

  // Verificar se o DDD é válido
  const isDdd9Digits = DDD_9_DIGITS.includes(ddd);
  const isDdd8Digits = DDD_8_DIGITS.includes(ddd);

  if (!isDdd9Digits && !isDdd8Digits) {
    return {
      isValid: false,
      originalPhone,
      normalizedPhone: cleanedPhone,
      ddd,
      number,
      type: 'invalid',
      region: 'invalid',
      error: `DDD ${ddd} não é válido no Brasil.`
    };
  }

  const region = isDdd9Digits ? 'sp_rj' : 'other';
  const mobileCheck = isMobile(number);

  // Aplicar regras CORRETAS de normalização para celulares
  if (mobileCheck) {
    if (isDdd9Digits) {
      // DDDs 11-28: DEVEM ter 9 dígitos
      if (number.length === 8) {
        // Adicionar o 9º dígito
        number = '9' + number;
      } else if (number.length === 9) {
        // Já está correto, mas verificar se começa com 9
        if (!number.startsWith('9')) {
          return {
            isValid: false,
            originalPhone,
            normalizedPhone: ddd + number,
            ddd,
            number,
            type: 'mobile',
            region,
            error: `Celular do DDD ${ddd} deve começar com 9.`
          };
        }
      } else {
        return {
          isValid: false,
          originalPhone,
          normalizedPhone: ddd + number,
          ddd,
          number,
          type: 'mobile',
          region,
          error: `Celular do DDD ${ddd} deve ter 9 dígitos.`
        };
      }
    } else {
      // DDDs 31-99: NÃO PODEM ter 9 dígitos (apenas 8)
      if (number.length === 9 && number.startsWith('9')) {
        // REMOVER o 9º dígito (está incorreto)
        number = number.substring(1);
      } else if (number.length === 8) {
        // Já está correto
      } else {
        return {
          isValid: false,
          originalPhone,
          normalizedPhone: ddd + number,
          ddd,
          number,
          type: 'mobile',
          region,
          error: `Celular do DDD ${ddd} deve ter apenas 8 dígitos (sem o 9º dígito).`
        };
      }
    }
  }

  // Verificar comprimento final
  const expectedLength = mobileCheck ? (isDdd9Digits ? 9 : 8) : 8;
  if (number.length !== expectedLength) {
    return {
      isValid: false,
      originalPhone,
      normalizedPhone: ddd + number,
      ddd,
      number,
      type: mobileCheck ? 'mobile' : 'landline',
      region,
      error: `Número deve ter ${expectedLength} dígitos para ${mobileCheck ? 'celular' : 'fixo'} do DDD ${ddd}.`
    };
  }

  const normalizedPhone = ddd + number;

  return {
    isValid: true,
    originalPhone,
    normalizedPhone,
    ddd,
    number,
    type: mobileCheck ? 'mobile' : 'landline',
    region
  };
}

/**
 * Converte para formato WhatsApp (com código do país)
 */
export function toWhatsAppFormat(phone) {
  const result = normalizeBrazilianPhone(phone);
  
  if (!result.isValid) {
    console.warn(`⚠️ Número inválido: ${phone} - ${result.error}`);
    return phone; // Retorna original se inválido
  }

  return `55${result.normalizedPhone}@s.whatsapp.net`;
}