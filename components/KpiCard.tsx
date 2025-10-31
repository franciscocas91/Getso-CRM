import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, unit }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700/50">
      <h3 className="text-sm font-medium text-slate-400 truncate">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-white">
        {value}
        {unit && <span className="text-base ml-1 font-normal text-slate-400">{unit}</span>}
      </p>
    </div>
  );
};

export default KpiCard;
