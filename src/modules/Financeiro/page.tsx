import React from 'react';
import { FinanceService, FinancialSummary, Transaction } from '../../services/FinanceService';
import { TransactionModal } from './components/TransactionModal';
import { cn } from '../../lib/utils';

// Custom icon components
const DollarSignIcon = ({ size = 24 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('line', { x1: '12', y1: '1', x2: '12', y2: '23' }), React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }));
const TrendingUpIcon = ({ size = 24 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '22,7 13.5,15.5 8.5,10.5 2,17' }), React.createElement('polyline', { points: '16,7 22,7 22,13' }));
const TrendingDownIcon = ({ size = 24 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('polyline', { points: '22,17 13.5,8.5 8.5,13.5 2,7' }), React.createElement('polyline', { points: '16,17 22,17 22,11' }));
const CreditCardIcon = ({ size = 24 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('rect', { width: '20', height: '14', x: '2', y: '5', rx: '2' }), React.createElement('line', { x1: '2', y1: '10', x2: '22', y2: '10' }));
const DownloadIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }), React.createElement('polyline', { points: '7,10 12,15 17,10' }), React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' }));
const PieChartIcon = ({ size = 20, className }: { size?: number; className?: string }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', className }, React.createElement('path', { d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }), React.createElement('path', { d: 'M22 12A10 10 0 0 0 12 2v10z' }));
const PlusIcon = ({ size = 18 }: { size?: number }) => React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }, React.createElement('path', { d: 'M5 12h14' }), React.createElement('path', { d: 'M12 5v14' }));

export default function FinanceiroPage() {
  const [summary, setSummary] = React.useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [period, setPeriod] = React.useState<'today' | 'week' | 'month'>('month');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const loadData = () => {
    setSummary(FinanceService.getSummary(period));
    setTransactions(FinanceService.getRecentTransactions());
  };

  React.useEffect(() => {
    loadData();
    window.addEventListener('order-update', loadData);
    window.addEventListener('finance-update', loadData); // Escuta atualizações manuais
    return () => {
        window.removeEventListener('order-update', loadData);
        window.removeEventListener('finance-update', loadData);
    };
  }, [period]);

  const handleAddTransaction = (data: any) => {
      FinanceService.addTransaction(data);
  };

  if (!summary) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddTransaction}
      />

      {/* Header */}
      <div className="p-8 pb-4 shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
            <p className="text-gray-500 mt-1">Visão geral de faturamento, custos e lucros.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
                {(['today', 'week', 'month'] as const).map(p => (
                    <button 
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                            period === p ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition shadow-sm font-medium text-sm"
            >
                <PlusIcon size={18} /> Nova Transação
            </button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-sm font-medium text-sm">
                <DownloadIcon size={18} /> Exportar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><DollarSignIcon size={24} /></div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12%</span>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase">Receita Total</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ {summary.revenue.toFixed(2)}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><TrendingUpIcon size={24} /></div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase">Lucro Líquido</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ {summary.profit.toFixed(2)}</h3>
                <p className="text-xs text-gray-400 mt-1">Margem: {summary.margin.toFixed(1)}%</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><TrendingDownIcon size={24} /></div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase">Custos Totais</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ {summary.cost.toFixed(2)}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><CreditCardIcon size={24} /></div>
                </div>
                <p className="text-gray-500 text-sm font-medium uppercase">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">R$ {summary.ticket.toFixed(2)}</h3>
                <p className="text-xs text-gray-400 mt-1">{summary.orderCount} vendas</p>
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart Area */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                      <PieChartIcon size={20} className="text-gray-400" /> Fluxo de Caixa (Simulado)
                  </h3>
                  <div className="h-64 flex items-end justify-between gap-2 px-4">
                      {[65, 40, 75, 50, 85, 90, 60].map((h, i) => (
                          <div key={i} className="w-full flex flex-col justify-end gap-1 group cursor-pointer">
                              <div 
                                className="w-full bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all relative"
                                style={{ height: `${h}%` }}
                              >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                      R$ {h * 100}
                                  </div>
                              </div>
                              <div className="h-1 w-full bg-gray-100 rounded-full"></div>
                              <span className="text-xs text-gray-400 text-center mt-2">Dia {i + 1}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Recent Transactions List */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Transações Recentes</h3>
                      <button className="text-xs text-emerald-600 font-bold hover:underline">Ver Todas</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                      {transactions.map((t: Transaction) => (
                          <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                      t.type === 'income' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                  )}>
                                      {t.type === 'income' ? <TrendingUpIcon size={18} /> : <TrendingDownIcon size={18} />}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-bold text-gray-800 truncate">{t.category}</p>
                                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{t.description}</p>
                                      {t.isManual && <span className="text-[9px] bg-gray-200 px-1 rounded text-gray-600">Manual</span>}
                                  </div>
                              </div>
                              <div className="text-right shrink-0">
                                  <p className={cn(
                                      "text-sm font-bold",
                                      t.type === 'income' ? "text-green-600" : "text-red-600"
                                  )}>
                                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                  </p>
                                  <p className="text-[10px] text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
}
