import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { SentimentData } from '../types';
import { SmileIcon } from './icons';

interface SentimentChartProps {
  data: SentimentData;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Positivo', value: data.positive, color: '#22c55e' },
    { name: 'Neutral', value: data.neutral, color: '#facc15' },
    { name: 'Negativo', value: data.negative, color: '#ef4444' },
  ];

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg h-full border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <SmileIcon className="mr-2 text-sky-400" />
        Análisis de Sentimiento
      </h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} dx={-5} />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            contentStyle={{
              background: 'rgba(30, 41, 59, 0.8)',
              borderColor: '#334155',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Porcentaje']}
          />
          <Bar dataKey="value" barSize={20} radius={[0, 10, 10, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;
