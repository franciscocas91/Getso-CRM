import React, { useState, useEffect } from 'react';
import { Instance, AiProvider, Industry, Inbox } from '../types';
import * as mockApiService from '../services/mockApiService';
import { WhatsAppIcon, AiChipIcon } from './icons';

interface InstanceFormProps {
  instance: Instance | null;
  onTestAndSave: (instance: Omit<Instance, 'id'> | Instance) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const InputField: React.FC<{ name: string, label: string, value: string | number, onChange: any, type?: string, required?: boolean, placeholder?: string }> = 
({ name, label, value, onChange, type = 'text', required = true, placeholder }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
    />
  </div>
);

const InstanceForm: React.FC<InstanceFormProps> = ({ instance, onTestAndSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    industry: 'services' as Industry,
    chatwootUrl: '',
    accountId: '',
    apiKey: '',
    aiProvider: '' as AiProvider | '',
    aiApiKey: '',
    metaAppId: '',
    metaBusinessAccountId: '',
    metaToken: '',
    metaInboxId: '',
    webhookHmacToken: '',
  });
  
  const [inboxes, setInboxes] = useState<Inbox[]>([]);

  useEffect(() => {
    if (instance) {
      setFormData({
        name: instance.name,
        region: instance.region,
        industry: instance.industry,
        chatwootUrl: instance.chatwootUrl,
        accountId: String(instance.accountId),
        apiKey: instance.apiKey,
        aiProvider: instance.aiProvider || '',
        aiApiKey: instance.aiApiKey || '',
        metaAppId: instance.metaAppId || '',
        metaBusinessAccountId: instance.metaBusinessAccountId || '',
        metaToken: instance.metaToken || '',
        metaInboxId: String(instance.metaInboxId || ''),
        webhookHmacToken: instance.webhookHmacToken || '',
      });
      // Fetch inboxes for the existing instance
      mockApiService.getInboxes(instance).then(setInboxes);
    } else {
        // Reset form for new instance
        setFormData({
            name: '',
            region: '',
            industry: 'services',
            chatwootUrl: '',
            accountId: '',
            apiKey: '',
            aiProvider: '',
            aiApiKey: '',
            metaAppId: '',
            metaBusinessAccountId: '',
            metaToken: '',
            metaInboxId: '',
            webhookHmacToken: '',
        });
        setInboxes([]);
    }
  }, [instance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = {
        ...formData,
        accountId: Number(formData.accountId),
        metaInboxId: formData.metaInboxId ? Number(formData.metaInboxId) : undefined,
        aiProvider: formData.aiProvider === '' ? undefined : formData.aiProvider as AiProvider,
        aiApiKey: formData.aiApiKey === '' ? undefined : formData.aiApiKey,
        metaAppId: formData.metaAppId === '' ? undefined : formData.metaAppId,
        metaBusinessAccountId: formData.metaBusinessAccountId === '' ? undefined : formData.metaBusinessAccountId,
        metaToken: formData.metaToken === '' ? undefined : formData.metaToken,
        webhookHmacToken: formData.webhookHmacToken === '' ? undefined : formData.webhookHmacToken,
    };
    if(instance) {
        onTestAndSave({ ...dataToSave, id: instance.id });
    } else {
        onTestAndSave(dataToSave);
    }
  };

  const webhookUrl = `${window.location.origin}/api/webhook/chatwoot/${instance?.id || 'new_instance'}`;

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h2 className="text-2xl font-bold text-white mb-6">{instance ? 'Editar Marca' : 'Añadir Nueva Marca'}</h2>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
        <InputField name="name" label="Nombre de la Marca" value={formData.name} onChange={handleChange} placeholder="Ej: Mi Empresa" />
        <InputField name="region" label="Región" value={formData.region} onChange={handleChange} placeholder="Ej: USA, Europa" />
        
        <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-300">Rubro del Negocio</label>
            <select
                name="industry"
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            >
                <option value="services">Venta de Servicios</option>
                <option value="real_estate">Inmobiliaria</option>
                <option value="health">Salud</option>
                <option value="municipality">Municipalidad</option>
            </select>
        </div>
        
        <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-300 px-2">Configuración de Chatwoot</legend>
            <div className="space-y-4">
                <InputField name="chatwootUrl" label="URL de la Instancia Chatwoot" value={formData.chatwootUrl} onChange={handleChange} placeholder="https://app.chatwoot.com" />
                <InputField name="accountId" label="ID de Cuenta de Chatwoot" value={formData.accountId} onChange={handleChange} type="number" placeholder="101" />
                <InputField name="apiKey" label="API Key de Chatwoot (Personal Access Token)" value={formData.apiKey} onChange={handleChange} placeholder="cw_api_key_... (prueba con 'fail')" />
            </div>
        </fieldset>

        <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-300 px-2">Webhook de Chatwoot</legend>
             <div className="space-y-4">
                <div>
                     <label className="block text-sm font-medium text-slate-300">URL del Webhook (copiar en Chatwoot)</label>
                     <input type="text" readOnly value={webhookUrl} className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 cursor-copy" onClick={(e) => (e.target as HTMLInputElement).select()} />
                </div>
                <InputField name="webhookHmacToken" label="Token HMAC-256 (opcional)" value={formData.webhookHmacToken} onChange={handleChange} required={false} placeholder="Dejar en blanco si no se usa" />
            </div>
        </fieldset>

        <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-300 px-2 flex items-center gap-2"><AiChipIcon /> Inteligencia Artificial (Opcional)</legend>
            <div className="space-y-4">
                <div>
                    <label htmlFor="aiProvider" className="block text-sm font-medium text-slate-300">Proveedor de IA</label>
                    <select
                        name="aiProvider"
                        id="aiProvider"
                        value={formData.aiProvider}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">Ninguno</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="deepseek">DeepSeek</option>
                    </select>
                </div>
                 {formData.aiProvider && <InputField name="aiApiKey" label={`API Key de ${formData.aiProvider}`} value={formData.aiApiKey} onChange={handleChange} required={!!formData.aiProvider} />}
            </div>
        </fieldset>

         <fieldset className="border border-slate-600 p-4 rounded-md">
            <legend className="text-sm font-medium text-slate-300 px-2 flex items-center gap-2"><WhatsAppIcon className="w-4 h-4" /> Integración Meta (Opcional)</legend>
            <p className="text-xs text-slate-400 mb-4">Requerido para enviar mensajes proactivos de WhatsApp.</p>
            <div className="space-y-4">
                 <InputField name="metaAppId" label="ID de la App de Meta" value={formData.metaAppId} onChange={handleChange} required={false} />
                 <InputField name="metaBusinessAccountId" label="ID de la Cuenta de Negocio de Meta" value={formData.metaBusinessAccountId} onChange={handleChange} required={false} />
                 <InputField name="metaToken" label="Token de Acceso Permanente de Meta" value={formData.metaToken} onChange={handleChange} required={false} />
                 <div>
                    <label htmlFor="metaInboxId" className="block text-sm font-medium text-slate-300">Bandeja de Entrada de WhatsApp</label>
                     <select
                        name="metaInboxId"
                        id="metaInboxId"
                        value={formData.metaInboxId}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 bg-slate-900 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    >
                        <option value="">-- Seleccionar Bandeja --</option>
                        {inboxes.filter(i => i.channelType === 'whatsapp').map(inbox => (
                            <option key={inbox.id} value={inbox.id}>{inbox.name} ({inbox.phoneNumber})</option>
                        ))}
                    </select>
                    {inboxes.length === 0 && instance && <p className="text-xs text-slate-500 mt-1">No se encontraron bandejas de WhatsApp. Asegúrate de haberlas creado en Chatwoot.</p>}
                 </div>
            </div>
        </fieldset>

      </div>

      <div className="flex justify-end space-x-4 mt-6 pt-4 border-t border-slate-700">
        <button type="button" onClick={onCancel} disabled={isLoading} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50">
          {isLoading ? 'Guardando...' : (instance ? 'Probar y Guardar Cambios' : 'Probar y Añadir Marca')}
        </button>
      </div>
    </form>
  );
};

export default InstanceForm;