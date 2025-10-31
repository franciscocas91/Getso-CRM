import React, { useState, useEffect } from 'react';
import type { Contact, Instance, Property, MedicalService } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import { BuildingOfficeIcon, BriefcaseIcon, HomeIcon, HeartIcon } from '../../components/icons';

interface ContactDetailProps {
  contact: Contact;
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
  onUpdate: (updatedContact: Contact) => void;
  onClose: () => void;
}

const industryTagSuggestions: Record<string, string[]> = {
    real_estate: ['Comprador', 'Vendedor', 'Inversor', 'Arrendatario'],
    health: ['Nuevo Paciente', 'Seguimiento', 'Urgencia', 'Consulta Anual'],
    services: ['Prospecto', 'Cliente Activo', 'Ex-Cliente', 'Soporte VIP'],
    municipality: ['Residente', 'Propietario Negocio', 'Solicitante', 'Queja'],
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact, instance, apiService, onUpdate, onClose }) => {
    const [editableContact, setEditableContact] = useState<Contact>(contact);
    const [isEditingName, setIsEditingName] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);

    useEffect(() => {
        if (instance.industry === 'real_estate') {
            apiService.getProperties(instance).then(setProperties);
        }
        if (instance.industry === 'health') {
            apiService.getMedicalServices(instance).then(setMedicalServices);
        }
    }, [instance, apiService]);
    
    const handleSave = async () => {
        const updated = await apiService.updateContact(editableContact.id, editableContact, instance);
        onUpdate(updated);
    }
    
    const handleAddTag = (tag: string) => {
        if (!editableContact.tags.includes(tag)) {
            setEditableContact(prev => ({...prev, tags: [...prev.tags, tag]}));
        }
    }

    const handleRemoveTag = (tag: string) => {
        setEditableContact(prev => ({...prev, tags: prev.tags.filter(t => t !== tag)}));
    }

    const renderIndustrySpecificSection = () => {
        switch (instance.industry) {
            case 'real_estate':
                return (
                    <div>
                        <h4 className="font-semibold text-slate-300 flex items-center gap-2 mb-2"><HomeIcon /> Propiedades de Interés</h4>
                        <select 
                            className="w-full bg-slate-700 p-2 rounded-md text-sm mb-2"
                            onChange={e => {
                                const propId = e.target.value;
                                if (propId && !editableContact.interestedPropertyIds?.includes(propId)) {
                                    setEditableContact(p => ({ ...p, interestedPropertyIds: [...(p.interestedPropertyIds || []), propId] }))
                                }
                            }}
                            value=""
                        >
                            <option value="">-- Asignar nueva propiedad --</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                        </select>
                        <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {editableContact.interestedPropertyIds?.map(id => {
                                const prop = properties.find(p => p.id === id);
                                return <li key={id} className="bg-slate-700/50 p-1.5 rounded-md flex justify-between items-center">{prop?.address || `ID: ${id}`} <button onClick={() => setEditableContact(p => ({ ...p, interestedPropertyIds: p.interestedPropertyIds?.filter(pid => pid !== id)}))} className="text-red-400 hover:text-red-300 font-bold">✕</button></li>
                            })}
                        </ul>
                    </div>
                );
            case 'health':
                 return (
                    <div>
                        <h4 className="font-semibold text-slate-300 flex items-center gap-2 mb-2"><HeartIcon /> Historial y Citas</h4>
                         <select 
                            className="w-full bg-slate-700 p-2 rounded-md text-sm mb-2"
                            onChange={e => {
                                const serviceId = e.target.value;
                                if (serviceId && !editableContact.medicalHistoryIds?.includes(serviceId)) {
                                    setEditableContact(p => ({ ...p, medicalHistoryIds: [...(p.medicalHistoryIds || []), serviceId] }))
                                }
                            }}
                            value=""
                        >
                            <option value="">-- Agendar Nueva Cita/Examen --</option>
                            {medicalServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                         <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
                            {editableContact.medicalHistoryIds?.map(id => {
                                const service = medicalServices.find(s => s.id === id);
                                return <li key={id} className="bg-slate-700/50 p-1.5 rounded-md flex justify-between items-center">{service?.name || `ID: ${id}`} <button onClick={() => setEditableContact(p => ({ ...p, medicalHistoryIds: p.medicalHistoryIds?.filter(sid => sid !== id)}))} className="text-red-400 hover:text-red-300 font-bold">✕</button></li>
                            })}
                        </ul>
                    </div>
                );
            case 'services':
                return <div><h4 className="font-semibold text-slate-300 flex items-center gap-2"><BriefcaseIcon /> Servicios y Oportunidades</h4><p className="text-sm text-slate-500 mt-2">Gestión de servicios para {instance.industry} próximamente.</p></div>;
            case 'municipality':
                return <div><h4 className="font-semibold text-slate-300 flex items-center gap-2"><BuildingOfficeIcon /> Trámites y Casos</h4><p className="text-sm text-slate-500 mt-2">Gestión de casos para {instance.industry} próximamente.</p></div>;
            default:
                return null;
        }
    }

  return (
    <div className="text-slate-200">
      <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img src={editableContact.avatarUrl} alt={editableContact.name} className="w-16 h-16 rounded-full" />
            <div>
                {isEditingName ? (
                    <input 
                        type="text" 
                        value={editableContact.name} 
                        onChange={e => setEditableContact({...editableContact, name: e.target.value})}
                        onBlur={() => setIsEditingName(false)}
                        autoFocus
                        className="text-2xl font-bold bg-slate-700 rounded-md px-2 -ml-2"
                    />
                ) : (
                    <h2 className="text-2xl font-bold cursor-pointer" onClick={() => setIsEditingName(true)}>{editableContact.name}</h2>
                )}
                <p className="text-sm text-slate-400">ID Contacto: {editableContact.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl">&times;</button>
      </div>

      <div className="space-y-6">
        <div>
            <h3 className="font-semibold text-slate-400 text-sm uppercase mb-2">Etiquetas</h3>
            <div className="flex flex-wrap gap-1 mb-2">
                {editableContact.tags.map(tag => (
                    <span key={tag} className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-600 text-slate-200">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 -mr-0.5 text-slate-400 hover:text-white">✕</button>
                    </span>
                ))}
            </div>
             <div className="flex flex-wrap gap-1">
                {industryTagSuggestions[instance.industry]?.filter(t => !editableContact.tags.includes(t)).map(tag => (
                    <button key={tag} onClick={() => handleAddTag(tag)} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 hover:bg-sky-500 hover:text-white transition-colors">
                        + {tag}
                    </button>
                ))}
            </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
            {renderIndustrySpecificSection()}
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-slate-700">
        <button onClick={onClose} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors">Cerrar</button>
        <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors">Guardar Cambios</button>
      </div>
    </div>
  );
};

export default ContactDetail;
