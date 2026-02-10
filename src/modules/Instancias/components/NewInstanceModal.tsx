import React from 'react';

// Ícones customizados para evitar problemas de importação
const X = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('path', { d: 'm18 6-12 12' }),
    React.createElement('path', { d: 'm6 6 12 12' }));

const Check = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('path', { d: 'M9 11l3 3l8-8' }));

const Smartphone = ({ size = 16, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className, style
  },
    React.createElement('rect', { width: '14', height: '20', x: '5', y: '2', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'M12 18h.01' }));

interface NewInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, provider: 'baileys' | 'whaileys') => void | Promise<void>;
}

export function NewInstanceModal({ isOpen, onClose, onConfirm }: NewInstanceModalProps) {
  const [name, setName] = React.useState('');
  const [provider, setProvider] = React.useState<'baileys' | 'whaileys'>('whaileys');
  const [isLoading, setIsLoading] = React.useState(false);

  console.log('🔍 NewInstanceModal renderizando:', { isOpen, name, provider, isLoading });

  // Early return se não estiver aberto
  if (!isOpen) {
    console.log('🔍 NewInstanceModal: Modal fechado, não renderizando');
    return null;
  }

  console.log('🔍 NewInstanceModal: Modal aberto, renderizando interface');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Submetendo formulário:', { name, provider });
    console.log('📝 Provider selecionado:', provider);
    console.log('📝 Tipo do provider:', typeof provider);

    if (name.trim() && !isLoading) {
      setIsLoading(true);
      try {
        console.log('🚀 Chamando onConfirm com:', { name: name.trim(), provider });
        await onConfirm(name.trim(), provider);
        // Só limpar e fechar se não houve erro
        setName('');
        setProvider('whaileys');
        onClose();
      } catch (error) {
        console.error('Erro ao criar instância:', error);
        // Manter o modal aberto em caso de erro
        alert('Erro ao criar instância: ' + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    console.log('❌ Fechando modal');
    if (!isLoading) {
      setName('');
      setProvider('whaileys');
      onClose();
    }
  };

  // Fechar modal com ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isLoading]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        margin: '20px'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <Smartphone size={18} style={{ color: '#10b981' }} /> Nova Instância
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              padding: '6px',
              borderRadius: '50%',
              opacity: isLoading ? 0.5 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Nome da Identificação
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Ex: Vendas #01, Suporte, Marketing..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box'
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {name.length}/50 caracteres
            </p>
          </div>

          {/* Seletor de Provider */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Biblioteca WhatsApp
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                onClick={() => !isLoading && setProvider('whaileys')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${provider === 'whaileys' ? '#10b981' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  backgroundColor: provider === 'whaileys' ? '#f0fdf4' : 'white',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold', color: provider === 'whaileys' ? '#10b981' : '#6b7280' }}>
                  🚀 Whaileys
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Atendimentos & Vendas
                </div>
              </div>
              <div
                onClick={() => !isLoading && setProvider('baileys')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${provider === 'baileys' ? '#10b981' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  backgroundColor: provider === 'baileys' ? '#f0fdf4' : 'white',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 'bold', color: provider === 'baileys' ? '#10b981' : '#6b7280' }}>
                  ⚡ Baileys
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Envios em Massa (Bulk)
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: provider === 'whaileys' ? '#dbeafe' : '#fef3c7',
            border: `1px solid ${provider === 'whaileys' ? '#93c5fd' : '#fcd34d'}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px'
          }}>
            <p style={{
              fontSize: '12px',
              color: provider === 'whaileys' ? '#1e40af' : '#92400e',
              margin: 0
            }}>
              {provider === 'whaileys' ? (
                <>💡 <strong>Recomendado:</strong> Use para o sistema de Atendimentos e Vendas. Suporta botões interativos, listas e carrosséis.</>
              ) : (
                <>⚠️ <strong>Atenção:</strong> Use Baileys <strong>APENAS</strong> para envios em massa de Texto e Mídia. Não suporta funções interativas.</>
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#6b7280',
                fontWeight: '500',
                backgroundColor: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              style={{
                flex: 1,
                padding: '10px 16px',
                backgroundColor: (!name.trim() || isLoading) ? '#d1d5db' : '#10b981',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                cursor: (!name.trim() || isLoading) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                pointerEvents: isLoading ? 'none' : 'auto'
              }}
              onMouseOver={(e) => {
                if (!(!name.trim() || isLoading)) {
                  e.currentTarget.style.backgroundColor = '#059669';
                }
              }}
              onMouseOut={(e) => {
                if (!(!name.trim() || isLoading)) {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Criando...
                </>
              ) : (
                <>
                  <Check size={18} /> Criar Instância
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* CSS para animação de loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
