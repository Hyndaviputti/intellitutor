import { useUI } from '../context/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children, noScroll = false }) => {
  const { isSidebarCollapsed } = useUI();

  return (
    <div className="flex h-screen bg-surface text-on-surface font-body selection:bg-primary/30 selection:text-white overflow-hidden">
      {/* Sidebar - Fixed width handled in Sidebar component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className={`
        flex-1 h-screen relative flex flex-col
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        ${noScroll ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}
        transition-all duration-300
      `}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
