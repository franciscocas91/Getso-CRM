export type AiProvider = 'gemini' | 'openai' | 'deepseek';
export type Industry = 'services' | 'real_estate' | 'health' | 'municipality';

export interface Instance {
  id: number;
  name: string;
  region: string;
  chatwootUrl: string;
  apiKey: string;
  accountId: number;
  industry: Industry;
  aiProvider?: AiProvider;
  aiApiKey?: string;
  // --- START: Meta Integration Fields ---
  metaAppId?: string;
  metaBusinessAccountId?: string;
  metaToken?: string;
  metaInboxId?: number;
  // --- END: Meta Integration Fields ---
  // --- START: Webhook Fields ---
  webhookHmacToken?: string;
  // --- END: Webhook Fields ---
}

// --- START: Nuevos tipos para Workspace ---
export interface Team {
  id: number;
  instanceId: number;
  name: string;
  agentIds: number[];
}

export interface Folder {
  id: number;
  name: string;
  teamId?: number; // Equipo asignado a esta carpeta para control de acceso
}

export interface Inbox {
  id: number;
  instanceId: number;
  name: string;
  channelType: 'whatsapp'; // Por ahora, enfocado en WhatsApp
  phoneNumber: string;
  folders: Folder[];
}
// --- END: Nuevos tipos para Workspace ---


export interface Kpis {
  firstResponseTime: number;
  resolutionRate: number;
  avgResolutionTime: number;
  csat: number;
  agentUtilization: number;
  messageVolume: number;
  conversationVolume: number;
}

export type AnomalySeverity = 'baja' | 'media' | 'alta' | 'crítica';

export interface Anomaly {
  id: number;
  metricAffected: string;
  severity: AnomalySeverity;
  expectedValue: number;
  actualValue: number;
  detectedAt: string;
  anomalyType: 'spike' | 'drop' | 'outlier';
}

export type HealthStatusState = 'saludable' | 'degradado' | 'caído' | 'advertencia';

export interface HealthCheck {
  checkType: 'API' | 'Base de Datos' | 'Espacio en Disco';
  status: HealthStatusState;
  details: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

// Nuevos tipos para autenticación y gestión
export type Role = 'admin' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  assignedInstanceIds?: number[];
  token: string;
}

export type ConversationStatus = 'abierta' | 'resuelta' | 'pendiente';

// --- Start: Tipos Avanzados ---

// PIPELINE
export interface PipelineStageConfig {
    id: string;
    name: string;
    probability: number; // 0-100
    order: number;
}

export interface Conversation {
    id: number;
    contact: {
        id: number;
        name: string;
        avatarUrl: string;
    };
    lastMessage: string;
    status: ConversationStatus;
    lastActivityAt: string;
    pipelineStage: string; // Now refers to PipelineStageConfig.id
    tags: string[];
    // Propiedades adaptadas por rubro
    dealValue?: number; // Para 'services'
    assignedAgentId?: number;
    customFields?: Record<string, any>; // Para datos de otros rubros (inmobiliaria, salud, etc.)
    // Nuevas propiedades para Workspace
    inboxId: number;
    folderId: number;
}

// TAREAS
export type TaskType = string; // Generalizado a string para soportar tipos por rubro
export type TaskRecurrence = 'diaria' | 'semanal' | 'mensual';

export interface Task {
    id: number;
    conversationId: number;
    contactName: string;
    content: string;
    dueDate: string;
    priority: TaskPriority;
    isCompleted: boolean;
    assignedAgentId: number;
    type: TaskType;
    recurrence?: TaskRecurrence;
}
// --- End: Tipos Avanzados ---


export interface Message {
    id: number;
    content: string;
    createdAt: string;
    sender: {
        type: 'user' | 'agent';
        name: string;
        avatarUrl: string;
    };
    isInternal?: boolean;
}

export interface Agent {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
    isActive: boolean;
}

export type TaskPriority = 'Baja' | 'Media' | 'Alta';

// Tipos para Análisis de IA
export interface FaqItem {
  question: string;
  answer: string;
  count: number;
}

export interface TopicData {
  topic: string;
  percentage: number;
}

export interface IntentClassificationData {
  intent: string;
  percentage: number;
  count: number;
}

export interface PredictiveInsight {
    title: string;
    insight: string;
    icon: 'trendingUp' | 'users' | 'dollarSign';
}


export interface AiAnalysisReport {
  sentimentBreakdown: SentimentData;
  mainTopics: TopicData[];
  frequentlyAskedQuestions: FaqItem[];
  intentClassification: IntentClassificationData[];
  predictiveInsights: PredictiveInsight[];
  summary: string;
}

// Tipos para el flujo de integración
export type IntegrationStepStatus = 'pending' | 'in-progress' | 'success' | 'error';

export interface IntegrationStep {
  name: string;
  status: IntegrationStepStatus;
  error?: string;
}

// --- START: Tipos para Gestión de Contactos ---
export interface Contact {
  id: number;
  name: string;
  avatarUrl: string;
  tags: string[];
  // Industry-specific data
  interestedPropertyIds?: string[]; // for real_estate
  medicalHistoryIds?: string[]; // for health
  associatedServiceIds?: string[]; // for services
  municipalCaseIds?: string[]; // for municipality
}

export interface Property {
    id: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
}

export interface MedicalService {
    id: string;
    name: string;
    description: string;
}
// --- END: Tipos para Gestión de Contactos ---

// --- START: Tipos para Webhooks ---
export interface ChatwootWebhookPayload {
    event: 'conversation_created' | 'conversation_updated' | 'message_created' | 'contact_created' | 'contact_updated';
    [key: string]: any;
}
// --- END: Tipos para Webhooks ---
