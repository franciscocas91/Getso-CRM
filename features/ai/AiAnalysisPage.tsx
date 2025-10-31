import React, { useState, useEffect } from 'react';
import type { AiAnalysisReport, Instance } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import { AiChipIcon, TrendingUpIcon, UsersIcon, DollarSignIcon, TargetIcon } from '../../components/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AiAnalysisPageProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
}

const InsightCard: React.FC<{ insight: { title: string, insight: string, icon: 'trendingUp' | 'users' | 'dollarSign' } }> = ({ insight }) => {
  const ICONS = {
    trendingUp: <TrendingUpIcon className="text-sky-400" />,
    users: <UsersIcon className="text-lime-400" />,
    dollarSign: <DollarSignIcon className="text-green-400 w-6 h-6" />,
  };
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex items-start gap-4">
      <div className="flex-shrink-0">{ICONS[insight.icon]}</div>
      <div>
        <h4 className="font-bold text-white">{insight.title}</h4>
        <p className="text-sm text-slate-300 mt-1">{insight.insight}</p>
      </div>
    </div>
  );
};

const AiAnalysisPage: React.FC<AiAnalysisPageProps> = ({ instance, apiService }) => {
  const [report, setReport] = useState<AiAnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instance.aiProvider || !instance.aiApiKey) {
      setError("La IA no está configurada para esta instancia. Añade un proveedor de IA y una API Key en la configuración.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    apiService.getAiAnalysis(instance)
      .then(setReport)
      .catch(err => setError(err.message || "Failed to load AI analysis."))
      .finally(() => setLoading(false));
  }, [instance, apiService]);

  if (loading) return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
          <AiChipIcon className="w-16 h-16 text-sky-500 animate-pulse mb-4" />
          <p className="text-slate-400">Generando análisis con IA...</p>
      </div>
  );

  if (error) return (
      <div className="p-6 h-full flex flex-col items-center justify-center text-center">
          <AiChipIcon className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error de Análisis</h2>
          <p className="text-red-400 max-w-md">{error}</p>
      </div>
  );

  if (!report) return null;

  const COLORS = ['#0ea5e9', '#84cc16', '#f97316', '#eab308', '#6366f1'];
  // FIX: Remap data to plain objects to satisfy recharts' type expectations which require an index signature.
  const intentChartData = report.intentClassification.map(d => ({ ...d }));
  
  return (
    <div className="p-6 overflow-y-auto h-full">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><AiChipIcon /> Análisis con IA</h1>
      
      <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
        <h2 className="text-lg font-bold text-white mb-2">Resumen Ejecutivo</h2>
        <p className="text-slate-300 leading-relaxed">{report.summary}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {report.predictiveInsights.map((insight, i) => <InsightCard key={i} insight={insight} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2"><TargetIcon /> Clasificación de Intención</h3>
           <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              {/* FIX: Use `p.name` in the label function. The `nameKey="intent"` prop makes the `intent` value available as `name` in the label's payload, resolving a type inference issue with recharts. */}
              <Pie data={intentChartData} dataKey="percentage" nameKey="intent" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={p => `${p.name} (${p.percentage}%)`}>
                {intentChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => `${(value as number).toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
         <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
          <h3 className="font-bold text-white mb-2">Preguntas Frecuentes</h3>
          <ul className="space-y-3 text-sm">
            {report.frequentlyAskedQuestions.map((faq, i) => (
              <li key={i}>
                <p className="font-semibold text-slate-200">P: {faq.question}</p>
                <p className="text-slate-400">R: {faq.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiAnalysisPage;