import React, { useState, useEffect } from 'react';
import type { Task, Instance, Agent } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import TaskItem from './TaskItem';
import { PlusIcon, TasksIcon } from '../../components/icons';

interface TasksPageProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
}

const TasksPage: React.FC<TasksPageProps> = ({ instance, apiService }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksData, agentsData] = await Promise.all([
          apiService.getAllTasks(instance),
          apiService.getAgents(instance),
        ]);
        setTasks(tasksData);
        setAgents(agentsData);
      } catch (err: any) {
        setError(err.message || "Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [instance, apiService]);

  const handleUpdateTask = async (taskId: number, updates: Partial<Pick<Task, 'isCompleted'>>) => {
    try {
      const updatedTask = await apiService.updateTask(taskId, updates, instance);
      if (updatedTask.isCompleted && updatedTask.recurrence) {
         const tasksData = await apiService.getAllTasks(instance);
         setTasks(tasksData);
      } else {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
        await apiService.deleteTask(taskId, instance);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
        console.error("Failed to delete task", err);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading tasks...</div>;
  if (error) return <div className="p-6 text-red-400 text-center">{error}</div>;

  const pendingTasks = tasks.filter(t => !t.isCompleted).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><TasksIcon /> Tareas</h1>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-sky-600 text-white hover:bg-sky-700">
            <PlusIcon className="w-4 h-4"/>
            Nueva Tarea
        </button>
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
        <h2 className="text-lg font-semibold text-white mb-2">Tareas Pendientes ({pendingTasks.length})</h2>
        <div className="space-y-2">
          {pendingTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              agentName={agents.find(a => a.id === task.assignedAgentId)?.name || 'Sin asignar'}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ))}
          {pendingTasks.length === 0 && <p className="text-slate-500 text-center py-4">¡No hay tareas pendientes!</p>}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
