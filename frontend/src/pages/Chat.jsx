import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { aiAPI } from '../services/api';
import Layout from '../components/Layout.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Brain, 
  Send, 
  Plus, 
  Search, 
  X, 
  Edit2, 
  Check, 
  Copy, 
  MessageSquare,
  Bot,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Share,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  Trash2,
  Download,
  Paperclip,
  Mic
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { toggleSidebar: toggleMainSidebar } = useUI();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const suggestedPrompts = [
    { icon: Lightbulb, text: "Explain quantum entanglement", category: "Physics" },
    { icon: BookOpen, text: "Summarize the French Revolution", category: "History" },
    { icon: Target, text: "Calculate the derivative of x²sin(x)", category: "Math" },
    { icon: TrendingUp, text: "Optimize my study schedule", category: "Efficiency" }
  ];

  useEffect(() => {
    loadChatSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
    }
  }, [sessionId]);

  const loadChatSessions = async () => {
    try {
      const response = await aiAPI.getChatSessions();
      const sessionData = response.data.sessions || [];
      setSessions(sessionData);
      if (sessionData.length > 0 && !sessionId) {
        setSessionId(sessionData[0]._id);
      } else if (sessionData.length === 0) {
        createNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      if (!sessionId) createNewSession();
    }
  };

  const loadChatHistory = async (currentSessionId) => {
    try {
      const response = await aiAPI.getChatHistory(currentSessionId);
      const history = response.data.history || [];
      const formattedMessages = history.flatMap(chat => [
        {
          id: `${chat.id}_user`,
          text: chat.user_message,
          sender: 'user',
          timestamp: new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `${chat.id}_bot`,
          text: chat.ai_response,
          sender: 'bot',
          timestamp: new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
      setMessages(formattedMessages);
    } catch (error) {
      setMessages([]);
    }
  };

  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([]);
  };

  const switchSession = (sid) => {
    setSessionId(sid);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isStreaming]);

  // Simulated streaming effect
  const simulateStreaming = async (text) => {
    setIsStreaming(true);
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, botMessage]);

    const words = text.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setMessages(prev => prev.map(m => m.id === botMessageId ? { ...m, text: currentText } : m));
      await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
    }
    
    setIsStreaming(false);
    loadChatSessions(); // Refresh titles after streaming finishes
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || loading || isStreaming) return;

    const text = inputMessage;
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiAPI.chat({ message: text, session_id: sessionId });
      setLoading(false);
      await simulateStreaming(response.data.response);
    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Neural synch lost. Retrying...', sender: 'bot' }]);
    }
  };

  const deleteMessage = (mid) => {
    setMessages(prev => prev.filter(m => m.id !== mid));
  };

  const copyMessage = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  const deleteSession = async (sid) => {
    try {
      console.log('Deleting session:', sid);
      await aiAPI.deleteChatSession(sid);
      setSessions(prev => prev.filter(s => s._id !== sid));
      if (sid === sessionId) createNewSession();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const exportChat = () => {
    const chatContent = messages.map(msg => `[${msg.timestamp}] ${msg.sender.toUpperCase()}: ${msg.text}`).join('\n\n');
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neural-logs-${sessionId}.txt`;
    a.click();
  };

  // Grouping sessions by date
  const groupSessions = () => {
    const groups = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    sessions.forEach(s => {
      const date = new Date(s.timestamp);
      if (date >= today) groups['Today'].push(s);
      else if (date >= yesterday) groups['Yesterday'].push(s);
      else if (date >= lastWeek) groups['Previous 7 Days'].push(s);
      else groups['Older'].push(s);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  return (
    <Layout noScroll={true}>
      <div className="flex bg-[#070a13] h-full overflow-hidden font-body relative">
        
        {/* Ambient Decorative Blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"></div>
        </div>

        {/* --- History Sidebar (ChatGPT style) --- */}
        {/* Mobile overlay */}
        <div 
          className={`
            fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300
            ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <aside className={`
        border-r border-outline-variant/15 flex flex-col bg-surface-container-low h-full z-[45] transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-3/4 sm:w-96 max-w-[480px]' : 'w-0'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? 'lg:w-96' : 'lg:w-0'}
        ${isSidebarOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        fixed top-0 left-0 lg:relative
        overflow-hidden
      `}>
          <div className="p-3 sm:p-4 flex flex-col h-full w-full shrink-0">
            <div className="h-14 sm:h-16 flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-sm sm:text-base font-bold text-on-surface truncate">Chat History</h2>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright transition-colors"
                aria-label="Close sidebar"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
              </button>
            </div>
            
            <button 
              onClick={createNewSession}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all group mb-4 sm:mb-6"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:rotate-90 transition-transform flex-shrink-0" />
              <span className="text-sm font-bold text-primary truncate">New Chat</span>
            </button>

            <div className="flex-1 space-y-3 sm:space-y-6 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
               {groupSessions().map(([groupName, items]) => (
                  <div key={groupName}>
                     <h3 className="text-[9px] sm:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest px-2 mb-1.5 sm:mb-3 truncate">{groupName}</h3>
                     <div className="space-y-1">
                        {items.map((s) => (
                          <div 
                            key={s._id} 
                            className={`group relative flex items-center gap-1.5 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all cursor-pointer ${s._id === sessionId ? 'bg-white/10' : 'hover:bg-white/[0.04]'}`}
                            onClick={() => switchSession(s._id)}
                          >
                            <MessageSquare className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${s._id === sessionId ? 'text-white' : 'text-on-surface-variant'}`} />
                            <p className={`text-xs sm:text-sm font-medium flex-1 ${s._id === sessionId ? 'text-white' : 'text-on-surface-variant'} truncate`}>
                              {s.last_message || 'New Session'}
                            </p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteSession(s._id); }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-rose-400 transition-all"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>

            <div className="pt-3 sm:pt-4 border-t border-white/5">
              <div className="hover:bg-white/5 rounded-xl p-2 sm:p-3 flex items-center gap-1.5 sm:gap-3 cursor-pointer transition-colors">
                <div className="size-5 sm:size-8 rounded-lg primary-gradient flex items-center justify-center font-black text-white text-[8px] sm:text-[10px] flex-shrink-0">AI</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate">Platinum Sync</p>
                  <p className="text-[9px] sm:text-[10px] text-on-surface-variant opacity-60 truncate">Upgrade for more precision</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Main Chat Interface --- */}
        <main className="flex-1 flex flex-col relative z-20 lg:z-10">
          
          {/* Integrated Header - Dashboard Style */}
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 border-b border-outline-variant/15 glass-nav sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Toggle */}
              <button 
                onClick={toggleMainSidebar}
                className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors"
                aria-label="Toggle Menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">menu</span>
              </button>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors"
                title={isSidebarOpen ? "Close History" : "Open History"}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" /> : <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              
              <div className="flex items-center flex-1 max-w-xs sm:max-w-md">
                <div className="relative w-full group hidden xs:block">
                  <span className="material-symbols-outlined absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] sm:text-[20px]">search</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg sm:rounded-xl pl-8 sm:pl-10 pr-12 sm:pr-16 text-xs sm:text-sm py-1.5 sm:py-2 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Search resources or ask AI..." type="text"/>
                  <kbd className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-1 sm:px-1.5 py-0.5 rounded border border-outline-variant/30 text-[8px] sm:text-[10px] text-on-surface-variant font-mono bg-surface-container hidden sm:block">CMD+K</kbd>
                </div>
                {/* Chat Title for Mobile */}
                <div className="xs:hidden flex items-center">
                  <div className="size-5 sm:size-6 text-primary">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path
                        clipRule="evenodd"
                        d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                        fill="currentColor"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h1 className="text-lg font-bold text-on-surface ml-2">AI Chat</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={exportChat} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">download</span>
                </button>
                <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">share</span>
                </button>
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors relative">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">notifications</span>
                  <span className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-tertiary rounded-full border border-surface"></span>
                </button>
                <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">settings</span>
                </button>
              </div>
              <div className="hidden lg:block h-6 sm:h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-on-surface">{user?.name || 'Alex Mercer'}</p>
                  <p className="text-[8px] text-on-surface-variant">Pro Scholar</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-primary/20 p-0.5">
                  <img className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJEFQcyZzGrR1bedSMcaRTD6WOS0C2ILFu4ldMGf51d6EJ3OLL_0I5l-W4sWW2wM0EN0F7KoIJZqyC6EPeywJMBZQh-nRD1R9bFfdLPWKySjF8O7qm3Wxy4dElKEEM_XCdNEHtreEKX_sumlOY3_X9J5f8JI1YZPkOnyfLXvnt7HcMxyW4Qp-rHIRHyowW3xKRLQVUBAs0fN_0y3aeWrPJpfXw6XReET0oOcKg8IHXKax8rPUuUM5ySDjhlsgNnM7ZmEPFyGbm2tw" alt="User profile avatar"/>
                </div>
              </div>
            </div>
          </header>

          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-0 space-y-8 sm:space-y-12">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    {/* Welcome Section */}
                    <div className="mb-12 sm:mb-16 max-w-3xl">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white tracking-tight mb-6 sm:mb-8">
                        How can I help you today?
                      </h1>
                      <p className="text-on-surface-variant/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12">
                        I'm your AI assistant. Ask me questions, get explanations, or explore new ideas together.
                      </p>
                    </div>
                    
                    {/* Suggested Prompts */}
                    <div className="w-full max-w-4xl px-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {suggestedPrompts.map((p, i) => (
                          <button 
                            key={i} 
                            onClick={() => { setInputMessage(p.text); }}
                            className="group p-4 sm:p-5 text-left rounded-2xl bg-surface-container/50 border border-outline-variant/20 hover:bg-surface-container/80 hover:border-outline-variant/40 transition-all duration-200"
                          >
                            {/* Icon */}
                            <div className="mb-3 sm:mb-4">
                              <div className="size-8 sm:size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <p.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              </div>
                            </div>
                            
                            {/* Content */}
                            <p className="text-sm sm:text-base font-medium text-white mb-2 line-clamp-3 leading-snug">
                              {p.text}
                            </p>
                            <p className="text-xs text-on-surface-variant/50 font-medium">
                              {p.category}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Additional Options */}
                    <div className="mt-12 sm:mt-16 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-6 text-xs sm:text-sm text-on-surface-variant/40">
                        <span>Try uploading a file</span>
                        <span>•</span>
                        <span>Use voice input</span>
                        <span>•</span>
                        <span>Start a new topic</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div 
                      key={msg.id} 
                      className={`group flex flex-col gap-2 sm:gap-3 animate-in fade-in duration-500 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex gap-3 sm:gap-4 max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`size-8 sm:size-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-surface-container-high text-primary border border-outline-variant/20'}`}>
                            {msg.sender === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : (
                              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5">
                                <path
                                  clipRule="evenodd"
                                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                />
                              </svg>
                            )}
                         </div>
                         <div className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                            {msg.sender === 'bot' && (
                              <div className="flex items-center gap-1.5 mb-1 ml-1 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10 w-fit">
                                <span className="material-symbols-outlined text-[10px] text-primary">verified</span>
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Explainable Feedback Active</span>
                              </div>
                            )}
                            <div className={`
                              relative inline-block text-left text-sm sm:text-base leading-relaxed px-4 py-3 rounded-2xl
                              ${msg.sender === 'user' 
                                ? 'bg-blue-600 text-white shadow-sm' 
                                : 'bg-surface-container-high text-white border border-outline-variant/20'
                              }
                            `}>
                               <div className="prose prose-invert max-w-none">
                                 <ReactMarkdown
                                   remarkPlugins={[remarkGfm]}
                                   components={{
                                     h1: ({children}) => <h1 className="text-xl font-bold text-white mb-3 mt-5">{children}</h1>,
                                     h2: ({children}) => <h2 className="text-lg font-bold text-white mb-2 mt-4">{children}</h2>,
                                     h3: ({children}) => <h3 className="text-base font-semibold text-white mb-2 mt-3">{children}</h3>,
                                     h4: ({children}) => <h4 className="text-sm font-semibold text-white mb-2 mt-2">{children}</h4>,
                                     p: ({children}) => <p className="text-gray-100 mb-2 leading-relaxed">{children}</p>,
                                     ul: ({children}) => <ul className="list-disc list-inside text-gray-100 mb-2 space-y-1">{children}</ul>,
                                     ol: ({children}) => <ol className="list-decimal list-inside text-gray-100 mb-2 space-y-1">{children}</ol>,
                                     li: ({children}) => <li className="text-gray-100">{children}</li>,
                                     strong: ({children}) => <strong className="text-primary font-semibold">{children}</strong>,
                                     em: ({children}) => <em className="text-secondary italic">{children}</em>,
                                     code: ({inline, children}) => 
                                       inline ? 
                                         <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code> :
                                         <code className="block bg-surface-container-high p-3 rounded-lg text-sm font-mono text-gray-100 border border-outline-variant/10 overflow-x-auto">{children}</code>,
                                     blockquote: ({children}) => (
                                       <blockquote className="border-l-2 border-primary/30 pl-3 py-2 my-2 bg-primary/5 rounded-r">
                                         {children}
                                       </blockquote>
                                     ),
                                     hr: () => <hr className="border-outline-variant/20 my-3" />,
                                   }}
                                 >
                                   {msg.text}
                                 </ReactMarkdown>
                               </div>
                               
                               {/* Message Actions */}
                               <div className={`
                                 absolute -bottom-6 flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100
                                 ${msg.sender === 'user' ? 'right-0' : 'left-0'}
                               `}>
                                 <button onClick={() => copyMessage(msg.text)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-gray-300 hover:text-white transition-colors" title="Copy">
                                   <Copy className="w-3.5 h-3.5" />
                                 </button>
                                 {msg.sender === 'user' && (
                                   <button onClick={() => deleteMessage(msg.id)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-gray-300 hover:text-white transition-colors">
                                     <Trash2 className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                               </div>
                            </div>
                         </div>
                      </div>
                      {/* Typing indicator for streaming */}
                      {isStreaming && idx === messages.length - 1 && msg.sender === 'bot' && (
                         <div className="flex gap-1 items-center ml-12 mt-1">
                           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                           <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                         </div>
                      )}
                    </div>
                  ))
                )}
                {loading && (
                   <div className="flex gap-4 animate-pulse">
                      <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                         <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary">
                            <path
                              clipRule="evenodd"
                              d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                              fill="currentColor"
                              fillRule="evenodd"
                            />
                         </svg>
                      </div>
                      <div className="flex space-x-2 items-center pt-3">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
             </div>
          </div>

          {/* Input Area - Gemini/OpenAI Style */}
          <div className="p-4 sm:p-6">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative flex items-end w-full">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Message IntelliTutor AI..."
                  rows={1}
                  className="min-h-[56px] pr-32 sm:pr-40 pl-5 py-4 rounded-3xl bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-white text-base resize-none overflow-hidden transition-all duration-200 shadow-lg w-full"
                  style={{ maxHeight: '200px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                  disabled={loading || isStreaming}
                />
                
                {/* Integrated Action Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button
                    type="button"
                    className="size-9 sm:size-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className={`size-9 sm:size-10 flex items-center justify-center rounded-full transition-colors duration-200 ${
                      isRecording 
                        ? 'text-rose-400 bg-rose-500/10 animate-pulse' 
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    title="Voice input"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading || isStreaming}
                    className={`size-9 sm:size-10 flex items-center justify-center rounded-full transition-all duration-200 ${
                      !inputMessage.trim() || loading || isStreaming
                        ? 'text-on-surface-variant/40 bg-surface-container cursor-not-allowed'
                        : 'text-white bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg'
                    }`}
                    title="Send message"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              
              {/* Character Count & Status */}
              <div className="flex items-center justify-between mt-3 px-2">
                <div className="flex items-center gap-4 text-xs text-on-surface-variant/40">
                  <span className="flex items-center gap-1.5">
                    <div className="size-1.5 bg-primary rounded-full animate-pulse"></div>
                    <span>AI Ready</span>
                  </span>
                  <span>•</span>
                  <span>Shift+Enter for new line</span>
                </div>
                {inputMessage.length > 0 && (
                  <div className="text-xs text-on-surface-variant/40">
                    {inputMessage.length} characters
                  </div>
                )}
              </div>
            </div>
          </div>

        </main>
      </div>
    </Layout>
  );
};

export default Chat;
