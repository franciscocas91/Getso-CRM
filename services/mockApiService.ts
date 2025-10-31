import { Instance, Kpis, Anomaly, HealthCheck, TimeSeriesData, SentimentData, User, Conversation, Message, Agent, ConversationStatus, AiAnalysisReport, Task, TaskPriority, PipelineStageConfig, TaskType, TaskRecurrence, Industry, Contact, Property, MedicalService, Team, Inbox, Folder } from '../types';
import { faker } from 'https://cdn.skypack.dev/@faker-js/faker@v7.6.0';

// --- START: Industry-Specific Configurations ---
const INDUSTRY_CONFIGS: Record<Industry, { pipelineStages: PipelineStageConfig[], taskTypes: TaskType[] }> = {
    services: {
        pipelineStages: [
            { id: 'stage_prospecto', name: 'Prospecto', probability: 10, order: 1 },
            { id: 'stage_lead', name: 'Lead Calificado', probability: 25, order: 2 },
            { id: 'stage_propuesta', name: 'Propuesta Enviada', probability: 60, order: 3 },
            { id: 'stage_negociacion', name: 'Negociación', probability: 80, order: 4 },
            { id: 'stage_ganado', name: 'Ganado', probability: 100, order: 5 },
        ],
        taskTypes: ['Tarea', 'Llamada', 'Reunión', 'Email']
    },
    real_estate: {
        pipelineStages: [
            { id: 're_prospecto', name: 'Prospecto Interesado', probability: 5, order: 1 },
            { id: 're_visita', name: 'Visita Agendada', probability: 20, order: 2 },
            { id: 're_oferta', name: 'Oferta Recibida', probability: 50, order: 3 },
            { id: 're_contrato', name: 'Contrato/Reserva', probability: 85, order: 4 },
            { id: 're_vendido', name: 'Vendido', probability: 100, order: 5 },
        ],
        taskTypes: ['Visita a Propiedad', 'Llamada de Seguimiento', 'Preparar Contrato', 'Tasación']
    },
    health: {
        pipelineStages: [
            { id: 'h_solicitud', name: 'Solicitud de Cita', probability: 25, order: 1 },
            { id: 'h_confirmada', name: 'Cita Confirmada', probability: 70, order: 2 },
            { id: 'h_atendido', name: 'Paciente Atendido', probability: 90, order: 3 },
            { id: 'h_seguimiento', name: 'En Seguimiento', probability: 95, order: 4 },
            { id: 'h_finalizado', name: 'Proceso Finalizado', probability: 100, order: 5 },
        ],
        taskTypes: ['Confirmar Cita', 'Enviar Resultados', 'Recordatorio de Preparación', 'Consulta de Seguimiento']
    },
    municipality: {
        pipelineStages: [
            { id: 'm_ingresado', name: 'Caso Ingresado', probability: 10, order: 1 },
            { id: 'm_asignado', name: 'Asignado a Depto.', probability: 30, order: 2 },
            { id: 'm_en_revision', name: 'En Revisión', probability: 60, order: 3 },
            { id: 'm_resuelto', name: 'Resuelto', probability: 95, order: 4 },
            { id: 'm_cerrado', name: 'Cerrado', probability: 100, order: 5 },
        ],
        taskTypes: ['Inspección en Terreno', 'Revisión de Documentos', 'Contacto Ciudadano', 'Generar Reporte']
    }
};
// --- END: Industry-Specific Configurations ---

let instances: Instance[] = [
  { id: 1, name: 'Alpha Corp (Servicios)', region: 'USA', chatwootUrl: 'https://alpha.chatwoot.demo', apiKey: 'cw_api_key_alpha_123', accountId: 101, industry: 'services', aiProvider: 'gemini', aiApiKey: 'gemini_fake_key_123' },
  { id: 2, name: 'Beta Inmobiliaria', region: 'Europa', chatwootUrl: 'https://beta.chatwoot.demo', apiKey: 'cw_api_key_beta_456', accountId: 102, industry: 'real_estate' },
  { id: 3, name: 'Gamma Salud', region: 'Asia', chatwootUrl: 'https://gamma.chatwoot.demo', apiKey: 'cw_api_key_gamma_789', accountId: 103, industry: 'health', aiProvider: 'openai', aiApiKey: 'openai_fake_key_789' },
  { id: 4, name: 'Municipio Delta', region: 'USA', chatwootUrl: 'https://delta.chatwoot.demo', apiKey: 'cw_api_key_delta_000', accountId: 104, industry: 'municipality' },
];

let conversationsByInstance: Record<number, Conversation[]> = {};
let messagesByConversation: Record<number, Message[]> = {};
let tasksByInstance: Record<number, Task[]> = {};
let agentsByInstance: Record<number, Agent[]> = {};
let propertiesByInstance: Record<number, Property[]> = {}; // For real estate
let contactsByInstance: Record<number, Contact[]> = {}; // For contacts
let teamsByInstance: Record<number, Team[]> = {};
let inboxesByInstance: Record<number, Inbox[]> = {};


const users: User[] = [
    { id: 1, name: 'Admin User', email: 'admin@demo.com', role: 'admin', token: 'fake-admin-token' },
    { id: 2, name: 'Cliente Alpha', email: 'client@demo.com', role: 'client', assignedInstanceIds: [1], token: 'fake-client-token' }
];

const mockApiCall = <T,>(data: T, delay: number = 500): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));
};

const checkAuth = (instance: Instance): Promise<Instance> => {
    return new Promise((resolve, reject) => {
        const storedInstance = instances.find(i => 
            i.chatwootUrl === instance.chatwootUrl &&
            i.accountId === instance.accountId &&
            i.apiKey === instance.apiKey
        );
        if (instances.some(i => i.id === instance.id)) {
            resolve(instance);
        } else {
            reject(new Error('Datos de conexión de Chatwoot inválidos (URL, ID de Cuenta o API Key).'));
        }
    });
};

export const testChatwootConnection = (instanceData: Omit<Instance, 'id'> | Instance): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (instanceData.apiKey.includes('fail')) {
                 resolve({ success: false, message: 'La API Key es inválida o no tiene permisos.' });
            } else if (!instanceData.chatwootUrl.startsWith('https://')) {
                 resolve({ success: false, message: 'La URL debe empezar con https://' });
            } else {
                 resolve({ success: true, message: 'Conexión exitosa.' });
            }
        }, 1000);
    });
};

const generateAgents = (instanceId: number): Agent[] => {
    if (agentsByInstance[instanceId]) return agentsByInstance[instanceId];
    faker.seed(instanceId * 200);
    const agents = Array.from({ length: faker.datatype.number({ min: 5, max: 15 }) }, (_, i) => ({
        id: i + 1,
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatarUrl: `https://i.pravatar.cc/150?u=agent${instanceId}-${i+1}`,
        isActive: faker.datatype.boolean(),
    }));
    agentsByInstance[instanceId] = agents;
    return agents;
}

const generateTeams = (instanceId: number): Team[] => {
    if (teamsByInstance[instanceId]) return teamsByInstance[instanceId];
    const agents = generateAgents(instanceId);
    if (agents.length < 4) return [];

    const teams: Team[] = [
        { id: 1, instanceId, name: 'Equipo de Ventas', agentIds: [agents[0].id, agents[1].id] },
        { id: 2, instanceId, name: 'Soporte Nivel 1', agentIds: [agents[2].id, agents[3].id] },
        { id: 3, instanceId, name: 'Soporte Nivel 2', agentIds: [agents[1].id, agents[3].id, agents[4].id] }
    ];
    teamsByInstance[instanceId] = teams;
    return teams;
};

const generateInboxesAndFolders = (instanceId: number): Inbox[] => {
    if (inboxesByInstance[instanceId]) return inboxesByInstance[instanceId];
    const teams = generateTeams(instanceId);

    const inboxes: Inbox[] = [
        {
            id: 1,
            instanceId,
            name: 'Ventas WhatsApp',
            channelType: 'whatsapp',
            phoneNumber: faker.phone.phoneNumber('+1 ### ### ####'),
            folders: [
                { id: 1, name: 'Nuevos Leads', teamId: teams[0]?.id },
                { id: 2, name: 'Seguimiento', teamId: teams[0]?.id },
            ]
        },
        {
            id: 2,
            instanceId,
            name: 'Soporte WhatsApp',
            channelType: 'whatsapp',
            phoneNumber: faker.phone.phoneNumber('+1 ### ### ####'),
            folders: [
                { id: 3, name: 'Consultas Generales', teamId: teams[1]?.id },
                { id: 4, name: 'Problemas Técnicos', teamId: teams[2]?.id },
                { id: 5, name: 'Facturación', teamId: teams[1]?.id },
            ]
        }
    ];
    inboxesByInstance[instanceId] = inboxes;
    return inboxes;
}


const generateProperties = (instanceId: number): Property[] => {
    if (propertiesByInstance[instanceId]) return propertiesByInstance[instanceId];
    faker.seed(instanceId * 1000);
    const properties: Property[] = Array.from({ length: 20 }, (_, i) => ({
        id: `prop_${instanceId}_${i}`,
        address: `${faker.address.streetAddress()}, ${faker.address.city()}`,
        price: faker.datatype.number({ min: 150000, max: 1200000 }),
        bedrooms: faker.datatype.number({min: 1, max: 5}),
        bathrooms: faker.datatype.number({min: 1, max: 4}),
        area: faker.datatype.number({min: 50, max: 300}),
    }));
    propertiesByInstance[instanceId] = properties;
    return properties;
}


const generateTasks = (instance: Instance, conversations: Conversation[], agents: Agent[]): Task[] => {
    if (tasksByInstance[instance.id]) return tasksByInstance[instance.id];
    faker.seed(instance.id * 900);
    const industryConfig = INDUSTRY_CONFIGS[instance.industry];
    let allTasks: Task[] = [];
    conversations.forEach(conv => {
        if(faker.datatype.boolean()) { 
            const taskCount = faker.datatype.number({min: 1, max: 3});
            for(let i=0; i < taskCount; i++) {
                const isRecurrent = faker.datatype.boolean();
                allTasks.push({
                    id: allTasks.length + 1,
                    conversationId: conv.id,
                    contactName: conv.contact.name,
                    content: faker.lorem.sentence(5),
                    dueDate: faker.date.future(7).toISOString(),
                    priority: faker.helpers.arrayElement<TaskPriority>(['Baja', 'Media', 'Alta']),
                    isCompleted: faker.datatype.boolean(),
                    assignedAgentId: faker.helpers.arrayElement(agents).id,
                    type: faker.helpers.arrayElement<TaskType>(industryConfig.taskTypes),
                    recurrence: isRecurrent ? faker.helpers.arrayElement<TaskRecurrence>(['diaria', 'semanal', 'mensual']) : undefined,
                });
            }
        }
    });
    tasksByInstance[instance.id] = allTasks;
    return allTasks;
}

const generateConversations = (instance: Instance): Conversation[] => {
    if (conversationsByInstance[instance.id]) {
        return conversationsByInstance[instance.id];
    }
    const agents = generateAgents(instance.id);
    const inboxes = generateInboxesAndFolders(instance.id);
    const industryConfig = INDUSTRY_CONFIGS[instance.industry];
    faker.seed(instance.id * 300);
    
    const conversations = Array.from({ length: faker.datatype.number({min: 25, max: 40}) }, (_, i): Conversation => {
        const randomInbox = faker.helpers.arrayElement(inboxes);
        const randomFolder = faker.helpers.arrayElement(randomInbox.folders);

        let conversation: Conversation = {
            id: 100 + i,
            contact: {
                id: 200 + i,
                name: faker.name.findName(),
                avatarUrl: `https://i.pravatar.cc/150?u=contact${instance.id}-${i+1}`,
            },
            lastMessage: faker.lorem.sentence(8),
            status: faker.helpers.arrayElement<ConversationStatus>(['abierta', 'resuelta', 'pendiente']),
            lastActivityAt: faker.date.recent(14).toISOString(),
            pipelineStage: faker.helpers.arrayElement(industryConfig.pipelineStages).id,
            tags: faker.helpers.arrayElements(faker.helpers.shuffle(['VIP', 'Urgente', 'Nuevo', 'Seguimiento']), faker.datatype.number({min: 0, max: 2})),
            assignedAgentId: faker.helpers.arrayElement(agents).id,
            inboxId: randomInbox.id,
            folderId: randomFolder.id,
        };

        // Add industry-specific data
        switch(instance.industry) {
            case 'services':
                conversation.dealValue = faker.datatype.number({ min: 50, max: 5000 });
                conversation.lastMessage = faker.helpers.arrayElement([
                    'Quisiera una cotización para el servicio de consultoría.',
                    '¿Podemos agendar una demo de su producto?',
                    'Tengo una pregunta sobre los planes de precios.'
                ]);
                break;
            case 'real_estate': {
                const properties = generateProperties(instance.id);
                const property = faker.helpers.arrayElement(properties);
                conversation.contact.name = "Comprador: " + conversation.contact.name;
                conversation.customFields = {
                    propertyId: property.id,
                    propertyAddress: property.address,
                    price: property.price,
                };
                conversation.lastMessage = `Me gustaría agendar una visita para la propiedad en ${property.address.split(',')[0]}.`;
                break;
            }
            case 'health': {
                const serviceRequested = faker.helpers.arrayElement(['Consulta General', 'Examen de Sangre', 'Radiografía', 'Control Dental']);
                conversation.contact.name = "Paciente: " + conversation.contact.name;
                conversation.customFields = {
                    patientId: `P${instance.id}-${faker.datatype.number({min: 1000, max: 9999})}`,
                    serviceRequested: serviceRequested,
                    appointmentDate: faker.date.future(30).toISOString(),
                };
                conversation.lastMessage = `Hola, necesito confirmar mi cita para ${serviceRequested}.`;
                break;
            }
            case 'municipality': {
                 const department = faker.helpers.arrayElement(['Vialidad', 'Cultura', 'Seguridad', 'Obras Públicas']);
                 const caseId = `MUN${instance.id}-${faker.datatype.number({min: 1000, max: 9999})}`;
                 conversation.contact.name = "Ciudadano: " + conversation.contact.name;
                 conversation.customFields = {
                    caseId: caseId,
                    department: department,
                    address: faker.address.streetAddress(),
                };
                conversation.lastMessage = `Reporte N° ${caseId} sobre un problema de ${department}.`;
                break;
            }
        }
        generateMessages(instance.id, conversation.id, conversation.contact);
        return conversation;
    });
    conversationsByInstance[instance.id] = conversations;
    
    generateTasks(instance, conversations, agents);

    return conversations;
};

const generateMessages = (instanceId: number, conversationId: number, contact: Conversation['contact']): Message[] => {
    if(messagesByConversation[conversationId]) return messagesByConversation[conversationId];

    faker.seed(instanceId * 400 + conversationId);
    const agentsForInstance = generateAgents(instanceId);
    const messages = Array.from({ length: 12 }, (_, i): Message => {
        const isAgent = faker.datatype.boolean();
        return {
            id: 300 + i,
            content: faker.lorem.sentence(),
            createdAt: faker.date.recent(1).toISOString(),
            sender: {
                type: isAgent ? 'agent' : 'user',
                name: isAgent ? faker.helpers.arrayElement(agentsForInstance).name : contact.name,
                avatarUrl: isAgent ? `https://i.pravatar.cc/150?u=agent${instanceId}-${faker.datatype.number({min: 1, max: 8})}` : contact.avatarUrl,
            },
        };
    }).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    messagesByConversation[conversationId] = messages;
    return messages;
};

const generateRandomKpis = (id: number): Kpis => {
    faker.seed(id * 100);
    return {
        firstResponseTime: faker.datatype.number({ min: 5, max: 25, precision: 0.1 }),
        resolutionRate: faker.datatype.number({ min: 75, max: 98, precision: 0.1 }),
        avgResolutionTime: faker.datatype.number({ min: 30, max: 90, precision: 0.1 }),
        csat: faker.datatype.number({ min: 80, max: 99, precision: 0.1 }),
        agentUtilization: faker.datatype.number({ min: 60, max: 95, precision: 0.1 }),
        messageVolume: faker.datatype.number({ min: 500, max: 2000 }),
        conversationVolume: faker.datatype.number({ min: 150, max: 500 }),
    };
};

const generateTimeSeriesData = (days: number, id: number): TimeSeriesData[] => {
    faker.seed(id * 500);
    const data: TimeSeriesData[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            value: faker.datatype.number({ min: 100, max: 400 }),
        });
    }
    return data;
};

// --- Exported API Functions ---

export const login = (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    const user = users.find(u => u.email === email);
    if (user && password === 'password') { // Simple password check for demo
        return mockApiCall({ user, error: null });
    }
    return mockApiCall({ user: null, error: 'Credenciales inválidas' });
};

// --- Instance Management (CRUD) ---
export const getInstances = (): Promise<Instance[]> => mockApiCall(instances);

export const createInstance = (newInstanceData: Omit<Instance, 'id'>): Promise<Instance> => {
    const newInstance: Instance = {
        id: Math.max(...instances.map(i => i.id), 0) + 1,
        ...newInstanceData,
    };
    instances.push(newInstance);
    return mockApiCall(newInstance);
};

export const updateInstance = (updatedInstance: Instance): Promise<Instance> => {
    const index = instances.findIndex(i => i.id === updatedInstance.id);
    if (index !== -1) {
        instances[index] = updatedInstance;
        return mockApiCall(updatedInstance);
    }
    return Promise.reject(new Error('Instancia no encontrada para actualizar.'));
};

export const deleteInstance = (instanceId: number): Promise<{ success: boolean }> => {
    const index = instances.findIndex(i => i.id === instanceId);
    if (index !== -1) {
        instances.splice(index, 1);
        delete conversationsByInstance[instanceId];
        return mockApiCall({ success: true });
    }
    return Promise.reject(new Error('Instancia no encontrada para eliminar.'));
};


export const getKpis = async (selectedInstance: Instance | { id: 'all' }): Promise<Kpis> => {
    if (selectedInstance.id === 'all') {
        const allKpis = instances.map(inst => generateRandomKpis(inst.id));
        return mockApiCall({
            firstResponseTime: parseFloat((allKpis.reduce((sum, k) => sum + k.firstResponseTime, 0) / allKpis.length).toFixed(1)),
            resolutionRate: parseFloat((allKpis.reduce((sum, k) => sum + k.resolutionRate, 0) / allKpis.length).toFixed(1)),
            avgResolutionTime: parseFloat((allKpis.reduce((sum, k) => sum + k.avgResolutionTime, 0) / allKpis.length).toFixed(1)),
            csat: parseFloat((allKpis.reduce((sum, k) => sum + k.csat, 0) / allKpis.length).toFixed(1)),
            agentUtilization: parseFloat((allKpis.reduce((sum, k) => sum + k.agentUtilization, 0) / allKpis.length).toFixed(1)),
            messageVolume: allKpis.reduce((sum, k) => sum + k.messageVolume, 0),
            conversationVolume: allKpis.reduce((sum, k) => sum + k.conversationVolume, 0),
        });
    }
    await checkAuth(selectedInstance as Instance);
    return mockApiCall(generateRandomKpis(selectedInstance.id));
};

export const getAnomalies = async (selectedInstance: Instance | { id: 'all' }): Promise<Anomaly[]> => {
    if (selectedInstance.id !== 'all') await checkAuth(selectedInstance as Instance);
    faker.seed(selectedInstance.id === 'all' ? 999 : selectedInstance.id * 600);
    return mockApiCall([
        { id: 1, metricAffected: 'Tiempo de Primera Respuesta', severity: 'alta', expectedValue: 15, actualValue: faker.datatype.number({min: 40, max: 60}), detectedAt: faker.date.recent(1).toISOString(), anomalyType: 'spike' },
        { id: 2, metricAffected: 'CSAT', severity: 'crítica', expectedValue: 92, actualValue: faker.datatype.number({min: 70, max: 80}), detectedAt: faker.date.recent(1).toISOString(), anomalyType: 'drop' },
        { id: 3, metricAffected: 'Tasa de Resolución', severity: 'media', expectedValue: 85, actualValue: faker.datatype.number({min: 75, max: 82}), detectedAt: faker.date.recent(2).toISOString(), anomalyType: 'drop' },
    ]);
};

export const getHealthStatus = async (selectedInstance: Instance | { id: 'all' }): Promise<HealthCheck[]> => {
    if (selectedInstance.id !== 'all') await checkAuth(selectedInstance as Instance);
    return mockApiCall([
        { checkType: 'API', status: 'saludable', details: '200 OK | 120ms' },
        { checkType: 'Base de Datos', status: 'saludable', details: 'Conectado | 45ms latencia' },
        { checkType: 'Espacio en Disco', status: 'advertencia', details: '85% usado' },
    ]);
};

export const getConversationVolume = async (selectedInstance: Instance | { id: 'all' }, period: '7d' | '30d' = '30d'): Promise<TimeSeriesData[]> => {
    const days = period === '7d' ? 7 : 30;
    const baseId = selectedInstance.id === 'all' ? 10 : selectedInstance.id;
    if (selectedInstance.id !== 'all') await checkAuth(selectedInstance as Instance);
    return mockApiCall(generateTimeSeriesData(days, baseId));
};

export const getSentimentData = async (selectedInstance: Instance | { id: 'all' }): Promise<SentimentData> => {
    if (selectedInstance.id !== 'all') await checkAuth(selectedInstance as Instance);
    faker.seed(selectedInstance.id === 'all' ? 999 : selectedInstance.id * 700);
    const positive = faker.datatype.number({ min: 60, max: 85, precision: 0.1});
    const neutral = faker.datatype.number({ min: 5, max: 15, precision: 0.1 });
    const negative = 100 - positive - neutral;
    return mockApiCall({
        positive: parseFloat(positive.toFixed(1)),
        neutral: parseFloat(neutral.toFixed(1)),
        negative: parseFloat(negative.toFixed(1))
    });
};

export const getConversations = async (instance: Instance): Promise<Conversation[]> => {
    await checkAuth(instance);
    return mockApiCall(generateConversations(instance), 800);
}

export const getMessagesForConversation = async (conversationId: number, instance: Instance): Promise<Message[]> => {
    await checkAuth(instance);
    return mockApiCall(messagesByConversation[conversationId] || []);
}

export const getAgents = async (instance: Instance): Promise<Agent[]> => {
    await checkAuth(instance);
    return mockApiCall(generateAgents(instance.id), 800);
}

export const updateAgentStatus = async (agentId: number, isActive: boolean, instance: Instance): Promise<Agent> => {
    await checkAuth(instance);
    const agentsForInstance = generateAgents(instance.id);
    const agentToUpdate = agentsForInstance.find(a => a.id === agentId);
     if (agentToUpdate) {
        agentToUpdate.isActive = isActive;
        return mockApiCall(agentToUpdate, 200);
    }
    return Promise.reject('Agente no encontrado');
}

// --- Paquete 1: Nuevas funciones ---
export const updateConversationStage = async (conversationId: number, newStageId: string, instance: Instance): Promise<Conversation> => {
    await checkAuth(instance);
    const instanceConversations = conversationsByInstance[instance.id] || [];
    const convIndex = instanceConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
        conversationsByInstance[instance.id][convIndex].pipelineStage = newStageId;
        conversationsByInstance[instance.id][convIndex].lastActivityAt = new Date().toISOString();
        return mockApiCall(conversationsByInstance[instance.id][convIndex], 100);
    }
    return Promise.reject('Conversación no encontrada');
};

export const addTagToConversation = async (conversationId: number, tag: string, instance: Instance): Promise<Conversation> => {
    await checkAuth(instance);
    const instanceConversations = conversationsByInstance[instance.id] || [];
    const convIndex = instanceConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
        const currentTags = conversationsByInstance[instance.id][convIndex].tags;
        if (!currentTags.includes(tag)) {
            conversationsByInstance[instance.id][convIndex].tags.push(tag);
        }
        return mockApiCall(conversationsByInstance[instance.id][convIndex], 100);
    }
    return Promise.reject('Conversación no encontrada');
};

export const removeTagFromConversation = async (conversationId: number, tagToRemove: string, instance: Instance): Promise<Conversation> => {
    await checkAuth(instance);
    const instanceConversations = conversationsByInstance[instance.id] || [];
    const convIndex = instanceConversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
        conversationsByInstance[instance.id][convIndex].tags = conversationsByInstance[instance.id][convIndex].tags.filter(tag => tag !== tagToRemove);
        return mockApiCall(conversationsByInstance[instance.id][convIndex], 100);
    }
    return Promise.reject('Conversación no encontrada');
}

// --- Paquete 2: Nuevas funciones ---
export const getAllTasks = async (instance: Instance): Promise<Task[]> => {
    await checkAuth(instance);
    generateConversations(instance);
    return mockApiCall(tasksByInstance[instance.id] || [], 600);
};

export const getTasksForConversation = async (conversationId: number, instance: Instance): Promise<Task[]> => {
    await checkAuth(instance);
    generateConversations(instance); 
    const allTasks = tasksByInstance[instance.id] || [];
    return mockApiCall(allTasks.filter(t => t.conversationId === conversationId));
};

export const createTask = async (taskData: Omit<Task, 'id'>, instance: Instance): Promise<Task> => {
    await checkAuth(instance);
    const allTasks = tasksByInstance[instance.id] || [];
    const newTask: Task = {
        id: Math.max(0, ...allTasks.map(t => t.id)) + 1,
        ...taskData
    };
    allTasks.push(newTask);
    tasksByInstance[instance.id] = allTasks;
    return mockApiCall(newTask, 300);
};

export const updateTask = async (taskId: number, updates: Partial<Pick<Task, 'isCompleted'>>, instance: Instance): Promise<Task> => {
    await checkAuth(instance);
    const allTasks = tasksByInstance[instance.id] || [];
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const originalTask = allTasks[taskIndex];
        const updatedTask = { ...originalTask, ...updates };
        allTasks[taskIndex] = updatedTask;

        // Handle recurrence
        if (updatedTask.isCompleted && originalTask.recurrence) {
            const newDueDate = new Date(originalTask.dueDate);
            if (originalTask.recurrence === 'diaria') newDueDate.setDate(newDueDate.getDate() + 1);
            if (originalTask.recurrence === 'semanal') newDueDate.setDate(newDueDate.getDate() + 7);
            if (originalTask.recurrence === 'mensual') newDueDate.setMonth(newDueDate.getMonth() + 1);
            
            createTask({
                ...originalTask,
                dueDate: newDueDate.toISOString(),
                isCompleted: false,
            }, instance);
        }

        tasksByInstance[instance.id] = allTasks;
        return mockApiCall(updatedTask, 150);
    }
    return Promise.reject(new Error("Tarea no encontrada"));
};

export const deleteTask = async (taskId: number, instance: Instance): Promise<{ success: boolean }> => {
    await checkAuth(instance);
    let allTasks = tasksByInstance[instance.id] || [];
    const initialLength = allTasks.length;
    allTasks = allTasks.filter(t => t.id !== taskId);
    if(allTasks.length < initialLength) {
        tasksByInstance[instance.id] = allTasks;
        return mockApiCall({ success: true }, 150);
    }
    return Promise.reject(new Error("Tarea no encontrada para eliminar"));
}

// --- Pipeline Stage Management ---
export const getPipelineStages = async (industry: Industry = 'services'): Promise<PipelineStageConfig[]> => {
    const stages = INDUSTRY_CONFIGS[industry]?.pipelineStages || INDUSTRY_CONFIGS.services.pipelineStages;
    return mockApiCall(stages.sort((a,b) => a.order - b.order));
}

// NOTE: This global update might need to be refactored if stages become truly instance-specific in a real DB
export const updatePipelineStages = async (updatedStages: PipelineStageConfig[], industry: Industry): Promise<PipelineStageConfig[]> => {
    INDUSTRY_CONFIGS[industry].pipelineStages = updatedStages;
    return mockApiCall(updatedStages);
}


// --- Gemini AI Analysis Simulation ---
export const getAiAnalysis = async (instance: Instance): Promise<AiAnalysisReport> => {
    await checkAuth(instance);
    if (!instance.aiApiKey) {
        return Promise.reject(new Error('API Key de IA no configurada para esta instancia.'));
    }
    
    faker.seed(instance.id * 800);
    const totalConversations = faker.datatype.number({ min: 150, max: 500 });

    return mockApiCall({
        sentimentBreakdown: {
            positive: faker.datatype.number({ min: 70, max: 85, precision: 0.1 }),
            neutral: faker.datatype.number({ min: 10, max: 20, precision: 0.1 }),
            negative: faker.datatype.number({ min: 5, max: 10, precision: 0.1 }),
        },
        mainTopics: [
            { topic: 'Problemas de Facturación', percentage: faker.datatype.number({ min: 30, max: 40 }) },
            { topic: 'Consultas de Envío', percentage: faker.datatype.number({ min: 20, max: 30 }) },
            { topic: 'Soporte Técnico', percentage: faker.datatype.number({ min: 15, max: 25 }) },
            { topic: 'Devoluciones', percentage: faker.datatype.number({ min: 10, max: 15 }) },
            { topic: 'Otros', percentage: 5 },
        ].sort((a,b) => b.percentage - a.percentage),
        frequentlyAskedQuestions: [
            { question: '¿Cuál es el estado de mi pedido?', answer: 'Puede verificar el estado de su pedido en la sección "Mis Pedidos" de su cuenta.', count: faker.datatype.number({min: 20, max: 50}) },
            { question: '¿Cómo puedo devolver un producto?', answer: 'Inicie sesión en su cuenta, vaya a "Historial de Pedidos" y seleccione la opción de devolución.', count: faker.datatype.number({min: 15, max: 30}) },
            { question: '¿Aceptan pagos con tarjeta de crédito?', answer: 'Sí, aceptamos Visa, MasterCard y American Express.', count: faker.datatype.number({min: 5, max: 20}) },
        ],
        intentClassification: [
            { intent: 'Soporte Técnico', percentage: 45, count: Math.round(totalConversations * 0.45) },
            { intent: 'Consulta de Ventas', percentage: 30, count: Math.round(totalConversations * 0.30) },
            { intent: 'Facturación', percentage: 15, count: Math.round(totalConversations * 0.15) },
            { intent: 'Feedback de Producto', percentage: 10, count: Math.round(totalConversations * 0.10) },
        ].sort((a,b) => b.percentage - a.percentage),
        predictiveInsights: [
            { title: "Tendencia de Soporte", insight: `Se prevé un aumento del ${faker.datatype.number({min: 10, max: 20})}% en tickets de soporte técnico la próxima semana.`, icon: 'trendingUp' },
            { title: "Oportunidad de Venta", insight: `Los clientes que preguntan por 'integraciones' tienen un ${faker.datatype.number({min: 60, max: 80})}% de probabilidad de conversión.`, icon: 'dollarSign' },
            { title: "Necesidad de Personal", insight: `La carga de trabajo sugiere la necesidad de ${faker.datatype.number({min: 1, max: 2})} agente(s) adicional(es) en el turno de tarde.`, icon: 'users' }
        ],
        summary: `El sentimiento general para ${instance.name} es mayormente positivo. Los problemas de facturación son el tema más común, lo que sugiere una posible área de mejora en el proceso de pago o en la claridad de las facturas. La pregunta más frecuente se refiere al estado de los pedidos, indicando una oportunidad para mejorar las notificaciones proactivas de envío.`
    }, 1500);
};

// --- START: Contact Management ---
const generateContacts = (instanceId: number): Contact[] => {
    if (contactsByInstance[instanceId]) return contactsByInstance[instanceId];

    const instanceConversations = conversationsByInstance[instanceId] || [];
    const uniqueContacts: Record<number, Contact> = {};

    instanceConversations.forEach(conv => {
        const contactId = conv.contact.id;
        if (!uniqueContacts[contactId]) {
            uniqueContacts[contactId] = {
                id: contactId,
                name: conv.contact.name.replace(/^(Comprador: |Paciente: |Ciudadano: )/, ''),
                avatarUrl: conv.contact.avatarUrl,
                tags: [],
                interestedPropertyIds: [],
                medicalHistoryIds: [],
                associatedServiceIds: [],
                municipalCaseIds: [],
            };
        }
        // Merge tags, avoiding duplicates
        conv.tags.forEach(tag => {
            if (!uniqueContacts[contactId].tags.includes(tag)) {
                uniqueContacts[contactId].tags.push(tag);
            }
        });
    });

    const result = Object.values(uniqueContacts);
    contactsByInstance[instanceId] = result;
    return result;
};

export const getContacts = async (instance: Instance): Promise<Contact[]> => {
    await checkAuth(instance);
    generateConversations(instance);
    return mockApiCall(generateContacts(instance.id));
};

export const updateContact = async (contactId: number, updates: Partial<Contact>, instance: Instance): Promise<Contact> => {
    await checkAuth(instance);
    const instanceContacts = contactsByInstance[instance.id] || [];
    const contactIndex = instanceContacts.findIndex(c => c.id === contactId);
    if (contactIndex > -1) {
        const updatedContact = { ...instanceContacts[contactIndex], ...updates };
        contactsByInstance[instance.id][contactIndex] = updatedContact;
        return mockApiCall(updatedContact, 150);
    }
    return Promise.reject(new Error("Contacto no encontrado"));
};

export const getProperties = async (instance: Instance): Promise<Property[]> => {
    await checkAuth(instance);
    return mockApiCall(generateProperties(instance.id));
}

let medicalServicesByInstance: Record<number, MedicalService[]> = {};
export const getMedicalServices = async (instance: Instance): Promise<MedicalService[]> => {
    await checkAuth(instance);
    if(medicalServicesByInstance[instance.id]) return mockApiCall(medicalServicesByInstance[instance.id]);
    
    const services: MedicalService[] = [
        { id: 'ms_1', name: 'Consulta General', description: 'Revisión médica general.'},
        { id: 'ms_2', name: 'Examen de Sangre', description: 'Análisis de sangre completo.'},
        { id: 'ms_3', name: 'Radiografía de Tórax', description: 'Imagen de rayos X del tórax.'},
        { id: 'ms_4', name: 'Control Dental', description: 'Limpieza y revisión dental.'},
        { id: 'ms_5', name: 'Consulta Pediátrica', description: 'Atención médica para niños.'},
    ];
    medicalServicesByInstance[instance.id] = services;
    return mockApiCall(services);
};
// --- END: Contact Management ---

// --- START: Workspace API Functions ---
export const getTeams = async (instance: Instance): Promise<Team[]> => {
    await checkAuth(instance);
    return mockApiCall(generateTeams(instance.id));
};

export const getInboxes = async (instance: Instance): Promise<Inbox[]> => {
    await checkAuth(instance);
    return mockApiCall(generateInboxesAndFolders(instance.id));
};
// --- END: Workspace API Functions ---

// --- START: Internal functions for Webhook Simulation ---
export const _internalGetAllConversationsForInstance = (instanceId: number): Conversation[] => {
    return conversationsByInstance[instanceId] || [];
}

export const _internalGetAllContactsForInstance = (instanceId: number): Contact[] => {
    // Ensure contacts are generated if they haven't been
    if (!contactsByInstance[instanceId]) {
        generateContacts(instanceId);
    }
    return contactsByInstance[instanceId] || [];
}


export const _internalUpsertConversation = (instanceId: number, convData: Conversation) => {
    let convs = conversationsByInstance[instanceId] || [];
    const index = convs.findIndex(c => c.id === convData.id);
    if (index > -1) {
        convs[index] = { ...convs[index], ...convData };
    } else {
        convs.push(convData);
    }
    conversationsByInstance[instanceId] = convs;
}

export const _internalAddMessageToConversation = (instanceId: number, conversationId: number, message: Message) => {
    let messages = messagesByConversation[conversationId] || [];
    messages.push(message);
    messagesByConversation[conversationId] = messages;

    // Also update the conversation's last message
    let convs = conversationsByInstance[instanceId] || [];
    const convIndex = convs.findIndex(c => c.id === conversationId);
    if (convIndex > -1) {
        convs[convIndex].lastMessage = message.content;
        convs[convIndex].lastActivityAt = message.createdAt;
    }
}

export const _internalUpsertContact = (instanceId: number, contactData: Contact) => {
    let contacts = contactsByInstance[instanceId] || [];
    const index = contacts.findIndex(c => c.id === contactData.id);
    if (index > -1) {
        contacts[index] = { ...contacts[index], ...contactData };
    } else {
        contacts.push(contactData);
    }
    contactsByInstance[instanceId] = contacts;
}
// --- END: Internal functions for Webhook Simulation ---