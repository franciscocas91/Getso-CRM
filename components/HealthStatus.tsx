import React from 'react';
import type { HealthCheck, HealthStatusState } from '../types';
import { ShieldCheckIcon } from './icons';

interface HealthStatusProps {
  checks: HealthCheck[];
}

const statusStyles: Record<HealthStatusState, { dot: string; text: string }> = {
  saludable: { dot: 'bg-green-500', text: 'text-green-400' },
  degradado: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
  advertencia: { dot: 'bg-orange-500', text: 'text-orange-400' },
  caído: { dot: 'bg-red-500', text: 'text-red-500' },
};

const HealthStatus: React.FC<HealthStatusProps> = ({ checks }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg h-full border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ShieldCheckIcon className="mr-2 text-green-400" />
        Salud de la Instancia
      </h3>
      <ul className="space-y-4">
        {checks.map((check) => (
          <li key={check.checkType} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`h-2.5 w-2.5 rounded-full mr-3 ${statusStyles[check.status].dot}`}></span>
              <span className="font-medium text-slate-200">{check.checkType}</span>
            </div>
            <div className="text-right">
                <span className={`text-sm font-semibold capitalize ${statusStyles[check.status].text}`}>{check.status}</span>
                <p className="text-xs text-slate-500">{check.details}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthStatus;
