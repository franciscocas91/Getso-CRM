import React, { useState, useEffect } from 'react';
import { Instance, IntegrationStep, PipelineStageConfig, Industry } from '../types';
import * as mockApiService from '../services/mockApiService';
import * as apiService from '../services/apiService';
import Modal from '../components/Modal';
import InstanceForm from '../components/InstanceForm';
import IntegrationProgressModal from '../components/IntegrationProgressModal';
import { PlusIcon, EditIcon, TrashIcon, SettingsIcon } from '../components/icons';

interface SettingsPageProps {
  currentInstances: Instance[];
  onInstancesUpdate: (updatedInstances: Instance[]) => void;
}

const initialSteps: IntegrationStep[] = [
    { name: 'Conectando a la API de Chatwoot', status: 'pending' },
    { name: 'Descargando detalles de la cuenta', status: 'pending' },
    { name: 'Descargando conversaciones iniciales', status: 'pending' },
    { name: 'Descargando lista de agentes', status: 'pending' },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const PipelineStageManager: React.FC = () => {
    const [stages, setStages] = useState<PipelineStageConfig[]>([]);
    const [loading, setLoading] = useState(true);
    // For now, we'll edit the 'services' pipeline by default. 
    // A more advanced version would have a dropdown to select which industry pipeline to edit.
    const industryToEdit: Industry = 'services';

    useEffect(() => {
        mockApiService.getPipelineStages(industryToEdit).then(data => {
            setStages(data);
            setLoading(false);
        });
    }, [industryToEdit]);

    const handleSave = async () => {
        await mockApiService.updatePipelineStages(stages, industryToEdit);
        alert(`Pipeline para "${industryToEdit}" guardado.`);
    };
    
    const handleStageChange = (id: string, field: keyof PipelineStageConfig, value: string | number) => {
        setStages(currentStages =>
            currentStages.map(stage =>
                stage.id === id ? { ...stage, [field]: value } : stage
            )
        );
    };

    const handleAddNewStage = () => {
        const newStage: PipelineStageConfig = {
            id: `stage_${new Date().getTime()}`,
            name: 'Nueva Etapa',
            probability: 0,
            order: Math.max(...stages.map(s => s.order), 0) + 1,
        };
        setStages([...stages, newStage]);
    };

    const handleDeleteStage = (id: string) => {
        setStages(stages.filter(s => s.id !== id));
    };

    if (loading) return <p>Cargando etapas del pipeline...</p>;

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700/50 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Gestión del Pipeline (Rubro: Servicios)</h2>
            <div className="space-y-3">
                {stages.map(stage => (
                    <div key={stage.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded-md">
                        <input
                            type="text"
                            value={stage.name}
                            onChange={e => handleStageChange(stage.id, 'name', e.target.value)}
                            className="bg-slate-700 rounded-md px-2 py-1 text-sm flex-grow"
                        />
                         <input
                            type="number"
                            value={stage.probability}
                            onChange={e => handleStageChange(stage.id, 'probability', parseInt(e.target.value) || 0)}
                            className="bg-slate-700 rounded-md px-2 py-1 text-sm w-20 text-center"
                            max="100"
                            min="0"
                        />
                         <span className="text-slate-400">%</span>
                         <button onClick={() => handleDeleteStage(stage.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-4">
                 <button onClick={handleAddNewStage} className="text-sm text-sky-400 hover:text-sky-300">
                    + Añadir Etapa
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors text-sm">
                    Guardar Cambios del Pipeline
                </button>
            </div>
        </div>
    )
}


const SettingsPage: React.FC<SettingsPageProps> = ({ currentInstances, onInstancesUpdate }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<Instance | null>(null);
  const [isDeleting, setIsDeleting] = useState<Instance | null>(null);
  const [integrationSteps, setIntegrationSteps] = useState<IntegrationStep[]>(initialSteps);
  const [isIntegrationRunning, setIsIntegrationRunning] = useState(false);

  const handleOpenFormModal = (instance: Instance | null = null) => {
    setEditingInstance(instance);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    if (isIntegrationRunning) return;
    setIsFormModalOpen(false);
    setEditingInstance(null);
  };
  
  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false);
    setIntegrationSteps(initialSteps.map(s => ({...s, status: 'pending', error: undefined})));
  }

  const runIntegrationFlow = async (instanceData: Omit<Instance, 'id'> | Instance) => {
    setIsIntegrationRunning(true);
    setIntegrationSteps(initialSteps.map(s => ({...s, status: 'pending', error: undefined})));

    const updateStep = (index: number, status: 'in-progress' | 'success' | 'error', error?: string) => {
        setIntegrationSteps(prevSteps => {
            const newSteps = [...prevSteps];
            newSteps[index] = { ...newSteps[index], status, error };
            return newSteps;
        });
    };
    
    // Step 1: Test Connection
    updateStep(0, 'in-progress');
    try {
        const connectionResult = await mockApiService.testChatwootConnection(instanceData);
        if (!connectionResult.success) throw new Error(connectionResult.message);
        updateStep(0, 'success');
    } catch (e: any) {
        updateStep(0, 'error', e.message);
        setIsIntegrationRunning(false);
        return;
    }
    
    for (let i = 1; i < initialSteps.length; i++) {
        await sleep(700);
        updateStep(i, 'in-progress');
        await sleep(700);
        updateStep(i, 'success');
    }

    try {
        if ('id' in instanceData) {
            const updated = await mockApiService.updateInstance(instanceData);
            onInstancesUpdate(currentInstances.map(i => i.id === updated.id ? updated : i));
        } else {
            const created = await mockApiService.createInstance(instanceData);
            onInstancesUpdate([...currentInstances, created]);
        }
    } catch(err: any) {
        console.error("Failed to save instance after successful integration:", err);
    }

    setIsIntegrationRunning(false);
    setIsFormModalOpen(false);
  };

  const handleTestAndSave = (instanceData: Omit<Instance, 'id'> | Instance) => {
    setIsProgressModalOpen(true);
    runIntegrationFlow(instanceData);
  };
  
  const handleDelete = async (instanceId: number) => {
    try {
      await mockApiService.deleteInstance(instanceId);
      onInstancesUpdate(currentInstances.filter(i => i.id !== instanceId));
      setIsDeleting(null);
    } catch (err: any) {
       console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center">
            <SettingsIcon className="mr-3" /> Configuración
        </h1>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700/50">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Marcas</h2>
            <button
            onClick={() => handleOpenFormModal()}
            className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
            <PlusIcon className="mr-2" />
            Añadir Marca
            </button>
        </div>
        <ul className="divide-y divide-slate-700/50">
          {currentInstances.map(instance => (
            <li key={instance.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">{instance.name}</p>
                <p className="text-sm text-slate-400">{instance.region} - Account ID: {instance.accountId}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                    onClick={() => handleOpenFormModal(instance)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                    aria-label="Editar"
                >
                  <EditIcon />
                </button>
                <button 
                    onClick={() => setIsDeleting(instance)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
                    aria-label="Eliminar"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
           {currentInstances.length === 0 && (
              <p className="text-center py-8 text-slate-500">No hay marcas configuradas. ¡Añade una para empezar!</p>
            )}
        </ul>
      </div>

      <PipelineStageManager />

      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal}>
        <InstanceForm
          instance={editingInstance}
          onTestAndSave={handleTestAndSave}
          onCancel={handleCloseFormModal}
          isLoading={isIntegrationRunning}
        />
      </Modal>

      <Modal isOpen={isProgressModalOpen} onClose={handleCloseProgressModal}>
          <IntegrationProgressModal 
              steps={integrationSteps} 
              onClose={handleCloseProgressModal}
              isRunning={isIntegrationRunning}
          />
      </Modal>
      
      <Modal isOpen={!!isDeleting} onClose={() => setIsDeleting(null)}>
        <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h2>
            <p className="text-slate-300">
                ¿Estás seguro de que quieres eliminar la marca <span className="font-bold">{isDeleting?.name}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4 mt-6">
                <button
                    onClick={() => setIsDeleting(null)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => isDeleting && handleDelete(isDeleting.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Eliminar
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;