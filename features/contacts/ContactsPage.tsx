import React, { useState, useEffect } from 'react';
import type { Contact, Instance } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import Modal from '../../components/Modal';
import ContactDetail from './ContactDetail';
import { appEvents } from '../../services/appEvents';

interface ContactsPageProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ instance, apiService }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    apiService.getContacts(instance)
      .then(data => {
        setContacts(data);
        setFilteredContacts(data);
      })
      .catch(err => setError(err.message || "Failed to load contacts"))
      .finally(() => setLoading(false));
    
    const handleContactUpdate = (payload: { instanceId: number, contact: Contact }) => {
        if (payload.instanceId !== instance.id) return;
        
        setContacts(prev => {
            const index = prev.findIndex(c => c.id === payload.contact.id);
            if (index > -1) {
                const newContacts = [...prev];
                newContacts[index] = payload.contact;
                return newContacts;
            }
            return [...prev, payload.contact];
        });
        
        if (selectedContact?.id === payload.contact.id) {
            setSelectedContact(payload.contact);
        }
    };

    const unsubscribe = appEvents.on('webhook:contact_updated', handleContactUpdate);
    return unsubscribe;
  }, [instance, apiService]);

  useEffect(() => {
    const results = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(results);
  }, [searchTerm, contacts]);

  const handleContactUpdate = (updatedContact: Contact) => {
      const newContacts = contacts.map(c => c.id === updatedContact.id ? updatedContact : c);
      setContacts(newContacts);
      setSelectedContact(updatedContact);
  }

  if (loading) return <div className="p-6 text-center">Cargando contactos...</div>;
  if (error) return <div className="p-6 text-red-400 text-center">{error}</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Contactos</h1>
        <input
          type="search"
          placeholder="Buscar contacto por nombre..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md bg-slate-800 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-lg border border-slate-700/50">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-400 uppercase bg-slate-800 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Etiquetas</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map(contact => (
              <tr 
                key={contact.id} 
                className="border-b border-slate-700/50 hover:bg-slate-800 cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <td className="px-6 py-4 font-medium text-slate-200 flex items-center">
                  <img src={contact.avatarUrl} alt={contact.name} className="w-8 h-8 rounded-full mr-3" />
                  {contact.name}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map(tag => (
                      <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-600 text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
             {filteredContacts.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-8 text-slate-500">No se encontraron contactos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!selectedContact} onClose={() => setSelectedContact(null)}>
        {selectedContact && (
            <ContactDetail 
                contact={selectedContact}
                instance={instance}
                apiService={apiService}
                onUpdate={handleContactUpdate}
                onClose={() => setSelectedContact(null)}
            />
        )}
      </Modal>
    </div>
  );
};

export default ContactsPage;