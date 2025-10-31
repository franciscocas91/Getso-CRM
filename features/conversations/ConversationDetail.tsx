import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, Instance, Agent, PipelineStageConfig } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import { SendIcon, ChevronsLeftIcon, ChevronsRightIcon, MessageSquareIcon, LockIcon, ZapIcon, SmileIcon } from '../../components/icons';
import { appEvents } from '../../services/appEvents';

interface ConversationDetailProps {
  conversation: Conversation;
  instance: Instance;
  onUpdate: (updatedConversation: Conversation) => void;
  apiService: typeof mockApiService | typeof apiService;
}

const Tag: React.FC<{ children: React.ReactNode, onRemove?: () => void }> = ({ children, onRemove }) => (
    <span className="inline-flex items-center text-xs font-medium mr-1 mb-1 px-2 py-0.5 rounded-full bg-slate-600 text-slate-200">
        {children}
        {onRemove && (
            <button onClick={onRemove} className="ml-1.5 -mr-0.5 text-slate-400 hover:text-white">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </button>
        )}
    </span>
);

const cannedResponses = [
    "Hola, gracias por contactarnos. ¿En qué podemos ayudarte hoy?",
    "Entendido. Permíteme un momento mientras reviso la información.",
    "¿Podrías por favor proporcionar tu número de pedido o ID de cliente?",
    "Gracias por tu paciencia. Hemos escalado tu solicitud a nuestro equipo de soporte.",
    "¿Hay algo más en lo que pueda ayudarte?",
];

const emojis = ['👍', '😂', '❤️', '😊', '🙏', '🎉'];

const ConversationDetail: React.FC<ConversationDetailProps> = ({ conversation, instance, onUpdate, apiService }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [pipelineStages, setPipelineStages] = useState<PipelineStageConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [newTag, setNewTag] = useState('');
    const [isCrmSidebarCollapsed, setIsCrmSidebarCollapsed] = useState(false);
    const [messageType, setMessageType] = useState<'reply' | 'note'>('reply');
    const [showCannedResponses, setShowCannedResponses] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const cannedResponsesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const [messagesData, stagesData] = await Promise.all([
                    apiService.getMessagesForConversation(conversation.id, instance),
                    apiService.getPipelineStages(instance.industry)
                ]);
                setMessages(messagesData);
                setPipelineStages(stagesData);
            } catch (err: any) {
                console.error('Failed to fetch details', err);
                setError(err.message || `No se pudieron cargar los datos de la conversación.`);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [conversation.id, instance, apiService]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleNewMessage = (payload: { instanceId: number; conversationId: number; message: Message }) => {
            if (payload.instanceId === instance.id && payload.conversationId === conversation.id) {
                setMessages(prev => [...prev, payload.message]);
            }
        };
        return appEvents.on('webhook:message_created', handleNewMessage);
    }, [instance.id, conversation.id]);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cannedResponsesRef.current && !cannedResponsesRef.current.contains(event.target as Node)) {
                setShowCannedResponses(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim() === '') return;
        try {
            const updatedConv = await apiService.addTagToConversation(conversation.id, newTag, instance);
            onUpdate(updatedConv);
            setNewTag('');
        } catch (error) {
            console.error('Failed to add tag:', error);
        }
    }

    const handleRemoveTag = async (tagToRemove: string) => {
        try {
            const updatedConv = await apiService.removeTagFromConversation(conversation.id, tagToRemove, instance);
            onUpdate(updatedConv);
        } catch (error) {
            console.error('Failed to remove tag:', error);
        }
    }
    
    const handlePipelineChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStageId = e.target.value;
        try {
            const updatedConv = await apiService.updateConversationStage(conversation.id, newStageId, instance);
            onUpdate(updatedConv);
        } catch (error) {
            console.error('Failed to update pipeline stage:', error);
        }
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const sentMessage: Message = {
            id: Date.now(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: {
                type: 'agent',
                name: 'Tú', // This would come from the logged-in user context
                avatarUrl: `https://i.pravatar.cc/150?u=currentuser`,
            },
            isInternal: messageType === 'note',
        };
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        // In a real app, you'd call an apiService.sendMessage(...) here
    }
    
    if (loading) return <div className="flex items-center justify-center h-full">Cargando conversación...</div>;
    if (error) return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;

    return (
        <div className="flex h-full">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-800/50 relative">
                <button 
                    onClick={() => setIsCrmSidebarCollapsed(!isCrmSidebarCollapsed)}
                    className="absolute top-2 right-2 z-20 p-1.5 bg-slate-700/50 text-slate-300 hover:bg-slate-600 rounded-full"
                    title={isCrmSidebarCollapsed ? "Mostrar detalles" : "Ocultar detalles"}
                >
                    {isCrmSidebarCollapsed ? <ChevronsLeftIcon className="w-5 h-5" /> : <ChevronsRightIcon className="w-5 h-5" />}
                </button>
                <div className="flex items-center p-3 border-b border-slate-700">
                    <img src={conversation.contact.avatarUrl} alt={conversation.contact.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <h2 className="text-lg font-bold text-white">{conversation.contact.name}</h2>
                        <p className="text-xs text-slate-400">ID Conversación: {conversation.id}</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map(message => (
                        message.isInternal ? (
                            <div key={message.id} className="flex justify-center">
                                <div className="max-w-md w-full bg-yellow-900/40 text-yellow-300 text-xs px-4 py-2 rounded-lg border border-yellow-700/30">
                                    <p className="font-bold mb-1 flex items-center gap-2"><LockIcon /> Nota Interna de {message.sender.name}</p>
                                    <p className="text-sm text-yellow-200 whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ) : (
                            <div key={message.id} className={`flex items-end gap-3 ${message.sender.type === 'agent' ? 'flex-row-reverse' : ''}`}>
                                <img src={message.sender.avatarUrl} className="w-8 h-8 rounded-full" alt={message.sender.name} />
                                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                                    message.sender.type === 'agent' 
                                    ? 'bg-sky-600 text-white rounded-br-none' 
                                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                                }`}>
                                    <p className="text-sm">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        )
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-3 border-t border-slate-700 bg-slate-900/80">
                    <div className={`transition-all duration-200 ease-in-out ${messageType === 'note' ? 'bg-yellow-500/10 rounded-md p-2' : ''}`}>
                        <form onSubmit={handleSendMessage}>
                             <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={messageType === 'reply' ? "Escribe una respuesta pública..." : "Escribe una nota interna (solo visible para el equipo)..."}
                                className="block w-full bg-transparent text-white text-sm focus:outline-none resize-none"
                                rows={2}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="relative" ref={cannedResponsesRef}>
                                        <button type="button" onClick={() => setShowCannedResponses(!showCannedResponses)} title="Respuestas rápidas" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                                            <ZapIcon className="w-4 h-4" />
                                        </button>
                                        {showCannedResponses && (
                                            <div className="absolute bottom-full right-0 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 text-left">
                                                <ul className="max-h-48 overflow-y-auto">
                                                    {cannedResponses.map((resp, i) => (
                                                        <li key={i}>
                                                            <button 
                                                                type="button"
                                                                onClick={() => {
                                                                    setNewMessage(prev => prev ? `${prev} ${resp}` : resp);
                                                                    setShowCannedResponses(false);
                                                                }}
                                                                className="w-full text-left text-sm text-slate-300 px-3 py-2 hover:bg-slate-700">
                                                                {resp}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative group">
                                         <button type="button" title="Emojis" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors">
                                            <SmileIcon className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-full mb-2 hidden group-hover:flex bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 p-1 gap-1">
                                            {emojis.map(emoji => (
                                                <button key={emoji} type="button" onClick={() => setNewMessage(prev => prev + emoji)} className="text-xl p-1 rounded-md hover:bg-slate-700">{emoji}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="p-2.5 bg-sky-600 text-white rounded-full hover:bg-sky-700 transition-colors disabled:opacity-50" disabled={!newMessage.trim()}>
                                    <SendIcon />
                                </button>
                            </div>
                        </form>
                    </div>
                     <div className="flex border-t border-slate-800 mt-2 pt-2">
                        <button onClick={() => setMessageType('reply')} className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-l-md ${messageType === 'reply' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <MessageSquareIcon /> Responder
                        </button>
                        <button onClick={() => setMessageType('note')} className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-r-md ${messageType === 'note' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            <LockIcon /> Nota Interna
                        </button>
                    </div>
                </div>
            </div>

            {/* CRM Sidebar */}
            <div className={`transition-all duration-300 ease-in-out bg-slate-900 border-l border-slate-700 overflow-hidden ${isCrmSidebarCollapsed ? 'w-0' : 'w-80'}`}>
                <div className="p-4 flex flex-col space-y-6 h-full overflow-y-auto">
                     <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Etiquetas</h3>
                        <div className="flex flex-wrap">
                            {conversation.tags.map(tag => (
                                <Tag key={tag} onRemove={() => handleRemoveTag(tag)}>{tag}</Tag>
                            ))}
                        </div>
                        <form onSubmit={handleAddTag} className="flex gap-1 mt-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="Añadir etiqueta..."
                                className="block w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                            <button type="submit" className="px-2.5 bg-slate-600 text-white text-sm rounded-md hover:bg-slate-500 transition-colors">+</button>
                        </form>
                    </div>
                    
                     <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Etapa del Pipeline</h3>
                         <select 
                            value={conversation.pipelineStage} 
                            onChange={handlePipelineChange}
                            className="block w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        >
                            {pipelineStages.map(stage => (
                                <option key={stage.id} value={stage.id}>{stage.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Placeholder for more CRM details */}
                    <div className="border-t border-slate-700 pt-4">
                         <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Detalles del Contacto</h3>
                         <p className="text-sm text-slate-300">Próximamente más detalles del contacto y acciones rápidas aquí.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationDetail;