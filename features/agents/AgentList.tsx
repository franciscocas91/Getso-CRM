import React, { useState, useEffect } from 'react';
import type { Agent, Instance } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import { UsersIcon } from '../../components/icons';

interface AgentListProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
}

const AgentList: React.FC<AgentListProps> = ({ instance, apiService }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getAgents(instance)
      .then(setAgents)
      .catch(err => setError(err.message || "Failed to load agents"))
      .finally(() => setLoading(false));
  }, [instance, apiService]);

  const handleStatusChange = async (agentId: number, newStatus: boolean) => {
    // Optimistic update
    const originalAgents = agents;
    setAgents(prev => prev.map(agent => agent.id === agentId ? { ...agent, isActive: newStatus } : agent));
    try {
      await apiService.updateAgentStatus(agentId, newStatus, instance);
    } catch (err) {
      console.error('Failed to update agent status:', err);
      // Revert on failure
      setAgents(originalAgents);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading agents...</div>;
  if (error) return <div className="p-6 text-red-400 text-center">{error}</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><UsersIcon /> Agentes</h1>
      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-lg border border-slate-700/50">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} className="border-b border-slate-700/50 hover:bg-slate-800">
                <td className="px-6 py-4 font-medium text-slate-200 flex items-center">
                  <img src={agent.avatarUrl} alt={agent.name} className="w-8 h-8 rounded-full mr-3" />
                  {agent.name}
                </td>
                <td className="px-6 py-4">{agent.email}</td>
                <td className="px-6 py-4">
                  <label htmlFor={`status-${agent.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id={`status-${agent.id}`} 
                        className="sr-only" 
                        checked={agent.isActive}
                        onChange={(e) => handleStatusChange(agent.id, e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full ${agent.isActive ? 'bg-sky-500' : 'bg-slate-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${agent.isActive ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-slate-300">{agent.isActive ? 'Activo' : 'Inactivo'}</div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentList;
