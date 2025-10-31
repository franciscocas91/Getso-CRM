import React from 'react';
import { IntegrationStep } from '../types';
import { LoaderIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface IntegrationProgressModalProps {
  steps: IntegrationStep[];
  onClose: () => void;
  isRunning: boolean;
}

const IntegrationProgressModal: React.FC<IntegrationProgressModalProps> = ({ steps, onClose, isRunning }) => {

  const getStatusIcon = (status: IntegrationStep['status']) => {
    switch (status) {
      case 'in-progress':
        return <LoaderIcon className="text-sky-400" />;
      case 'success':
        return <CheckCircleIcon className="text-green-400" />;
      case 'error':
        return <XCircleIcon className="text-red-400" />;
      case 'pending':
      default:
        return <div className="w-5 h-5 border-2 border-slate-500 rounded-full" />;
    }
  };
  
  const isComplete = !isRunning;
  const hasError = steps.some(s => s.status === 'error');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-2">
        {isComplete ? (hasError ? 'Falló la Integración' : 'Integración Completada') : 'Integrando Marca...'}
      </h2>
      <p className="text-slate-400 mb-6">
        {isComplete ? (hasError ? 'No se pudo conectar a la instancia. Por favor, revisa los datos y vuelve a intentarlo.' : 'La marca ha sido configurada y guardada exitosamente.') : 'Por favor, espera mientras verificamos la conexión y sincronizamos los datos iniciales.'}
      </p>

      <ul className="space-y-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-4 mt-1">
              {getStatusIcon(step.status)}
            </div>
            <div className="flex-grow">
              <p className={`font-medium ${step.status !== 'pending' ? 'text-slate-100' : 'text-slate-500'}`}>
                {step.name}
              </p>
              {step.status === 'error' && (
                <p className="text-red-400 text-sm mt-1">{step.error}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      
      {isComplete && (
         <div className="flex justify-end mt-8">
            <button 
                onClick={onClose}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
                Cerrar
            </button>
        </div>
      )}
    </div>
  );
};

export default IntegrationProgressModal;
