import React from 'react';
import type { Conversation } from '../../types';
import { DollarSignIcon } from '../../components/icons';

interface KanbanCardProps {
  conversation: Conversation;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ conversation }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('conversationId', String(conversation.id));
  };
  
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-3 bg-slate-900 rounded-md border border-slate-700 cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold text-sm text-slate-200">{conversation.contact.name}</p>
      <p className="text-xs text-slate-400 mt-1">{conversation.lastMessage}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center">
            {conversation.dealValue && (
                <span className="flex items-center text-xs text-green-400 font-bold mr-2">
                    <DollarSignIcon className="w-3 h-3 mr-1" />
                    {conversation.dealValue.toLocaleString()}
                </span>
            )}
        </div>
        <img src={conversation.contact.avatarUrl} alt={conversation.contact.name} className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
};

export default KanbanCard;
