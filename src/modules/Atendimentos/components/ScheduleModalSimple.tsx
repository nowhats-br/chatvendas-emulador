import React from 'react';

interface ScheduleModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  allowInteractive?: boolean;
}

export function ScheduleModalSimple({ isOpen, onClose, onConfirm }: ScheduleModalSimpleProps) {
  const [text, setText] = React.useState('Mensagem de teste');

  // Log para debug no Electron
  React.useEffect(() => {
    if (isOpen) {
      console.log('🔍 MODAL SIMPLES ABERTO!');
      // Também tentar alertar para garantir que funciona no Electron
      setTimeout(() => {
        alert('Modal de teste foi aberto! Se você vê este alerta, o modal está funcionando.');
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center'
        }}
      >
        <h2 style={{ 
          color: '#059669', 
          marginBottom: '20px', 
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🎉 MODAL FUNCIONANDO!
        </h2>
        
        <p style={{ 
          color: '#374151', 
          marginBottom: '20px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Se você está vendo esta mensagem, o modal está funcionando perfeitamente! 
          O problema estava no ScheduleModal original.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#374151'
          }}>
            Mensagem de Teste:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              minHeight: '80px'
            }}
            placeholder="Digite sua mensagem..."
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              console.log('❌ Fechando modal de teste');
              alert('Modal será fechado!');
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
          
          <button
            onClick={() => {
              console.log('✅ Confirmando modal de teste');
              alert(`Mensagem confirmada: "${text}"`);
              onConfirm({
                type: 'text',
                content: { text }
              });
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✓ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}