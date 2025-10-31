import React, { useState, useEffect } from 'react';
import type { Instance, Inbox, Team } from '../../types';
import * as mockApiService from '../../services/mockApiService';
import * as apiService from '../../services/apiService';
import { BriefcaseIcon, WhatsAppIcon, InboxIcon, FolderIcon, UsersIcon, PlusIcon, ChevronDownIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from '../../components/icons';

type Selection = { type: 'folder'; inboxId: number; folderId: number } | { type: 'team'; teamId: number };

interface InstanceSidebarProps {
  instance: Instance;
  apiService: typeof mockApiService | typeof apiService;
  onSelectionChange: (selection: Selection | null) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const NavItem: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    icon: React.ReactNode;
    level: number;
    isCollapsed: boolean;
}> = ({ onClick, isActive, children, icon, level, isCollapsed }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? children as string : undefined}
        className={`w-full flex items-center py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
            isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        } ${isCollapsed ? 'justify-center' : ''}`}
        style={!isCollapsed ? { paddingLeft: `${0.5 + level * 1}rem` } : {}}
    >
        <span className={`w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-2'}`}>{icon}</span>
        <span className={`truncate ${isCollapsed ? 'hidden' : 'block'}`}>{children}</span>
    </button>
);


const InstanceSidebar: React.FC<InstanceSidebarProps> = ({ instance, apiService, onSelectionChange, isCollapsed, onToggle }) => {
    const [inboxes, setInboxes] = useState<Inbox[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedInboxes, setExpandedInboxes] = useState<Set<number>>(new Set());
    const [activeSelection, setActiveSelection] = useState<Selection | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            apiService.getInboxes(instance),
            apiService.getTeams(instance)
        ]).then(([inboxData, teamData]) => {
            setInboxes(inboxData);
            setTeams(teamData);
            const initialExpanded = new Set(inboxData.filter(i => i.folders.length > 0).map(i => i.id));
            setExpandedInboxes(initialExpanded);
        }).finally(() => setLoading(false));
    }, [instance, apiService]);
    
    const handleToggleInbox = (inboxId: number) => {
        setExpandedInboxes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(inboxId)) {
                newSet.delete(inboxId);
            } else {
                newSet.add(inboxId);
            }
            return newSet;
        });
    };
    
    const handleSelect = (selection: Selection) => {
        setActiveSelection(selection);
        onSelectionChange(selection);
    };

    return (
        <aside className={`bg-slate-950/70 backdrop-blur-lg border-r border-slate-800 flex-shrink-0 p-3 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`px-1 mb-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                <div title={instance.name} className={`${isCollapsed ? 'block' : 'hidden'} text-sky-400 p-2 bg-slate-800 rounded-lg`}>
                    <BriefcaseIcon className="w-6 h-6" />
                </div>
                <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
                    <h2 className="text-xl font-bold text-white truncate">{instance.name}</h2>
                    <p className="text-xs text-slate-400">Workspace</p>
                </div>
            </div>

            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-8 bg-slate-800 rounded-md"></div>
                    <div className="h-8 bg-slate-800 rounded-md"></div>
                    <div className={`h-8 bg-slate-800 rounded-md ${isCollapsed ? '' : 'ml-4'}`}></div>
                </div>
            ) : (
                <nav className="flex-grow space-y-4 overflow-y-auto overflow-x-hidden">
                    <div>
                        <h3 className={`px-1 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            <span className={isCollapsed ? 'hidden' : 'block'}>Bandejas</span>
                            <InboxIcon className={`w-5 h-5 ${isCollapsed ? 'block' : 'hidden'}`} />
                            {!isCollapsed && <button className="p-1 hover:bg-slate-700 rounded"><PlusIcon className="w-4 h-4" /></button>}
                        </h3>
                        <div className="space-y-0.5">
                            {inboxes.map(inbox => (
                                <div key={inbox.id}>
                                    <div className="flex items-center group">
                                        {!isCollapsed && (
                                            <button onClick={() => handleToggleInbox(inbox.id)} className="p-1 text-slate-500 hover:text-white">
                                                {expandedInboxes.has(inbox.id) ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                            </button>
                                        )}
                                        <div className="flex-1">
                                             <NavItem
                                                onClick={() => isCollapsed && handleToggleInbox(inbox.id)}
                                                isActive={false} // Inbox itself is not selectable
                                                icon={<WhatsAppIcon className="text-green-500" />}
                                                level={0}
                                                isCollapsed={isCollapsed}
                                            >
                                                {inbox.name}
                                            </NavItem>
                                        </div>
                                    </div>
                                    {expandedInboxes.has(inbox.id) && (
                                        <div className={`mt-0.5 space-y-0.5 ${!isCollapsed ? 'pl-2' : ''}`}>
                                            {inbox.folders.map(folder => (
                                                 <NavItem
                                                    key={folder.id}
                                                    onClick={() => handleSelect({ type: 'folder', inboxId: inbox.id, folderId: folder.id })}
                                                    isActive={activeSelection?.type === 'folder' && activeSelection.folderId === folder.id}
                                                    icon={<FolderIcon />}
                                                    level={1}
                                                    isCollapsed={isCollapsed}
                                                >
                                                    {folder.name}
                                                </NavItem>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className={`px-1 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center ${isCollapsed ? 'justify-center' : ''}`}>
                            <span className={isCollapsed ? 'hidden' : 'block'}>Equipos</span>
                            <UsersIcon className={`w-5 h-5 ${isCollapsed ? 'block' : 'hidden'}`} />
                             {!isCollapsed && <button className="p-1 hover:bg-slate-700 rounded"><PlusIcon className="w-4 h-4" /></button>}
                        </h3>
                        <div className="space-y-0.5">
                             {teams.map(team => (
                                 <NavItem
                                    key={team.id}
                                    onClick={() => handleSelect({ type: 'team', teamId: team.id })}
                                    isActive={activeSelection?.type === 'team' && activeSelection.teamId === team.id}
                                    icon={<UsersIcon className="w-5 h-5" />}
                                    level={0}
                                    isCollapsed={isCollapsed}
                                >
                                    {team.name}
                                </NavItem>
                             ))}
                        </div>
                    </div>
                </nav>
            )}
             <div className="mt-auto border-t border-slate-800 pt-3 flex-shrink-0">
                <NavItem onClick={onToggle} isActive={false} icon={isCollapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />} level={0} isCollapsed={isCollapsed}>
                    Minimizar Menú
                </NavItem>
            </div>
        </aside>
    );
};

export default InstanceSidebar;
