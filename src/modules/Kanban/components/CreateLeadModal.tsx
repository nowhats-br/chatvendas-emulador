import React, { useState } from 'react';
import { X, Save, User, Phone, FileText } from 'lucide-react';
import { attendanceService } from '../../../services/AttendanceService';
import { Contact } from '../../../services/ContactService';

interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contact?: Contact | null;
}

export function CreateLeadModal({ isOpen, onClose, onSuccess, contact }: CreateLeadModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        source: 'organic',
        notes: '',
        stage: 'lead'
    });

    React.useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                phone: contact.phoneNumber,
                source: contact.source || 'organic',
                notes: contact.notes || '',
                stage: contact.kanbanStage || 'lead'
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                source: 'organic',
                notes: '',
                stage: 'lead'
            });
        }
    }, [contact, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (contact) {
                await attendanceService.updateContact(contact.id, formData);
            } else {
                await attendanceService.createContact(formData);
            }
            onSuccess();
            onClose();
            setFormData({ name: '', phone: '', source: 'organic', notes: '', stage: 'lead' });
        } catch (error) {
            console.error('Erro ao salvar lead:', error);
            alert('Erro ao salvar lead. Verifique se os dados estão corretos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">
                        {contact ? 'Editar Lead' : 'Novo Lead'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User size={14} /> Nome Completo
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: João Silva"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone size={14} /> WhatsApp
                        </label>
                        <input
                            type="tel"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Ex: 551199999999"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <FileText size={14} /> Notas Iniciais
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Ex: Cliente interessado em..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    {contact ? 'Salvar Alterações' : 'Salvar Lead'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
