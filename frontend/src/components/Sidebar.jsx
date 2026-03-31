import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isSidebarOpen, isSidebarCollapsed, closeSidebar } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  let menuItems = [];
  if (user?.role === 'admin') {
    menuItems = [
      { title: 'Admin Dashboard', icon: 'admin_panel_settings', path: '/admin-dashboard' }
    ];
  } else {
    menuItems = [
      { title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
      { title: 'Chat', icon: 'chat_bubble', path: '/chat' },
      { title: 'Quiz', icon: 'quiz', path: '/quiz' },
      { title: 'Progress', icon: 'bar_chart', path: '/progress' },
      { title: 'Concept Maps', icon: 'account_tree', path: '/concept-map' },
      { title: 'Spaced Review', icon: 'event_repeat', path: '/spaced-repetition' },
      { title: 'Collaborative', icon: 'groups', path: '/collaborative' },
      { title: 'Analytics', icon: 'monitoring', path: '/teacher-dashboard' }
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300
          ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeSidebar}
      />

      {/* Sidebar Wrapper */}
      <aside className={`
        border-r border-outline-variant/15 flex flex-col bg-surface-container-low h-screen z-[45] transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed top-0 left-0
      `}>
        {/* Header/Logo Section */}
        <div className="p-4 sm:p-6 flex flex-col h-full justify-between">
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col gap-1 items-center lg:items-start">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="size-8 text-primary cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path
                        clipRule="evenodd"
                        d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  {!isSidebarCollapsed && (
                    <h1 className="text-on-surface text-xl font-headline font-extrabold tracking-tight truncate">IntelliTutor</h1>
                  )}
                </div>
                {/* Mobile Close Button */}
                <button
                  onClick={closeSidebar}
                  className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright transition-colors"
                  aria-label="Close sidebar"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
                </button>
              </div>
              {!isSidebarCollapsed && (
                <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest truncate">Enterprise Node</p>
              )}
            </div>

            {/* Navigation Section */}
            <nav className="flex flex-col gap-1">
              {menuItems.map((item, index) => {
                const active = isActivePath(item.path);
                return (
                  <div
                    key={index}
                    id={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    title={isSidebarCollapsed ? item.title : ''}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all
                      ${active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-on-surface-variant hover:bg-surface-bright/50 hover:text-on-surface'
                      }
                      ${isSidebarCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0" style={{fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0"}}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <p className={`text-sm truncate ${active ? 'font-semibold' : 'font-medium'}`}>{item.title}</p>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* User & Footer Section */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleLogout}
              title={isSidebarCollapsed ? 'Sign Out' : ''}
              className={`
                w-full py-2.5 rounded-xl bg-error/10 text-error text-sm font-bold tracking-tight hover:bg-error/20 transition-colors flex items-center gap-2
                ${isSidebarCollapsed ? 'justify-center' : 'px-4'}
              `}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
              {!isSidebarCollapsed && <span className="truncate">Sign Out</span>}
            </button>
            
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
