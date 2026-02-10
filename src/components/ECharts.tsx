import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface EChartsProps {
    option: any;
    style?: React.CSSProperties;
    className?: string;
    theme?: string | object;
    notMerge?: boolean;
}

export const ECharts: React.FC<EChartsProps> = ({ option, style, className, theme, notMerge = false }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts | null>(null);

    // Initialize
    useEffect(() => {
        if (!chartRef.current) return;

        // Check if instance already exists (e.g. from fast refresh)
        const existingInstance = echarts.getInstanceByDom(chartRef.current);
        if (existingInstance) {
            chartInstance.current = existingInstance;
        } else {
            chartInstance.current = echarts.init(chartRef.current, theme);
        }

        return () => {
            // We do strictly disposal on unmount
            chartInstance.current?.dispose();
            chartInstance.current = null;
        };
    }, [theme]);

    // Update options
    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.setOption(option, {
                notMerge,
                lazyUpdate: true, // Performance optimization
            });
        }
    }, [option, notMerge]);

    // Handle Resize
    useEffect(() => {
        if (!chartRef.current || !chartInstance.current) return;

        const chart = chartInstance.current;

        const handleResize = () => {
            chart.resize();
        };

        const resizeObserver = new ResizeObserver(() => {
            chart.resize();
        });
        resizeObserver.observe(chartRef.current);

        window.addEventListener('resize', handleResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [theme]); // Re-bind if theme changes (new instance)

    return <div ref={chartRef} style={{ width: '100%', height: '300px', ...style }} className={className} />;
};

export default ECharts;
