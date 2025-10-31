import React from 'react';
import type { Instance, User } from '../types';
import { LogoIcon, DashboardIcon, InstancesIcon, SettingsIcon, AlertIcon, LogoutIcon, ChevronsLeftIcon, ChevronsRightIcon } from './icons';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeView: number | 'all' | 'settings';
  onViewChange: (view: number | 'all' | 'settings') => void;
  user: User;
  instances: Instance[];
  isLoading: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  disabled?: boolean;
  isCollapsed: boolean;
}> = ({ onClick, isActive, children, icon, disabled, isCollapsed }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={isCollapsed ? (children as string) : undefined}
    className={`w-full flex items-center text-sm font-medium rounded-md transition-colors duration-200 group ${
      isCollapsed ? 'justify-center px-2 py-2.5' : 'px-4 py-2.5'
    } ${
      isActive
        ? 'bg-slate-700 text-white'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className={`${isCollapsed ? '' : 'mr-3'}`}>{icon}</span>
    {!isCollapsed && <span className="flex-1 text-left truncate">{children}</span>}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, user, instances, isLoading, isCollapsed, onToggle }) => {
  const { logout } = useAuth();

  return (
    <aside className={`bg-slate-950/70 backdrop-blur-lg border-r border-slate-800 flex-shrink-0 p-4 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center mb-8 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
        <LogoIcon className="h-8 w-auto text-sky-400 flex-shrink-0" />
        {!isCollapsed && <h1 className="text-xl font-bold ml-2 text-white truncate">Getso</h1>}
      </div>
      <nav className="flex-grow">
        {user.role === 'admin' && (
          <>
            {!isCollapsed && <h2 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">General</h2>}
            <NavLink onClick={() => onViewChange('all')} isActive={activeView === 'all'} icon={<DashboardIcon />} isCollapsed={isCollapsed}>
              Dashboard Global
            </NavLink>
          </>
        )}
        <div className="mt-8">
            {!isCollapsed && <h2 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <InstancesIcon className="mr-2" />
                Marcas
            </h2>}
            {isLoading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-9 bg-slate-800 rounded-md animate-pulse mb-2 ${isCollapsed ? 'w-12 mx-auto' : ''}`}></div>
                 ))
            ) : (
                instances.map(instance => (
                <div key={instance.id} className="mb-1">
                    <NavLink
                    onClick={() => onViewChange(instance.id)}
                    isActive={activeView === instance.id}
                    icon={<div className={`w-2 h-2 rounded-full flex-shrink-0 ${activeView === instance.id ? 'bg-sky-400' : 'bg-slate-600'}`}></div>}
                    isCollapsed={isCollapsed}
                    >
                    {instance.name}
                    </NavLink>
                </div>
                ))
            )}
        </div>
      </nav>
      <div className="mt-auto border-t border-slate-800 pt-4">
         <NavLink onClick={() => {}} isActive={false} icon={<AlertIcon />} disabled isCollapsed={isCollapsed}>
          Alertas
        </NavLink>
        {user.role === 'admin' && (
          <NavLink onClick={() => onViewChange('settings')} isActive={activeView === 'settings'} icon={<SettingsIcon />} isCollapsed={isCollapsed}>
            Configuración
          </NavLink>
        )}
        <div className="mt-2 border-t border-slate-800 pt-2">
            <NavLink onClick={logout} isActive={false} icon={<LogoutIcon />} isCollapsed={isCollapsed}>
              Cerrar Sesión
            </NavLink>
        </div>
        <div className="mt-2 border-t border-slate-800 pt-2">
            <button
              onClick={onToggle}
              title={isCollapsed ? "Expandir menú" : "Minimizar menú"}
              className="w-full flex items-center justify-center py-2.5 px-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-200"
            >
              {isCollapsed ? <ChevronsRightIcon /> : <ChevronsLeftIcon />}
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;