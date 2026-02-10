import React from 'react';
import { ExportOptions } from '../../../services/ReportsService';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (options: ExportOptions) => void;
    initialFormat?: 'excel' | 'pdf';
}

export function ExportModal({ isOpen, onClose, onExport, initialFormat }: ExportModalProps) {
    const [options, setOptions] = React.useState<ExportOptions>({
        format: initialFormat || 'excel',
        includeDetails: true,
        includeCharts: true
    });

    React.useEffect(() => {
        if (isOpen && initialFormat) {
            setOptions(prev => ({ ...prev, format: initialFormat }));
        }
    }, [isOpen, initialFormat]);

    if (!isOpen) return null;

    const handleExport = () => {
        onExport(options);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                            📥 Exportar Relatório
                        </h2>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                            Configure o formato e detalhes do seu relatório
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            color: '#9ca3af',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {/* Formato */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#374151'
                        }}>
                            Escolha o Formato
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => setOptions({ ...options, format: 'excel' })}
                                style={{
                                    padding: '16px',
                                    backgroundColor: options.format === 'excel' ? '#ecfdf5' : 'white',
                                    border: `2px solid ${options.format === 'excel' ? '#059669' : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>📄</span>
                                <span style={{ fontWeight: 'bold', color: options.format === 'excel' ? '#059669' : '#374151' }}>
                                    Excel (.xlsx)
                                </span>
                            </button>

                            <button
                                onClick={() => setOptions({ ...options, format: 'pdf' })}
                                style={{
                                    padding: '16px',
                                    backgroundColor: options.format === 'pdf' ? '#fef2f2' : 'white',
                                    border: `2px solid ${options.format === 'pdf' ? '#dc2626' : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <span style={{ fontSize: '24px' }}>📕</span>
                                <span style={{ fontWeight: 'bold', color: options.format === 'pdf' ? '#dc2626' : '#374151' }}>
                                    PDF (.pdf)
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Opções extras */}
                    <div style={{
                        backgroundColor: '#f9fafb',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151'
                        }}>
                            <input
                                type="checkbox"
                                checked={options.includeDetails}
                                onChange={(e) => setOptions({ ...options, includeDetails: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                            />
                            <span>Incluir detalhes individuais das interações</span>
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#374151'
                        }}>
                            <input
                                type="checkbox"
                                checked={options.includeCharts}
                                onChange={(e) => setOptions({ ...options, includeCharts: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                            />
                            <span>Incluir gráficos de performance</span>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '24px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: 'white',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        Gerar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportModal;
