import React from 'react';
import type { Anomaly, AnomalySeverity } from '../types';
import { AlertTriangleIcon } from './icons';

interface AnomaliesTableProps {
  anomalies: Anomaly[];
}

const severityStyles: Record<AnomalySeverity, string> = {
  baja: 'bg-sky-500/20 text-sky-400',
  media: 'bg-yellow-500/20 text-yellow-400',
  alta: 'bg-orange-500/20 text-orange-400',
  crítica: 'bg-red-500/20 text-red-500',
};

const AnomaliesTable: React.FC<AnomaliesTableProps> = ({ anomalies }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg h-[440px] border border-slate-700/50 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <AlertTriangleIcon className="mr-2 text-yellow-400" />
        Anomalías Detectadas
      </h3>
      <div className="overflow-y-auto flex-grow">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
            <tr>
              <th scope="col" className="px-4 py-2">Métrica</th>
              <th scope="col" className="px-4 py-2">Severidad</th>
              <th scope="col" className="px-4 py-2 text-right">Actual</th>
              <th scope="col" className="px-4 py-2 text-right">Esperado</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((anomaly) => (
              <tr key={anomaly.id} className="border-b border-slate-700/50 hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-slate-200">{anomaly.metricAffected}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${severityStyles[anomaly.severity]}`}>
                    {anomaly.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-red-400">{anomaly.actualValue}</td>
                <td className="px-4 py-3 text-right">{anomaly.expectedValue}</td>
              </tr>
            ))}
             {anomalies.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-500">No se detectaron anomalías.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnomaliesTable;
