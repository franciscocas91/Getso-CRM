
import React, { useState, useEffect } from 'react';
import { Instance, User } from '../types';
import * as apiService from '../services/apiService';
import Sidebar from '../components/Sidebar';
import SettingsPage from './SettingsPage';
import InstanceWorkspace from '../features/workspace/InstanceWorkspace';
import SummaryView from '../features/summary/SummaryView';
import ContactsPage from '../features/contacts/ContactsPage';
import KanbanBoard from '../features/pipeline/KanbanBoard';
import TasksPage from '../features/tasks/TasksPage';
import AgentList from '../features/agents/AgentList';
import AiAnalysisPage from '../features/ai/AiAnalysisPage';
import {
  BriefcaseIcon,
  DashboardIcon,
  PipelineIcon,
  TasksIcon,
  UsersIcon as AgentsIcon,
  AiChipIcon,
  MessageSquareIcon,
  ContactsIcon
} from '../components/icons';

type InstanceTab = 'summary' | 'workspace' | 'pipeline' | 'tasks' | 'contacts' | 'agents' | 'ai';

const DashboardContent: React.FC<{
  instance: Instance;
  user: User;
}> = ({ instance, user }) => {
  const [activeTab, setActiveTab] = useState<InstanceTab>('workspace');
  
  const TABS: { id: InstanceTab; name: string; icon: React.FC<any> }[] = [
      { id: 'summary', name: 'Resumen', icon: DashboardIcon },
      { id: 'workspace', name: 'Conversaciones', icon: MessageSquareIcon },
      { id: 'pipeline', name: 'Pipeline', icon: PipelineIcon },
      { id: 'tasks', name: 'Tareas', icon: TasksIcon },
      { id: 'contacts', name: 'Contactos', icon: ContactsIcon },
      { id: 'agents', name: 'Agentes', icon: AgentsIcon },
      { id: 'ai', name: 'Análisis IA', icon: AiChipIcon },
  ];

  const renderTabContent = () => {
      switch (activeTab) {
          case 'summary':
              return <div className="p-6"><SummaryView instance={instance} apiService={apiService} /></div>;
          case 'workspace':
              return <InstanceWorkspace instance={instance} user={user} apiService={apiService} />;
          case 'contacts':
               return <ContactsPage instance={instance} apiService={apiService} />;
          case 'pipeline':
              return <KanbanBoard instance={instance} apiService={apiService} />;
          case 'tasks':
              return <TasksPage instance={instance} apiService={apiService} />;
          case 'agents':
              return <AgentList instance={instance} apiService={apiService} />;
          case 'ai':
              return <AiAnalysisPage instance={instance} apiService={apiService} />;
          default:
              return null;
      }
  };

  return (
      <div className="flex flex-col h-full">
          <header className="flex-shrink-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between p-3">
              <h1 className="text-xl font-bold text-white flex items-center gap-3">
                  <BriefcaseIcon />
                  {instance.name}
              </h1>
              <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg">
                  {TABS.map(tab => (
                      <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              activeTab === tab.id
                                  ? 'bg-slate-700 text-white'
                                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                          }`}
                      >
                          <tab.icon className="w-4 h-4" />
                          {tab.name}
                      </button>
                  ))}
              </div>
          </header>
          <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
          </div>
      </div>
  );
};

interface DashboardPageProps {
  user: User;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user }) => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [activeView, setActiveView] = useState<number | 'all' | 'settings'>(user.role === 'admin' ? 'all' : (user.assignedInstanceIds?.[0] || 0));
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    setIsLoadingInstances(true);
    apiService.getInstances()
      .then(data => {
        const userInstances = user.role === 'admin' 
          ? data 
          : data.filter(inst => user.assignedInstanceIds?.includes(inst.id));
        setInstances(userInstances);
        if(activeView === 0 && userInstances.length > 0) {
            setActiveView(userInstances[0].id);
        }
      })
      .catch(err => {
          console.error("Failed to load instances:", err);
          // Podrías mostrar un error al usuario aquí
      })
      .finally(() => setIsLoadingInstances(false));
  }, [user]);

  const renderContent = () => {
    if (activeView === 'settings') {
      return <div className="p-6"><SettingsPage currentInstances={instances} onInstancesUpdate={setInstances} /></div>;
    }
    
    if (activeView === 'all') {
      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6">Dashboard Global</h1>
          <SummaryView instance={{ id: 'all', name: 'Vista Global' }} apiService={apiService} />
        </div>
      );
    }

    const selectedInstance = instances.find(inst => inst.id === activeView);

    if (!selectedInstance) {
        if(isLoadingInstances) return <div className="text-center p-8">Cargando marcas...</div>
        return <div className="text-center p-8">Por favor, selecciona una marca o añádela en la configuración.</div>;
    }

    return <DashboardContent instance={selectedInstance} user={user} />;
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      <Sidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        user={user}
        instances={instances}
        isLoading={isLoadingInstances}
        isCollapsed={isMainSidebarCollapsed}
        onToggle={() => setIsMainSidebarCollapsed(prev => !prev)}
      />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardPage;
