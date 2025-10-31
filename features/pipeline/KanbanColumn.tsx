import React from 'react';
import type { Conversation, PipelineStageConfig } from '../../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  stage: PipelineStageConfig;
  conversations: Conversation[];
  onDrop: (conversationId: number, newStageId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, conversations, onDrop }) => {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const conversationId = Number(e.dataTransfer.getData('conversationId'));
    onDrop(conversationId, stage.id);
  };

  const totalValue = conversations.reduce((sum, conv) => sum + (conv.dealValue || 0), 0);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-80 flex-shrink-0 bg-slate-800/70 rounded-lg flex flex-col transition-colors ${isOver ? 'bg-slate-700' : ''}`}
    >
      <div className="p-3 border-b border-slate-700">
        <h3 className="font-semibold text-white">{stage.name} <span className="text-sm font-normal text-slate-400">{conversations.length}</span></h3>
        <p className="text-xs text-slate-400">${totalValue.toLocaleString()} | Prob: {stage.probability}%</p>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {conversations.map(conv => (
          <KanbanCard key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
