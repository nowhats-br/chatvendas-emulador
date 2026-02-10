import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactService, Contact } from '../../services/ContactService';
import { PurchaseHistoryModal } from './components/PurchaseHistoryModal';
import { ContactDetailsModal } from './components/ContactDetailsModal';
import { ContactImportModal } from './components/ContactImportModal';
import { ContactImportResult } from '../../services/PhoneValidationService';
import { Order } from '../../services/OrderService';
import { useToast } from '../../hooks/useToast';
import { Avatar } from '../../components/Avatar';

// Custom icon components
const SearchIcon = ({ size = 20, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('circle', { cx: '11', cy: '11', r: '8' }), React.createElement('path', { d: 'm21 21-4.35-4.35' }));
const FilterIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polygon', { points: '22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3' }));
const MessageSquareIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }));
const ShoppingBagIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' }), React.createElement('path', { d: 'M3 6h18' }), React.createElement('path', { d: 'M16 10a4 4 0 0 1-8 0' }));
const EyeIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' }), React.createElement('circle', { cx: '12', cy: '12', r: '3' }));

const UploadIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), React.createElement('polyline', { points: '7,10 12,15 17,10' }), React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' }));

export default function ContatosPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Modal State
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null);
  const [historyOrders, setHistoryOrders] = React.useState<Order[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const { success: showSuccess } = useToast();

  const loadData = async () => {
    try {
      console.log('🔄 Loading contacts...');
      const contactsData = await ContactService.getAll();
      console.log(`✅ Loaded ${contactsData.length} contacts`);
      setContacts(contactsData);
    } catch (error) {
      console.error('❌ Erro ao carregar contatos:', error);
      setContacts([]);
    }
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('contacts-update', loadData);
    return () => window.removeEventListener('contacts-update', loadData);
  }, []);

  const handleOpenChat = (_contact: Contact) => {
    navigate('/atendimentos');
  };

  const handleOpenHistory = (contact: Contact) => {
    const history = ContactService.getPurchaseHistory(contact.id);
    setHistoryOrders(history);
    setSelectedContact(contact);
    setIsHistoryOpen(true);
  };

  const handleOpenDetails = (contact: Contact) => {
      setSelectedContact(contact);
      setIsDetailsOpen(true);
  };

  const handleImportComplete = (result: ContactImportResult) => {
    showSuccess(`${result.summary.valid} contatos importados com sucesso!`);
    loadData(); // Recarregar lista de contatos
  };

  const filteredContacts = contacts.filter((c: Contact) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {isHistoryOpen && (
        <PurchaseHistoryModal 
            contact={selectedContact}
            history={historyOrders}
            onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {isDetailsOpen && (
          <ContactDetailsModal 
            contact={selectedContact}
            onClose={() => setIsDetailsOpen(false)}
            onUpdate={loadData}
          />
      )}

      <ContactImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Contatos</h1>
            <p className="text-gray-500 mt-1">Gerencie sua base de clientes e leads.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsImportOpen(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
            >
              <UploadIcon size={18} />
              Importar Contatos
            </button>
            <div className="text-right">
               <span className="block text-2xl font-bold text-emerald-600">{contacts.length}</span>
               <span className="text-xs text-gray-500 uppercase font-bold">Total de Contatos</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-gray-700"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium text-sm">
            <FilterIcon size={18} /> Filtros Avançados
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Tags</th>
                <th className="p-4 font-bold">LTV (Total Gasto)</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {searchTerm ? (
                      <div>
                        <p className="text-lg font-medium mb-2">Nenhum contato encontrado</p>
                        <p className="text-sm">Tente ajustar os termos de busca</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">Nenhum contato cadastrado</p>
                        <p className="text-sm">Clique em "Importar Contatos" para começar</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact: Contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 cursor-pointer" onClick={() => handleOpenDetails(contact)}>
                      <div className="flex items-center gap-3">
                        <Avatar name={contact.name} size="md" />
                        <div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] border border-gray-200 font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-600 text-sm">R$ {contact.ltv.toFixed(2)}</span>
                      {contact.walletBalance && contact.walletBalance > 0 && (
                          <p className="text-[10px] text-blue-500 font-bold mt-0.5">Carteira: R$ {contact.walletBalance.toFixed(2)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        contact.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {contact.status === 'active' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDetails(contact)}
                          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition" 
                          title="Ver Detalhes"
                        >
                          <EyeIcon size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenChat(contact)}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" 
                          title="Abrir Conversa"
                        >
                          <MessageSquareIcon size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenHistory(contact)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="Histórico de Compras"
                        >
                          <ShoppingBagIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
