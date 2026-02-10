import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Página de teste simples
function TestPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#10b981' }}>✅ Sistema Funcionando!</h1>
      <p>O React Router está carregando corretamente.</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ marginRight: '20px', color: '#3b82f6' }}>Home</Link>
        <Link to="/test" style={{ color: '#3b82f6' }}>Test</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
