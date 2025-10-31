import React, { useState, useEffect } from 'react';
import type { Kpis, Anomaly, HealthCheck, Instance, TimeSeriesData, SentimentData } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';

import KpiCard from '../../components/KpiCard';
import TimeSeriesChart from '../../components/TimeSeriesChart';
import CsatGaugeChart from '../../components/CsatGaugeChart';
import AnomaliesTable from '../../components/AnomaliesTable';
import HealthStatus from '../../components/HealthStatus';
import SentimentChart from '../../components/SentimentChart';

interface SummaryViewProps {
  instance: Instance | { id: 'all', name: string };
  apiService: typeof mockApiService | typeof apiService;
}

const LoadingSkeleton: React.FC = () => (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-700 rounded w-1/2"></div>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-center col-span-full" role="alert">
        <div>
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    </div>
);

const SummaryView: React.FC<SummaryViewProps> = ({ instance, apiService }) => {
    const [kpis, setKpis] = useState<Kpis | null>(null);
    const [anomalies, setAnomalies] = useState<Anomaly[] | null>(null);
    const [healthStatus, setHealthStatus] = useState<HealthCheck[] | null>(null);
    const [conversationVolume, setConversationVolume] = useState<TimeSeriesData[] | null>(null);
    const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchSummaryData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [kpisData, anomaliesData, healthData, convVolumeData, sentiment] = await Promise.all([
                    apiService.getKpis(instance),
                    apiService.getAnomalies(instance),
                    apiService.getHealthStatus(instance),
                    // FIX: Pass the 'period' argument to getConversationVolume as expected by its signature.
                    apiService.getConversationVolume(instance, '30d'),
                    apiService.getSentimentData(instance),
                ]);

                setKpis(kpisData);
                setAnomalies(anomaliesData);
                setHealthStatus(healthData);
                setConversationVolume(convVolumeData);
                setSentimentData(sentiment);
            } catch (err: any) {
                console.error("Failed to fetch summary data:", err);
                setError(err.message || 'Ocurrió un error al cargar los datos del resumen.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummaryData();
    }, [instance, apiService]);

    if (loading) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => <LoadingSkeleton key={i}/>)}
             </div>
        )
    }

    if (error) {
        return <ErrorDisplay message={error} />
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                {kpis ? (
                    <>
                        <KpiCard title="CSAT" value={`${kpis.csat}%`} />
                        <KpiCard title="Tiempo de Primera Respuesta" value={`${kpis.firstResponseTime}`} unit="min" />
                        <KpiCard title="Tasa de Resolución" value={`${kpis.resolutionRate}%`} />
                        <KpiCard title="Tiempo Prom. de Resolución" value={`${kpis.avgResolutionTime}`} unit="min" />
                        <KpiCard title="Utilización de Agentes" value={`${kpis.agentUtilization}%`} />
                        <KpiCard title="Volumen de Conversaciones" value={kpis.conversationVolume} />
                        <KpiCard title="Volumen de Mensajes" value={kpis.messageVolume} />
                    </>
                ) : Array.from({ length: 7 }).map((_, i) => <LoadingSkeleton key={i}/>)}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                    {!conversationVolume ? <div className="h-96 bg-slate-800/50 rounded-lg animate-pulse"></div> : <TimeSeriesChart data={conversationVolume} />}
                </div>
                <div className="lg:col-span-1">
                    {!kpis ? <div className="h-96 bg-slate-800/50 rounded-lg animate-pulse"></div> : <CsatGaugeChart value={kpis.csat} />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                    {!anomalies ? <div className="h-[440px] bg-slate-800/50 rounded-lg animate-pulse"></div> : <AnomaliesTable anomalies={anomalies} />}
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {!healthStatus ? <div className="h-60 bg-slate-800/50 rounded-lg animate-pulse"></div> : <HealthStatus checks={healthStatus} />}
                    {!sentimentData ? <div className="h-60 bg-slate-800/50 rounded-lg animate-pulse"></div> : <SentimentChart data={sentimentData} />}
                </div>
            </div>
        </>
    );
};

export default SummaryView;