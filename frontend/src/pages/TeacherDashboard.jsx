import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import api from '../services/api';
import { Users, BookOpen, Target } from 'lucide-react';

const TeacherDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/teacher/overview`);
                setOverview(response.data);
            } catch (error) {
                console.error("Failed to fetch teacher overview:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    return (
        <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-200 flex-1 w-full overflow-y-auto">
            <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Analytics Dashboard
                        </h1>
                        <p className="text-slate-400">Your practice quiz performance and learning metrics.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center flex-col items-center h-64">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400">Loading analytics...</p>
                    </div>
                ) : overview ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stats Widgets */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Topics Covered</p>
                                    <h3 className="text-2xl font-bold text-slate-200">{overview.topic_performance.length}</h3>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-green-500/20 text-green-400 rounded-xl">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Practice Completed</p>
                                    <h3 className="text-2xl font-bold text-slate-200">
                                        {overview.topic_performance.reduce((acc, topic) => acc + (topic.total_practice || 0), 0)}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Topics Performance Table */}
                        <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-xl font-bold mb-4">Topic Performance</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                            <th className="pb-3 font-medium">Topic</th>
                                            <th className="pb-3 font-medium">Avg Accuracy</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overview.topic_performance.map((topic, i) => (
                                            <tr key={i} className="border-b border-slate-800/50 border-dashed">
                                                <td className="py-4 font-medium">{topic.topic}</td>
                                                <td className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-12">{Math.round(topic.average_accuracy || 0)}%</span>
                                                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div 
                                                                className={`h-full ${topic.average_accuracy > 80 ? 'bg-green-500' : topic.average_accuracy > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${topic.average_accuracy || 0}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    {topic.average_accuracy > 80 ? (
                                                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Mastered</span>
                                                    ) : topic.average_accuracy > 60 ? (
                                                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">Learning</span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">Struggling</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-2xl bg-slate-900/50">
                        Failed to load data. Ensure you have the right permissions.
                    </div>
                )}
            </main>
        </div>
        </Layout>
    );
};

export default TeacherDashboard;
