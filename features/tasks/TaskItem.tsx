import React from 'react';
import type { Task, TaskPriority } from '../../types';
import { CalendarIcon, PhoneIcon, MailIcon, RepeatIcon, TrashIcon, TasksIcon } from '../../components/icons';

interface TaskItemProps {
  task: Task;
  agentName: string;
  onUpdate: (taskId: number, updates: Partial<Pick<Task, 'isCompleted'>>) => void;
  onDelete: (taskId: number) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  'Baja': 'border-sky-500',
  'Media': 'border-yellow-500',
  'Alta': 'border-red-500',
};

const TaskItem: React.FC<TaskItemProps> = ({ task, agentName, onUpdate, onDelete }) => {
    
  const getTaskIcon = (type: string) => {
    if (type.toLowerCase().includes('llamada')) return <PhoneIcon />;
    if (type.toLowerCase().includes('reunión')) return <CalendarIcon />;
    if (type.toLowerCase().includes('email')) return <MailIcon />;
    return <TasksIcon className="w-4 h-4" />;
  };

  return (
    <div className={`p-3 bg-slate-800 rounded-md border-l-4 flex items-center gap-4 ${priorityStyles[task.priority]}`}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={(e) => onUpdate(task.id, { isCompleted: e.target.checked })}
        className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-600"
      />
      <div className="flex-1">
        <p className="text-slate-200">{task.content}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">{getTaskIcon(task.type)} {task.type}</span>
            <span>Para: {task.contactName}</span>
            <span>Agente: {agentName}</span>
            <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3"/> {new Date(task.dueDate).toLocaleDateString()}</span>
            {/* FIX: The `title` prop is not valid on the SVG component. Wrapped it in a `span` with a `title` attribute for the tooltip. */}
            {task.recurrence && <span title={`Recurrente: ${task.recurrence}`}><RepeatIcon /></span>}
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TaskItem;