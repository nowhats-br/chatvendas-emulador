import React from 'react';
import { ContactService } from '../../../services/ContactService';

// Componentes de ícones usando React.createElement
const Upload = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '7,10 12,15 17,10' }),
    React.createElement('line', { x1: '12', x2: '12', y1: '15', y2: '3' }));

const FileText = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' }),
    React.createElement('path', { d: 'M14 2v4a2 2 0 0 0 2 2h4' }),
    React.createElement('path', { d: 'M10 9H8' }),
    React.createElement('path', { d: 'M16 13H8' }),
    React.createElement('path', { d: 'M16 17H8' }));

const CheckCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('path', { d: 'm9 11 3 3L22 4' }));

const XCircle = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('path', { d: 'm15 9-6 6' }),
    React.createElement('path', { d: 'm9 9 6 6' }));

const Users = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
    React.createElement('path', { d: 'm22 21-3-3m0 0-3-3m3 3 3-3m-3 3-3 3' }));

const Tag = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z' }),
    React.createElement('circle', { cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }));

const Wallet = ({ size = 16, className = "" }: { size?: number; className?: string }) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className
  },
    React.createElement('path', { d: 'M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v2a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z' }),
    React.createElement('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }));

interface AudienceSelectorProps {
  onUpdate: (valid: number, invalid: number, total: number, data?: any) => void;
}

export function AudienceSelector({ onUpdate }: AudienceSelectorProps) {
  const [inputMode, setInputMode] = React.useState<'paste' | 'file' | 'crm'>('paste');
  const [textInput, setTextInput] = React.useState('');
  const [stats, setStats] = React.useState({ valid: 0, invalid: 0, total: 0 });
  const [selectedTag, setSelectedTag] = React.useState('');
  const [walletFilter, setWalletFilter] = React.useState(false);

  // State for tags
  const [availableTags, setAvailableTags] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Fetch real tags from backend via AttendanceService (which now has getAllContacts)
    const fetchTags = async () => {
      try {
        // We need to dynamically import attendanceService or use it if available in context
        // Assuming ContactService was a mock, we use the new method added to AttendanceService
        // Since we cannot easily import attendanceService here without checking imports, 
        // I will use a direct fetch pattern matching the service logic to ensure it works without circular dep issues if any.
        // Actually, let's use the service since we are in the same project structure.
        const { attendanceService } = await import('../../../services/AttendanceService');
        const contacts = await attendanceService.getAllContacts();
        const tags = new Set<string>();
        contacts.forEach((c: any) => {
          if (Array.isArray(c.tags)) {
            c.tags.forEach((t: string) => tags.add(t));
          } else if (typeof c.tags === 'string') {
            // Start Handle possible JSON string or single string
            try {
              const parsed = JSON.parse(c.tags);
              if (Array.isArray(parsed)) parsed.forEach((t: string) => tags.add(t));
            } catch {
              tags.add(c.tags);
            }
          }
        });
        setAvailableTags(Array.from(tags));
      } catch (error) {
        console.error('Failed to fetch tags', error);
      }
    };
    fetchTags();
  }, []);

  const processNumbers = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    let valid = 0;
    let invalid = 0;

    lines.forEach(line => {
      const clean = line.replace(/\D/g, '');
      if (clean.length >= 10 && clean.length <= 13) valid++;
      else invalid++;
    });

    const newStats = { valid, invalid, total: lines.length };
    setStats(newStats);

    // Lista de números válida
    const validNumbers = lines
      .map(l => l.replace(/\D/g, ''))
      .filter(n => n.length >= 10 && n.length <= 13);

    onUpdate(valid, invalid, lines.length, { type: 'numbers', list: validNumbers });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(e.target.value);
    processNumbers(e.target.value);
  };

  const handleCrmFilter = async () => {
    try {
      let contacts = await ContactService.getAll();

      if (selectedTag) {
        contacts = contacts.filter(c => c.tags.includes(selectedTag));
      }

      if (walletFilter) {
        contacts = contacts.filter(c => (c.walletBalance || 0) > 0);
      }

      setStats({ valid: contacts.length, invalid: 0, total: contacts.length });
      onUpdate(contacts.length, 0, contacts.length, { type: 'contacts', list: contacts.map(c => c.id) });
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setStats({ valid: 0, invalid: 0, total: 0 });
      onUpdate(0, 0, 0, { type: 'contacts', list: [] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'paste', label: 'Manual', icon: FileText },
          { id: 'file', label: 'Arquivo CSV', icon: Upload },
          { id: 'crm', label: 'Filtros CRM', icon: Users }
        ].map((mode: { id: string; label: string; icon: any }) => (
          <button
            key={mode.id}
            onClick={() => setInputMode(mode.id as any)}
            className={`flex-1 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-all text-sm ${inputMode === mode.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
              }`}
          >
            <mode.icon size={16} /> {mode.label}
          </button>
        ))}
      </div>

      {inputMode === 'paste' && (
        <div className="relative">
          <textarea
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono"
            placeholder="Cole os números aqui (um por linha)&#10;5511999999999&#10;5511988888888"
            value={textInput}
            onChange={handleTextChange}
          />
        </div>
      )}

      {inputMode === 'file' && (
        <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-emerald-400 transition-colors cursor-pointer">
          <Upload size={40} className="mb-2 text-gray-400" />
          <span className="font-medium">Clique para selecionar o arquivo</span>
          <span className="text-xs mt-1">Suporta .csv, .xls, .xlsx</span>
        </div>
      )}

      {inputMode === 'crm' && (
        <div className="h-48 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col justify-center gap-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Etiqueta</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg outline-none bg-white"
                  value={selectedTag}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTag(e.target.value)}
                >
                  <option value="">Todas as Etiquetas</option>
                  {availableTags.map((tag: string) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-300 p-2.5 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  checked={walletFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletFilter(e.target.checked)}
                />
                <span className="text-sm text-gray-700 flex items-center gap-2">
                  <Wallet size={16} className="text-emerald-600" /> Com Saldo em Carteira
                </span>
              </label>
            </div>
            <button onClick={handleCrmFilter} className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700">
              Aplicar
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">Selecione os filtros acima para buscar contatos da sua base.</p>
        </div>
      )}

      {/* Stats Bar */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-4 animate-in fade-in">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Válidos</p>
              <p className="text-xl font-bold text-green-700">{stats.valid}</p>
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full text-red-600"><XCircle size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Inválidos</p>
              <p className="text-xl font-bold text-red-700">{stats.invalid}</p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Users size={20} /></div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold">Total</p>
              <p className="text-xl font-bold text-blue-700">{stats.total}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
