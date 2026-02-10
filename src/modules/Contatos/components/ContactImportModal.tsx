import React from 'react';
import { ContactService } from '../../../services/ContactService';
import { ContactImportResult } from '../../../services/PhoneValidationService';

// Ícones customizados
const X = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M18 6 6 18' }),
  React.createElement('path', { d: 'M6 6l12 12' }));

const Upload = ({ size = 16, className = "" }: { size?: number; className?: string }) => 
  React.createElement('svg', { 
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className 
  }, 
  React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
  React.createElement('polyline', { points: '7,10 12,15 17,10' }),
  React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' }));

interface ContactImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: ContactImportResult) => void;
}

export function ContactImportModal({ isOpen, onClose, onImportComplete }: ContactImportModalProps) {
  const [importText, setImportText] = React.useState('');
  const [isImporting, setIsImporting] = React.useState(false);

  const handleImport = async () => {
    if (!importText.trim()) {
      alert('Por favor, insira os contatos para importar');
      return;
    }

    setIsImporting(true);
    try {
      // Tentar importar como CSV primeiro, depois como lista de telefones
      let result: ContactImportResult;
      
      if (importText.includes(',') || importText.includes(';')) {
        result = ContactService.importContactsFromCSV(importText);
      } else {
        result = ContactService.importContactsFromPhoneList(importText);
      }

      onImportComplete(result);
      onClose();
      setImportText('');
    } catch (error) {
      console.error('Erro ao importar contatos:', error);
      alert('Erro ao importar contatos. Verifique o formato dos dados.');
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Upload className="text-blue-600" />
            Importar Contatos
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dados dos Contatos
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Cole aqui os contatos em um dos formatos:

1. Lista de telefones (um por linha):
11999887766
11888777666
11777666555

2. CSV com nome e telefone:
João Silva,11999887766
Maria Santos,11888777666
Pedro Costa,11777666555`}
              rows={12}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Formatos Suportados:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Lista simples:</strong> Um telefone por linha</li>
              <li>• <strong>CSV:</strong> Nome,Telefone (separado por vírgula)</li>
              <li>• <strong>Telefones:</strong> Com ou sem código do país (55)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || !importText.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <>
                  <Upload size={16} className="animate-pulse" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Importar Contatos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}