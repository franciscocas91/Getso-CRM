
import { Instance, User, Kpis, Anomaly, HealthCheck, TimeSeriesData, SentimentData, Conversation, Message, Agent, Task, AiAnalysisReport, PipelineStageConfig, Contact, Property, MedicalService, Team, Inbox, Industry } from '../types';

const API_BASE = '/api/v1'; // El proxy de Nginx redirigirá esto al backend

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Error desconocido en el servidor' }));
        throw new Error(errorData.detail || `Error: ${response.statusText}`);
    }
    // Handle cases where backend returns 204 No Content or similar
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return response.text().then(text => text ? JSON.parse(text) : {});
};


// --- Auth ---
export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await handleResponse(response);
        // The backend nests the user object
        if (data.user) {
            return { user: data.user, error: null };
        }
        return { user: null, error: data.error || 'Respuesta de login inválida' };

    } catch (error: any) {
        return { user: null, error: error.message };
    }
};

// --- Instance Management ---
export const getInstances = (): Promise<Instance[]> => fetch(`${API_BASE}/instances`).then(handleResponse);
export const createInstance = (newInstanceData: Omit<Instance, 'id'>): Promise<Instance> => {
    return fetch(`${API_BASE}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstanceData),
    }).then(handleResponse);
};
export const updateInstance = (updatedInstance: Instance): Promise<Instance> => {
    return fetch(`${API_BASE}/instances/${updatedInstance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInstance),
    }).then(handleResponse);
};
export const deleteInstance = (instanceId: number): Promise<{ success: boolean }> => {
    return fetch(`${API_BASE}/instances/${instanceId}`, { method: 'DELETE' }).then(handleResponse);
};

// --- Summary View ---
export const getKpis = (instance: Instance | {id: 'all'}): Promise<Kpis> => fetch(`${API_BASE}/summary/kpis?instance_id=${instance.id}`).then(handleResponse);
export const getAnomalies = (instance: Instance | {id: 'all'}): Promise<Anomaly[]> => fetch(`${API_BASE}/summary/anomalies?instance_id=${instance.id}`).then(handleResponse);
export const getHealthStatus = (instance: Instance | {id: 'all'}): Promise<HealthCheck[]> => fetch(`${API_BASE}/summary/health?instance_id=${instance.id}`).then(handleResponse);
export const getConversationVolume = (instance: Instance | {id: 'all'}, period: '7d' | '30d'): Promise<TimeSeriesData[]> => fetch(`${API_BASE}/summary/volume?instance_id=${instance.id}&period=${period}`).then(handleResponse);
export const getSentimentData = (instance: Instance | {id: 'all'}): Promise<SentimentData> => fetch(`${API_BASE}/summary/sentiment?instance_id=${instance.id}`).then(handleResponse);

// --- Workspace / Conversations ---
export const getConversations = (instance: Instance): Promise<Conversation[]> => fetch(`${API_BASE}/instances/${instance.id}/conversations`).then(handleResponse);
export const getMessagesForConversation = (conversationId: number, instance: Instance): Promise<Message[]> => fetch(`${API_BASE}/instances/${instance.id}/conversations/${conversationId}/messages`).then(handleResponse);
export const getAgents = (instance: Instance): Promise<Agent[]> => fetch(`${API_BASE}/instances/${instance.id}/agents`).then(handleResponse);
export const updateAgentStatus = (agentId: number, isActive: boolean, instance: Instance): Promise<Agent> => {
    return fetch(`${API_BASE}/instances/${instance.id}/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
    }).then(handleResponse);
};
export const getTeams = (instance: Instance): Promise<Team[]> => fetch(`${API_BASE}/instances/${instance.id}/teams`).then(handleResponse);
export const getInboxes = (instance: Instance): Promise<Inbox[]> => fetch(`${API_BASE}/instances/${instance.id}/inboxes`).then(handleResponse);


// --- Pipeline ---
export const updateConversationStage = (conversationId: number, newStageId: string, instance: Instance): Promise<Conversation> => {
    return fetch(`${API_BASE}/instances/${instance.id}/conversations/${conversationId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_stage_id: newStageId }),
    }).then(handleResponse);
};
export const getPipelineStages = (industry: Industry): Promise<PipelineStageConfig[]> => fetch(`${API_BASE}/pipelines/${industry}`).then(handleResponse);
export const updatePipelineStages = (updatedStages: PipelineStageConfig[], industry: Industry): Promise<PipelineStageConfig[]> => {
     return fetch(`${API_BASE}/pipelines/${industry}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStages),
    }).then(handleResponse);
};


// --- Tags ---
export const addTagToConversation = (conversationId: number, tag: string, instance: Instance): Promise<Conversation> => {
    return fetch(`${API_BASE}/instances/${instance.id}/conversations/${conversationId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
    }).then(handleResponse);
};
export const removeTagFromConversation = (conversationId: number, tagToRemove: string, instance: Instance): Promise<Conversation> => {
    return fetch(`${API_BASE}/instances/${instance.id}/conversations/${conversationId}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagToRemove }),
    }).then(handleResponse);
};


// --- Tasks ---
export const getAllTasks = (instance: Instance): Promise<Task[]> => fetch(`${API_BASE}/instances/${instance.id}/tasks`).then(handleResponse);
export const getTasksForConversation = (conversationId: number, instance: Instance): Promise<Task[]> => fetch(`${API_BASE}/instances/${instance.id}/conversations/${conversationId}/tasks`).then(handleResponse);

export const createTask = (taskData: Omit<Task, 'id'>, instance: Instance): Promise<Task> => {
    return fetch(`${API_BASE}/instances/${instance.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    }).then(handleResponse);
};

export const updateTask = (taskId: number, updates: Partial<Pick<Task, 'isCompleted'>>, instance: Instance): Promise<Task> => {
    return fetch(`${API_BASE}/instances/${instance.id}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    }).then(handleResponse);
};

export const deleteTask = (taskId: number, instance: Instance): Promise<{ success: boolean }> => {
    return fetch(`${API_BASE}/instances/${instance.id}/tasks/${taskId}`, {
        method: 'DELETE',
    }).then(handleResponse);
};

// --- AI Analysis ---
export const getAiAnalysis = (instance: Instance): Promise<AiAnalysisReport> => fetch(`${API_BASE}/instances/${instance.id}/ai-analysis`).then(handleResponse);

// --- Contacts ---
export const getContacts = (instance: Instance): Promise<Contact[]> => fetch(`${API_BASE}/instances/${instance.id}/contacts`).then(handleResponse);

export const updateContact = (contactId: number, updates: Partial<Contact>, instance: Instance): Promise<Contact> => {
    return fetch(`${API_BASE}/instances/${instance.id}/contacts/${contactId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    }).then(handleResponse);
};

// --- Industry Specific ---
export const getProperties = (instance: Instance): Promise<Property[]> => fetch(`${API_BASE}/instances/${instance.id}/properties`).then(handleResponse);

export const getMedicalServices = (instance: Instance): Promise<MedicalService[]> => fetch(`${API_BASE}/instances/${instance.id}/medical-services`).then(handleResponse);
