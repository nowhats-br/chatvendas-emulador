import React from 'react';
import { ECharts } from '../../../components/ECharts';
import { motion } from 'framer-motion';
import DashboardService, { WeeklyData, CategoryData } from '../../../services/DashboardService';

export function SalesChart() {
  const chartRef = React.useRef(null);
  const [weeklyData, setWeeklyData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadWeeklyData();

    return () => {
      // O ECharts-for-react gerencia a limpeza automaticamente
    };
  }, []);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getWeeklyData();
      setWeeklyData(data);
    } catch (err) {
      console.error('Erro ao carregar dados semanais:', err);
      setError('Erro ao carregar dados');
      // Fallback para dados vazios
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e5e7eb',
      textStyle: { color: '#374151' },
      padding: [10, 15],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
      show: false
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weeklyData.map((d) => d.dayName),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af' }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { type: 'dashed', color: '#f3f4f6' }
      },
      axisLabel: { color: '#9ca3af' }
    },
    series: [
      {
        name: 'Vendas',
        type: 'line',
        smooth: true,
        lineStyle: { width: 4, color: '#10b981' },
        showSymbol: false,
        areaStyle: {
          opacity: 0.1,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' }
            ]
          }
        },
        data: weeklyData.map((d) => d.sales)
      },
      {
        name: 'Atendimentos',
        type: 'line',
        smooth: true,
        lineStyle: { width: 4, color: '#3b82f6' },
        showSymbol: false,
        areaStyle: {
          opacity: 0.1,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' }
            ]
          }
        },
        data: weeklyData.map((d) => d.tickets)
      }
    ]
  };

  if (loading) {
    return (
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay: 0.2 },
        className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center"
      },
        React.createElement('div', { className: "text-gray-500" }, 'Carregando dados...')
      )
    );
  }

  if (error) {
    return (
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay: 0.2 },
        className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center"
      },
        React.createElement('div', { className: "text-red-500" }, error)
      )
    );
  }

  return (
    React.createElement(motion.div, {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.2 },
      className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full"
    },
      React.createElement('div', { className: "flex justify-between items-center mb-6" },
        React.createElement('h3', { className: "font-bold text-gray-800 text-lg" }, 'Desempenho Semanal'),
        React.createElement('button', {
          onClick: loadWeeklyData,
          className: "bg-gray-50 border-none text-sm text-gray-500 rounded-lg px-3 py-1 outline-none cursor-pointer hover:bg-gray-100 transition"
        }, 'Atualizar')
      ),
      React.createElement(ECharts, {
        option: options,
        style: { height: '300px' },
        notMerge: true
      })
    )
  );
}

export function CategoryChart() {
  const chartRef = React.useRef(null);
  const [categoryData, setCategoryData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadCategoryData();

    return () => {
      // O ECharts-for-react gerencia a limpeza automaticamente
    };
  }, []);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getCategoryData();
      setCategoryData(data);
    } catch (err) {
      console.error('Erro ao carregar dados de categorias:', err);
      setError('Erro ao carregar dados');
      // Fallback para dados vazios
      setCategoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Cores para as categorias
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

  const options = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = categoryData[params.dataIndex];
        if (data && data.revenue) {
          return `${params.name}<br/>Quantidade: ${params.value}<br/>Receita: ${DashboardService.formatCurrency(data.revenue)}`;
        }
        return `${params.name}<br/>Quantidade: ${params.value}`;
      }
    },
    legend: {
      bottom: '0%',
      left: 'center',
      icon: 'circle'
    },
    series: [
      {
        name: 'Categorias',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: categoryData.map((item, index) => ({
          value: item.quantity || 0,
          name: item.category || 'Sem categoria',
          itemStyle: { color: colors[index % colors.length] }
        }))
      }
    ]
  };

  if (loading) {
    return (
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay: 0.3 },
        className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center"
      },
        React.createElement('div', { className: "text-gray-500" }, 'Carregando dados...')
      )
    );
  }

  if (error) {
    return (
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay: 0.3 },
        className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center"
      },
        React.createElement('div', { className: "text-red-500" }, error)
      )
    );
  }

  if (categoryData.length === 0) {
    return (
      React.createElement(motion.div, {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, delay: 0.3 },
        className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex items-center justify-center"
      },
        React.createElement('div', { className: "text-gray-500" }, 'Nenhum dado disponível')
      )
    );
  }

  return (
    React.createElement(motion.div, {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.3 },
      className: "bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full"
    },
      React.createElement('div', { className: "flex justify-between items-center mb-4" },
        React.createElement('h3', { className: "font-bold text-gray-800 text-lg" }, 'Vendas por Categoria'),
        React.createElement('button', {
          onClick: loadCategoryData,
          className: "bg-gray-50 border-none text-sm text-gray-500 rounded-lg px-3 py-1 outline-none cursor-pointer hover:bg-gray-100 transition"
        }, 'Atualizar')
      ),
      React.createElement(ECharts, {
        option: options,
        style: { height: '300px' },
        notMerge: true
      })
    )
  );
}
