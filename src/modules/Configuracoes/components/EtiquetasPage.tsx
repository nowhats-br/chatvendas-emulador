import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../../services/AttendanceService';

// Ícones locais para evitar dependência de lucide-react que pode não estar instalada ou ter exports diferentes
const Tag = ({ size = 24, className = "" }) =>
    React.createElement('svg', { width: size, height: size, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className },
        React.createElement('path', { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" }),
        React.createElement('circle', { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor" }));

const Plus = ({ size = 24, className = "" }) =>
    React.createElement('svg', { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className },
        React.createElement('path', { d: "M5 12h14" }),
        React.createElement('path', { d: "M12 5v14" }));

const Trash2 = ({ size = 24, className = "" }) =>
    React.createElement('svg', { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className },
        React.createElement('path', { d: "M3 6h18" }),
        React.createElement('path', { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
        React.createElement('path', { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
        React.createElement('line', { x1: "10", y1: "11", x2: "10", y2: "17" }),
        React.createElement('line', { x1: "14", y1: "11", x2: "14", y2: "17" }));

const X = ({ size = 24, className = "" }) =>
    React.createElement('svg', { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className },
        React.createElement('path', { d: "M18 6 6 18" }),
        React.createElement('path', { d: "m6 6 12 12" }));

export default function EtiquetasPage() {
    const [tags, setTags] = useState<{ name: string, color: string }[]>([]);
    const [newTag, setNewTag] = useState({ name: '', color: '#10B981' });
    const [loading, setLoading] = useState(true);

    // Cores disponíveis
    const tagColors = [
        '#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6',
        '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'
    ];

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setLoading(true);
            // Busca contatos para extrair tags existentes
            // NOTA: Idealmente haveria um endpoint /tags, mas estamos extraindo dos contatos por enquanto
            // para manter consistência com o resto do sistema
            const contacts = await attendanceService.getAllContacts();
            const uniqueTags = new Map<string, string>();

            contacts.forEach((c: any) => {
                let cTags = c.tags;
                if (typeof cTags === 'string') {
                    try { cTags = JSON.parse(cTags); } catch { cTags = []; }
                }
                if (Array.isArray(cTags)) {
                    cTags.forEach((t: any) => {
                        if (typeof t === 'string') {
                            if (!uniqueTags.has(t)) uniqueTags.set(t, '#6B7280');
                        } else if (t.name && t.color) {
                            uniqueTags.set(t.name, t.color);
                        }
                    });
                }
            });

            const tagsList = Array.from(uniqueTags.entries()).map(([name, color]) => ({ name, color })).sort((a, b) => a.name.localeCompare(b.name));

            // Merge com tags do sistema (localStorage)
            const systemTags = localStorage.getItem('system_tags');
            if (systemTags) {
                try {
                    const parsed = JSON.parse(systemTags);
                    if (Array.isArray(parsed)) {
                        parsed.forEach((t: any) => {
                            if (t.name && t.color) tagsList.push(t);
                        });
                    }
                } catch (e) { }
            }

            // Remover duplicatas após merge (priorizando o que veio do localStorage se quiser editar cor, ou do banco? Vamos usar Map novamente)
            const finalMap = new Map();
            tagsList.forEach(t => finalMap.set(t.name, t.color));

            const finalTags = Array.from(finalMap.entries()).map(([name, color]) => ({ name, color })).sort((a, b) => a.name.localeCompare(b.name));

            setTags(finalTags);
        } catch (error) {
            console.error('Erro ao carregar etiquetas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async () => {
        if (!newTag.name) return;

        // Como não temos endpoint de criar tag avulsa, vamos criar um "Mock" de persistência ou 
        // salvar num contato sistema oculto se necessário. 
        // Mas o usuário pediu para "Configurar".
        // Para simplificar e funcionar AGORA, vamos apenas atualizar o estado local e permitir 
        // que o RightPanel leia isso se usarmos um contexto ou recarregarmos.
        // POREM, o RightPanel lê contacts. Se não salvarmos em lugar nenhum, não aparece lá.
        // SOLUÇÃO PROVISÓRIA ROBUSTA: Salvar num localStorage ou criar um contato 'dummy' de configuração? 
        // Ou melhor: Vamos assumir que o backend vai ser atualizado futuramente, 
        // mas por hora vamos salvar no localStorage 'system_tags' e fazer o RightPanel ler de lá TAMBÉM.

        const updatedTags = [...tags.filter(t => t.name !== newTag.name), newTag];
        setTags(updatedTags);

        // Persistência simples para garantir que apareça no outro lado
        localStorage.setItem('system_tags', JSON.stringify(updatedTags));

        // Dispara evento para atualizar outros componentes
        window.dispatchEvent(new Event('tags-updated'));

        setNewTag({ name: '', color: '#10B981' });
        alert('Etiqueta criada com sucesso!');
    };

    const handleDeleteTag = (tagName: string) => {
        const updatedTags = tags.filter(t => t.name !== tagName);
        setTags(updatedTags);
        localStorage.setItem('system_tags', JSON.stringify(updatedTags));
        window.dispatchEvent(new Event('tags-updated'));
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Tag className="text-purple-600" /> Gerenciar Etiquetas
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Criar Nova */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus size={20} className="text-purple-600" /> Nova Etiqueta
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Etiqueta</label>
                            <input
                                className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Cliente VIP"
                                value={newTag.name}
                                onChange={e => setNewTag({ ...newTag, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Etiqueta</label>
                            <div className="flex flex-wrap gap-3">
                                {tagColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewTag({ ...newTag, color })}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${newTag.color === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateTag}
                            disabled={!newTag.name}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Criar Etiqueta
                        </button>
                    </div>
                </div>

                {/* Lista de Etiquetas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4">Etiquetas Existentes ({tags.length})</h2>

                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Carregando...</div>
                    ) : tags.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 italic">Nenhuma etiqueta encontrada.</div>
                    ) : (
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {tags.map((tag, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: tag.color }}
                                        />
                                        <span className="font-medium text-gray-700">{tag.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteTag(tag.name)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Excluir (apenas localmente no gerenciador)"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
