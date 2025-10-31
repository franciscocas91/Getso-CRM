import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Conversation, Instance, User, Message } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import InstanceSidebar from './InstanceSidebar';
import ConversationDetail from '../conversations/ConversationDetail';
import { appEvents } from '../../services/appEvents';

// A simplified Conversation List for the workspace
const WorkspaceConversationList: React.FC<{
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelect: (conv: Conversation) => void;
}> = ({ conversations, selectedConversationId, onSelect }) => {
    
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m`;
        return `ahora`;
    };

    if (conversations.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>No hay conversaciones en esta carpeta.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full overflow-y-auto">
            {conversations.map(conv => (
                <button
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    className={`w-full text-left p-3 flex items-center gap-3 border-b border-l-4 transition-colors duration-200 ${
                        selectedConversationId === conv.id
                        ? 'bg-slate-700/50 border-sky-500'
                        : 'border-transparent hover:bg-slate-800/50'
                    }`}
                >
                    <img src={conv.contact.avatarUrl} alt={conv.contact.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm text-slate-200 truncate">{conv.contact.name}</p>
                            <p className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.lastActivityAt)}</p>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};


interface InstanceWorkspaceProps {
  instance: Instance;
  user: User;
  apiService: typeof mockApiService | typeof apiService;
}

type Selection = { type: 'folder'; inboxId: number; folderId: number } | { type: 'team'; teamId: number } | null;

const InstanceWorkspace: React.FC<InstanceWorkspaceProps> = ({ instance, user, apiService }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selection, setSelection] = useState<Selection>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Real-time update handler
  const handleConversationUpdateFromWebhook = useCallback((payload: { instanceId: number, conversationId: number, lastMessage: string, lastActivityAt: string }) => {
    if (payload.instanceId !== instance.id) return;

    setConversations(prevConvs => {
      const convIndex = prevConvs.findIndex(c => c.id === payload.conversationId);
      // If conversation not found, we could fetch it, but for now we just update existing ones.
      if (convIndex === -1) return prevConvs;

      const updatedConv = {
        ...prevConvs[convIndex],
        lastMessage: payload.lastMessage,
        lastActivityAt: payload.lastActivityAt,
      };
      
      // Move the updated conversation to the top of the list
      const newConvs = [...prevConvs];
      newConvs.splice(convIndex, 1);
      newConvs.unshift(updatedConv);

      return newConvs;
    });

  }, [instance.id]);

  useEffect(() => {
    apiService.getConversations(instance)
      .then(setConversations)
      .catch(err => setError(err.message || "Error al cargar conversaciones."))
      .finally(() => setLoading(false));
  }, [instance, apiService]);
  
  useEffect(() => {
    const handleNewMessage = (payload: { instanceId: number, conversationId: number, message: Message }) => {
        handleConversationUpdateFromWebhook({
            instanceId: payload.instanceId,
            conversationId: payload.conversationId,
            lastMessage: payload.message.content,
            lastActivityAt: payload.message.createdAt,
        });
    };
    
    const unsubscribe = appEvents.on('webhook:message_created', handleNewMessage);
    return unsubscribe;
  }, [handleConversationUpdateFromWebhook]);

  const handleSelectionChange = (newSelection: Selection) => {
    setSelection(newSelection);
    setSelectedConversation(null); // Deselect conversation when changing folder
  };

  const filteredConversations = useMemo(() => {
    if (!selection || selection.type !== 'folder') return [];
    return conversations
        .filter(c => c.inboxId === selection.inboxId && c.folderId === selection.folderId)
        .sort((a,b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  }, [conversations, selection]);

  const handleConversationUpdate = (updatedConv: Conversation) => {
    setSelectedConversation(updatedConv);
    setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));
  };
  
  const renderContent = () => {
    if (loading) {
        return <div className="flex items-center justify-center h-full text-slate-400">Cargando conversaciones...</div>;
    }
    
    if (error) {
        return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;
    }
      
    if (!selection) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>Selecciona una bandeja o carpeta para comenzar.</p>
            </div>
        );
    }
    
    if (selection.type === 'team') {
        // Placeholder for Team Management view
        return <div className="p-4">Team Management for team {selection.teamId}</div>;
    }

    if (selection.type === 'folder') {
      return (
          <WorkspaceConversationList 
            conversations={filteredConversations}
            selectedConversationId={selectedConversation?.id || null}
            onSelect={setSelectedConversation}
          />
      );
    }
    
    return null;
  };

  return (
    <div className="flex h-screen">
      <InstanceSidebar 
        instance={instance} 
        apiService={apiService} 
        onSelectionChange={handleSelectionChange}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(prev => !prev)} 
      />
      
      {/* Conversation List Panel */}
      <div className="w-1/3 max-w-sm border-r border-slate-800 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800">
              <input type="search" placeholder="Buscar en conversaciones..." className="w-full bg-slate-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <div className="flex-1 overflow-y-auto">
             {renderContent()}
          </div>
      </div>
      
      {/* Conversation Detail Panel */}
      <div className="flex-1">
        {selectedConversation ? (
          <ConversationDetail 
            key={selectedConversation.id}
            conversation={selectedConversation}
            instance={instance}
            onUpdate={handleConversationUpdate}
            apiService={apiService}
          />
        ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>Selecciona una conversación para verla aquí.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InstanceWorkspace;