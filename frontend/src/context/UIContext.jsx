import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    // On mobile, this toggles the overlay sidebar
    // On desktop, it could toggle collapse (optional, but good for UX)
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  const value = {
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setIsSidebarCollapsed
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
