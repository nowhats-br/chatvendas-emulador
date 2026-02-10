import { api } from '../lib/api';

export interface KanbanStage {
    id: string;
    label: string;
    color: string;
    sort_order: number;
    is_system?: boolean;
}

class KanbanService {
    async getStages(): Promise<KanbanStage[]> {
        const response = await api.get('/kanban/stages');
        return response.data;
    }

    async createStage(data: Partial<KanbanStage>): Promise<KanbanStage> {
        const response = await api.post('/kanban/stages', data);
        return response.data;
    }

    async updateStage(id: string, data: Partial<KanbanStage>): Promise<KanbanStage> {
        const response = await api.put(`/kanban/stages/${id}`, data);
        return response.data;
    }

    async deleteStage(id: string): Promise<void> {
        await api.delete(`/kanban/stages/${id}`);
    }

    async reorderStages(stages: { id: string; sort_order: number }[]): Promise<void> {
        await api.put('/kanban/reorder', { stages });
    }
}

export const kanbanService = new KanbanService();
export default kanbanService;
