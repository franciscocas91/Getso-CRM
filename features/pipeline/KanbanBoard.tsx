import React, { useState, useEffect } from 'react';
import type { Conversation, Instance, PipelineStageConfig } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ instance, apiService }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stages, setStages] = useState<PipelineStageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [convData, stagesData] = await Promise.all([
          apiService.getConversations(instance),
          apiService.getPipelineStages(instance.industry),
        ]);
        setConversations(convData);
        setStages(stagesData);
      } catch (err: any) {
        setError(err.message || "Failed to load pipeline data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [instance, apiService]);

  const handleDrop = async (conversationId: number, newStageId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.pipelineStage === newStageId) return;

    // Optimistic update
    const originalConversations = conversations;
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, pipelineStage: newStageId } : c));

    try {
      await apiService.updateConversationStage(conversationId, newStageId, instance);
    } catch (err) {
      console.error("Failed to update stage:", err);
      // Revert on error
      setConversations(originalConversations);
      alert("Could not update conversation stage. Please try again.");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading Kanban Board...</div>;
  if (error) return <div className="p-6 text-red-400 text-center">{error}</div>;

  return (
    <div className="flex h-full p-4 space-x-4 overflow-x-auto">
      {stages.map(stage => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          conversations={conversations.filter(c => c.pipelineStage === stage.id)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
