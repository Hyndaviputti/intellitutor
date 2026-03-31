import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import { adminAPI, progressAPI } from '../services/api';
import { 
    Users, UserCheck, Shield, Trash2, 
    BookOpen, Upload, Activity, TrendingUp, 
    BarChart3, AlertCircle, CheckCircle2, 
    MoreVertical, Search, Filter, Plus, FileJson,
    Settings, Key, RefreshCw, ShieldCheck, Cpu, X
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [topics, setTopics] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [systemConfig, setSystemConfig] = useState({ GEMINI_API_KEY: '', QWEN_API_KEY: '' });
    const [newKeys, setNewKeys] = useState({ GEMINI_API_KEY: '', QWEN_API_KEY: '' });
    const [testResults, setTestResults] = useState(null);
    const [testing, setTesting] = useState(false);
    
    // Performance View States
    const [selectedUserProgress, setSelectedUserProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(false);

    // Form states
    const [newTopic, setNewTopic] = useState({ title: '', description: '', category: '', difficulty: 'beginner' });
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id: string, title: string }

    useEffect(() => {
        fetchAllData();
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await adminAPI.getConfig();
            setSystemConfig(res.data);
            setNewKeys(res.data);
        } catch (err) {
            console.error("Failed to fetch system config:", err);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [usersRes, analyticsRes, activitiesRes, topicsRes] = await Promise.all([
                adminAPI.getUsers(),
                adminAPI.getAnalytics(),
                adminAPI.getActivities(),
                adminAPI.getTopics()
            ]);

            setUsers(usersRes.data.users);
            setStats(analyticsRes.data.stats);
            setTrends(analyticsRes.data.trends);
            setActivities(activitiesRes.data.activities);
            setTopics(topicsRes.data.topics);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError(err.response?.data?.error || "Failed to load administrative data. Ensure you have the 'admin' role.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            showSuccess("User deleted successfully");
        } catch (err) {
            setError("Failed to delete user");
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            showSuccess(`User role updated to ${newRole}`);
        } catch (err) {
            setError("Failed to update user role");
        }
    };

    const handleViewPerformance = async (userId) => {
        setLoadingProgress(true);
        try {
            const res = await progressAPI.getProgress(userId);
            setSelectedUserProgress(res.data);
        } catch (err) {
            setError("Failed to fetch user performance analytics.");
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleAddTopic = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.addTopic(newTopic);
            setNewTopic({ title: '', description: '', category: '', difficulty: 'beginner' });
            showSuccess("Topic added successfully");
            const topicsRes = await adminAPI.getTopics();
            setTopics(topicsRes.data.topics);
        } catch (err) {
            setError("Failed to add topic");
        }
    };

    const handleDeleteTopic = async (topicId) => {
        try {
            await adminAPI.deleteTopic(topicId);
            setTopics(topics.filter(t => t._id !== topicId));
            setDeleteConfirm(null);
            showSuccess("Topic deleted successfully");
        } catch (err) {
            setError("Failed to delete topic");
            setDeleteConfirm(null);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const res = await adminAPI.uploadContent(formData);
            showSuccess(res.data.message);
            fetchAllData();
        } catch (err) {
            setError("Failed to upload content. Ensure JSON format is correct.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateConfig = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await adminAPI.updateConfig(newKeys);
            showSuccess("System configuration updated successfully");
            fetchConfig();
        } catch (err) {
            setError("Failed to update system configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleTestKeys = async () => {
        setTesting(true);
        setTestResults(null);
        try {
            const res = await adminAPI.testKeys();
            setTestResults(res.data);
        } catch (err) {
            setError("Failed to run system diagnostics");
        } finally {
            setTesting(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !stats) {
        return (
            <Layout>
                <div className="flex justify-center flex-col items-center h-screen bg-slate-950">
                    <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium animate-pulse">Initializing Administrative Terminal...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-950 text-slate-200 flex-1 w-full overflow-y-auto">
                <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
                    
                    {/* PERFORMANCE MODAL */}
                    {selectedUserProgress && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tight">Neural Performance Report</h3>
                                    </div>
                                    <button onClick={() => setSelectedUserProgress(null)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-950/50 p-6 rounded-[1.5rem] border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Total Attempts</p>
                                        <p className="text-3xl font-black text-white">{selectedUserProgress.total_attempts}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-6 rounded-[1.5rem] border border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2">Knowledge Points</p>
                                        <p className="text-3xl font-black text-orange-500">{selectedUserProgress.total_correct_answers}</p>
                                    </div>
                                    <div className="col-span-2 bg-slate-950/50 p-6 rounded-[1.5rem] border border-slate-800">
                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Global Accuracy</p>
                                                <p className="text-4xl font-black text-white">{selectedUserProgress.overall_accuracy}%</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" 
                                                style={{ width: `${selectedUserProgress.overall_accuracy}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Topic Mastery</h4>
                                <div className="space-y-3">
                                    {Object.keys(selectedUserProgress.topic_stats?.topics || {}).length > 0 ? (
                                        Object.entries(selectedUserProgress.topic_stats.topics).map(([topic, stats]) => (
                                            <div key={topic} className="flex flex-col gap-2 p-4 bg-slate-950/30 border border-slate-800/50 rounded-2xl">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-300">{topic}</span>
                                                    <span className="text-sm font-black text-orange-500">{stats.accuracy?.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-orange-500 rounded-full opacity-80" 
                                                        style={{ width: `${stats.accuracy}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                                            <p className="text-xs text-slate-500 font-bold italic uppercase tracking-widest">No topic data recorded</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DELETE CONFIRMATION MODAL */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                                        <Trash2 className="w-10 h-10 text-red-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Security Protocol</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">
                                        Are you certain you wish to delete <span className="text-red-400 font-bold">"{deleteConfirm.title}"</span>? This action is permanent and will remove all associated pre-defined questions.
                                    </p>
                                    <div className="flex w-full gap-4">
                                        <button 
                                            onClick={() => setDeleteConfirm(null)}
                                            className="flex-1 py-4 bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTopic(deleteConfirm.id)}
                                            className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all border border-red-400/30"
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                                ADMIN CONTROL CENTER
                            </h1>
                            <p className="text-slate-400 mt-1 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-orange-500" />
                                Secured Management Interface v2.0
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={fetchAllData}
                                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-bold"
                            >
                                <Activity className="w-4 h-4 text-green-400" />
                                Refresh System
                            </button>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                            <button onClick={() => setError(null)} className="ml-auto text-red-400/50 hover:text-red-400">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-2xl text-green-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{successMsg}</p>
                        </div>
                    )}

                    {/* Tabs Navigation */}
                    <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-none">
                        {[
                            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'content', label: 'Content', icon: BookOpen },
                            { id: 'activity', label: 'System Log', icon: Activity },
                            { id: 'system', label: 'Settings', icon: Settings }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-3 font-bold transition-all shrink-0 ${
                                    activeTab === tab.id 
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 ring-1 ring-orange-400/50' 
                                    : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* TAB CONTENT: ANALYTICS */}
                    {activeTab === 'analytics' && stats && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Scholars', value: stats.total_users, sub: 'Registered Accounts', color: 'orange', icon: Users },
                                    { label: 'Total Assessments', value: stats.total_quizzes, sub: 'Quizzes Completed', color: 'blue', icon: BookOpen },
                                    { label: 'Global Accuracy', value: `${stats.global_accuracy}%`, sub: 'Average Performance', color: 'green', icon: TrendingUp },
                                    { label: 'Active Admins', value: users.filter(u => u.role === 'admin').length, sub: 'Control Staff', color: 'purple', icon: Shield }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-150 duration-700`}></div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`p-3 bg-${stat.color}-500/20 text-${stat.color}-400 rounded-2xl`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Trends Chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-bold flex items-center gap-3">
                                            <TrendingUp className="w-6 h-6 text-orange-500" />
                                            Global Learning Trends
                                        </h3>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full uppercase tracking-widest">Last 7 Days</span>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trends}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Popular Topics */}
                                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                    <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                                        <TrendingUp className="w-6 h-6 text-orange-500" />
                                        Popular Subjects
                                    </h3>
                                    <div className="space-y-6">
                                        {stats.popular_topics.map((item, idx) => (
                                            <div key={idx} className="group cursor-default">
                                                <div className="flex justify-between items-end mb-2">
                                                    <span className="text-sm font-bold text-slate-300 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{item.topic}</span>
                                                    <span className="text-xs font-black text-orange-500">{item.count} sessions</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full" 
                                                        style={{ width: `${(item.count / stats.total_quizzes) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: USERS */}
                    {activeTab === 'users' && (
                        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/20">
                                <h3 className="text-xl font-bold">Registry Database</h3>
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Scan by identity or secure email..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                                            <th className="px-6 pb-4">Identity</th>
                                            <th className="px-6 pb-4">Status / Role</th>
                                            <th className="px-6 pb-4">Enrollment Date</th>
                                            <th className="px-6 pb-4 text-right">Administrative Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className="group hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-sm">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{u.name}</p>
                                                            <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <select 
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                        className={`text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none transition-all appearance-none cursor-pointer ${
                                                            u.role === 'admin' 
                                                            ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                                                            : 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                                        }`}
                                                    >
                                                        <option value="student" className="bg-slate-950 text-slate-200">Student</option>
                                                        <option value="admin" className="bg-slate-950 text-slate-200">System Admin</option>
                                                        <option value="teacher" className="bg-slate-950 text-slate-200">Instructor</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-mono text-slate-500">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                                </td>
                                                <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleViewPerformance(u.id)}
                                                        className="p-2.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl transition-all"
                                                        title="View Performance"
                                                    >
                                                        <Activity className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2.5 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                                                        title="Terminate Account"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: CONTENT */}
                    {activeTab === 'content' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
                            {/* Upload Content Card */}
                            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-orange-600/20 text-orange-500 rounded-2xl">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Bulk Content Ingestion</h3>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Administer mass knowledge updates of topics or questions via secure JSON data packets. 
                                    Ensure JSON compliance before execution.
                                </p>
                                
                                <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-12 text-center group hover:border-orange-500/50 hover:bg-orange-500/5 transition-all">
                                    <input 
                                        type="file" 
                                        id="content-upload" 
                                        className="hidden" 
                                        accept=".json"
                                        onChange={handleFileUpload}
                                    />
                                    <label htmlFor="content-upload" className="cursor-pointer flex flex-col items-center">
                                        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-orange-950/20 transition-all">
                                            <FileJson className="w-8 h-8 text-orange-500" />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-sm mb-2">Initialize Data Upload</p>
                                        <p className="text-xs text-slate-500 font-medium italic">Supports .JSON encrypted files only</p>
                                    </label>
                                </div>

                                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="w-4 h-4 text-slate-500 mt-1" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">System Requirement</p>
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Topics should include title, description, and category. Questions must contain correct_answer index.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Topic Addition */}
                            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-blue-600/20 text-blue-500 rounded-2xl">
                                        <Plus className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold">Inject Individual Topic</h3>
                                </div>
                                <form onSubmit={handleAddTopic} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block mx-1">Subject Narrative</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-700 font-bold"
                                                placeholder="e.g. Quantum Cryptography"
                                                value={newTopic.title}
                                                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block mx-1">Classification</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-700 font-bold"
                                                placeholder="e.g. Physics"
                                                value={newTopic.category}
                                                onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block mx-1">Target Tier</label>
                                            <select 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-bold"
                                                value={newTopic.difficulty}
                                                onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block mx-1">Module Description</label>
                                            <textarea 
                                                required
                                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all h-24 placeholder:text-slate-700 font-medium"
                                                placeholder="Define the scope and objectives for this learning unit..."
                                                value={newTopic.description}
                                                onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all border border-orange-400/30"
                                    >
                                        Execute Topic Injection
                                    </button>
                                </form>
                            </div>

                            {/* Active Content Roster - full width or side by side */}
                            <div className="lg:col-span-2 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-orange-500" />
                                    Active Repository Modules
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {topics.length > 0 ? topics.map((t, i) => (
                                        <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-[2rem] group hover:border-orange-500/30 transition-all hover:bg-slate-900/50">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[9px] font-black uppercase text-slate-500 tracking-widest">{t.category}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter ${
                                                        t.difficulty === 'advanced' ? 'text-red-400' : t.difficulty === 'intermediate' ? 'text-orange-400' : 'text-blue-400'
                                                    }`}>{t.difficulty}</span>
                                                    <button 
                                                        onClick={() => setDeleteConfirm({ id: t._id, title: t.title })} 
                                                        className="text-slate-500 hover:text-red-500 transition-colors" 
                                                        title="Delete Topic"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <h4 className="font-black text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight mb-2 truncate">{t.title}</h4>
                                            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">{t.description}</p>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                                            <p className="text-slate-500 font-bold italic">No custom topics found in the secure repository.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: ACTIVITY */}
                    {activeTab === 'activity' && (
                        <div className="bg-slate-900/40 rounded-[2.5rem] border border-slate-800 overflow-hidden animate-in fade-in duration-500">
                            <div className="p-8 border-b border-slate-800 bg-slate-900/20 flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-orange-500" />
                                    Global Telemetry Feed
                                </h3>
                                <span className="text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">Live Traffic Scan</span>
                            </div>
                            <div className="p-4 sm:p-8 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                {activities.length > 0 ? activities.map((act, i) => (
                                    <div key={i} className="flex gap-6 items-start relative pb-6 border-slate-800 last:border-0 last:pb-0">
                                        {/* Line */}
                                        {i !== activities.length - 1 && (
                                            <div className="absolute left-6 top-12 bottom-0 w-[2px] bg-gradient-to-b from-slate-800 to-transparent"></div>
                                        )}
                                        
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 z-10 ${
                                            act.type === 'quiz' ? 'bg-orange-600/10 border-orange-500/20 text-orange-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-500'
                                        }`}>
                                            {act.type === 'quiz' ? <BookOpen className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                                        </div>
                                        
                                        <div className="flex-1 space-y-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 group hover:border-slate-700 transition-all">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white tracking-tight">{act.user_name}</span>
                                                    <span className="text-[10px] text-slate-600">•</span>
                                                    <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{act.user_email}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 uppercase tracking-widest">
                                                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(act.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium">
                                                Completed <span className="text-orange-400 font-bold">{act.topic}</span> assessment with a score of <span className={`${act.score / act.total >= 0.8 ? 'text-green-400' : 'text-orange-400'} font-black italic`}>{act.score}/{act.total}</span>.
                                            </p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-24 text-center">
                                        <Activity className="w-16 h-16 text-slate-800 mx-auto mb-6 opacity-20" />
                                        <p className="text-slate-500 font-bold italic">No telemetry data detected in the current session cycle.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB CONTENT: SYSTEM CONFIG */}
                    {activeTab === 'system' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-red-600/20 text-red-500 rounded-2xl">
                                            <Cpu className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">AI Core Configuration</h3>
                                            <p className="text-xs text-slate-500 font-medium">Manage primary and fallback intelligence services</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleUpdateConfig} className="space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mx-1 flex items-center gap-2">
                                                    <Key className="w-3 h-3 text-orange-500" />
                                                    Google Gemini API Key
                                                </label>
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="password"
                                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-800 font-mono"
                                                        placeholder={systemConfig.GEMINI_API_KEY}
                                                        value={newKeys.GEMINI_API_KEY}
                                                        onChange={(e) => setNewKeys({...newKeys, GEMINI_API_KEY: e.target.value})}
                                                    />
                                                    {testResults?.GEMINI_API_KEY && (
                                                        <div className={`px-4 py-4 rounded-2xl flex items-center gap-2 border font-bold text-xs uppercase tracking-tighter ${
                                                            testResults.GEMINI_API_KEY.status === 'success' 
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                            {testResults.GEMINI_API_KEY.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                            {testResults.GEMINI_API_KEY.status === 'success' ? 'Verified' : 'Invalid'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mx-1 flex items-center gap-2">
                                                    <Key className="w-3 h-3 text-orange-500" />
                                                    OpenRouter (Qwen) API Key
                                                </label>
                                                <div className="flex gap-4">
                                                    <input 
                                                        type="password"
                                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-slate-800 font-mono"
                                                        placeholder={systemConfig.QWEN_API_KEY}
                                                        value={newKeys.QWEN_API_KEY}
                                                        onChange={(e) => setNewKeys({...newKeys, QWEN_API_KEY: e.target.value})}
                                                    />
                                                    {testResults?.QWEN_API_KEY && (
                                                        <div className={`px-4 py-4 rounded-2xl flex items-center gap-2 border font-bold text-xs uppercase tracking-tighter ${
                                                            testResults.QWEN_API_KEY.status === 'success' 
                                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        }`}>
                                                            {testResults.QWEN_API_KEY.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                            {testResults.QWEN_API_KEY.status === 'success' ? 'Verified' : 'Invalid'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                            <button 
                                                type="submit"
                                                className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-lg shadow-orange-950/20"
                                            >
                                                Update Core Credentials
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={handleTestKeys}
                                                disabled={testing}
                                                className="px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {testing ? (
                                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                                )}
                                                {testing ? 'Scanning...' : 'Test Connections'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Security Note */}
                                <div className="bg-orange-600/5 border border-orange-500/20 p-6 rounded-3xl flex gap-4 items-start">
                                    <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-orange-400 mb-1">Administrative Security Protocol</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Key updates are written directly to the server's encrypted environment layer. 
                                            Access is strictly audited and limited to root administrators. 
                                            Existing services will automatically reload with the new credentials upon successful verification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Service Health Status
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Primary Intelligence', service: 'Gemini 2.0 Flash', key: 'GEMINI_API_KEY' },
                                            { name: 'Secondary Fallback', service: 'Qwen 3 235B', key: 'QWEN_API_KEY' },
                                            { name: 'Database Repository', service: 'MongoDB Atlas', status: 'online' }
                                        ].map((svc, i) => (
                                            <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{svc.name}</p>
                                                    <p className="text-xs font-bold text-white">{svc.service}</p>
                                                </div>
                                                <div className={`w-2.5 h-2.5 rounded-full ${
                                                    svc.status === 'online' || testResults?.[svc.key]?.status === 'success'
                                                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse'
                                                    : testResults?.[svc.key]?.status === 'error'
                                                    ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                                    : 'bg-slate-700'
                                                }`}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </Layout>
    );
};

export default AdminDashboard;
