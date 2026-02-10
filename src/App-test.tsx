import React from 'react';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#10b981', marginBottom: '20px' }}>✅ Sistema Funcionando!</h1>
        <p style={{ color: '#666', marginBottom: '10px' }}>Backend: http://localhost:3010</p>
        <p style={{ color: '#666', marginBottom: '20px' }}>Frontend: http://localhost:5173</p>
        <div style={{
          padding: '15px',
          backgroundColor: '#f0fdf4',
          borderRadius: '4px',
          border: '1px solid #10b981'
        }}>
          <p style={{ color: '#065f46', fontWeight: 'bold' }}>
            Se você está vendo esta mensagem, o React está funcionando!
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
