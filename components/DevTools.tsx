import React, { useState, useEffect } from 'react';
import { Conversation, Message, Contact } from '../types';
import * as mockApiService from '../services/mockApiService';
import { appEvents } from '../services/appEvents';
import { ZapIcon, SendIcon, XCircleIcon } from './icons';
import { faker } from 'https://cdn.skypack.dev/@faker-js/faker@v7.6.0';

interface DevToolsProps {
    activeInstanceId: number;
}

const DevTools: React.FC<DevToolsProps> = ({ activeInstanceId }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Message state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string>('');
    const [messageContent, setMessageContent] = useState('');
    // Contact state
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string>('');

    useEffect(() => {
        if (isOpen && activeInstanceId) {
            const convs = mockApiService._internalGetAllConversationsForInstance(activeInstanceId);
            setConversations(convs);
            if (convs.length > 0 && !selectedConversationId) {
                setSelectedConversationId(String(convs[0].id));
            }

            const conts = mockApiService._internalGetAllContactsForInstance(activeInstanceId);
            setContacts(conts);
            if (conts.length > 0 && !selectedContactId) {
                setSelectedContactId(String(conts[0].id));
            }
        }
    }, [isOpen, activeInstanceId, selectedConversationId, selectedContactId]);
    
    const handleSimulateNewMessage = () => {
        if (!selectedConversationId || !messageContent.trim()) {
            alert('Please select a conversation and enter a message.');
            return;
        }

        const convId = Number(selectedConversationId);
        const conversation = conversations.find(c => c.id === convId);
        if (!conversation) return;

        const newMessage: Message = {
            id: faker.datatype.number(),
            content: messageContent,
            createdAt: new Date().toISOString(),
            sender: { type: 'user', name: conversation.contact.name, avatarUrl: conversation.contact.avatarUrl, },
        };

        mockApiService._internalAddMessageToConversation(activeInstanceId, convId, newMessage);
        
        appEvents.emit('webhook:message_created', {
            instanceId: activeInstanceId,
            conversationId: convId,
            message: newMessage,
        });

        setMessageContent('');
        alert('Simulated new message!');
    };
    
    const handleSimulateContactUpdate = () => {
        if (!selectedContactId) {
            alert('Please select a contact.');
            return;
        }
        const contactId = Number(selectedContactId);
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;

        const updatedContact: Contact = {
            ...contact,
            tags: [...new Set([...contact.tags, 'VIP'])],
        };

        mockApiService._internalUpsertContact(activeInstanceId, updatedContact);

        appEvents.emit('webhook:contact_updated', {
            instanceId: activeInstanceId,
            contact: updatedContact,
        });
        alert(`Simulated contact update for ${contact.name}! (Added 'VIP' tag)`);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                title="Open DevTools"
                className="fixed bottom-4 right-4 z-50 p-3 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-transform hover:scale-110"
            > <ZapIcon /> </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl text-white flex flex-col max-h-[80vh]">
            <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-slate-700">
                <h3 className="font-bold text-sm flex items-center gap-2"><ZapIcon /> Webhook Simulator</h3>
                <button onClick={() => setIsOpen(false)}><XCircleIcon className="w-5 h-5 text-slate-500 hover:text-white" /></button>
            </div>
            <div className="flex-grow overflow-y-auto p-3 space-y-4">
                {/* Message Simulator */}
                <div className="space-y-2 p-2 border border-slate-800 rounded-md">
                    <p className="text-xs font-bold text-slate-400">Simulate `message_created`</p>
                    <select value={selectedConversationId} onChange={(e) => setSelectedConversationId(e.target.value)} className="w-full text-xs bg-slate-800 p-1.5 rounded-md focus:ring-sky-500 focus:border-sky-500 border-slate-700 border">
                        {conversations.map(c => <option key={c.id} value={c.id}>{c.contact.name}</option>)}
                    </select>
                    <textarea value={messageContent} onChange={(e) => setMessageContent(e.target.value)} placeholder="Message from contact..." className="w-full text-xs bg-slate-800 p-1.5 rounded-md focus:ring-sky-500 focus:border-sky-500 border-slate-700 border resize-none" rows={2} />
                    <button onClick={handleSimulateNewMessage} className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-sky-600 text-white hover:bg-sky-700">
                        <SendIcon className="w-3 h-3" /> Simulate Message
                    </button>
                </div>
                {/* Contact Simulator */}
                 <div className="space-y-2 p-2 border border-slate-800 rounded-md">
                    <p className="text-xs font-bold text-slate-400">Simulate `contact_updated`</p>
                    <select value={selectedContactId} onChange={(e) => setSelectedContactId(e.target.value)} className="w-full text-xs bg-slate-800 p-1.5 rounded-md focus:ring-sky-500 focus:border-sky-500 border-slate-700 border">
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button onClick={handleSimulateContactUpdate} className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-teal-600 text-white hover:bg-teal-700">
                        Add 'VIP' Tag
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DevTools;
