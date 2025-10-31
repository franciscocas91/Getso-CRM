import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface CsatGaugeChartProps {
  value: number;
}

const CsatGaugeChart: React.FC<CsatGaugeChartProps> = ({ value }) => {
  const data = [{ name: 'CSAT', value }];
  const endAngle = 90 - (value / 100) * 360;
  
  const getColor = (val: number) => {
    if (val > 90) return '#22c55e'; // green-500
    if (val > 80) return '#84cc16'; // lime-500
    if (val > 70) return '#facc15'; // yellow-400
    if (val > 60) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg h-96 border border-slate-700/50 flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-white mb-2 text-center">Satisfacción del Cliente (CSAT)</h3>
      <div className="w-full h-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="85%"
            data={data}
            startAngle={90}
            endAngle={endAngle}
            barSize={30}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#334155' }}
              dataKey="value"
              cornerRadius={15}
              fill={getColor(value)}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-5xl font-bold text-white">{value.toFixed(1)}%</span>
            <span className="text-slate-400">Satisfacción</span>
        </div>
      </div>
    </div>
  );
};

export default CsatGaugeChart;
