import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import api from '../services/api';
import { Calendar, CheckCircle2, AlertCircle, BrainCircuit, RefreshCw } from 'lucide-react';

const SpacedRepetition = () => {
    const [stats, setStats] = useState([]);
    const [dueItems, setDueItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeItem, setActiveItem] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, dueRes] = await Promise.all([
                api.get('/spaced-repetition/stats'),
                api.get('/spaced-repetition/due?limit=5')
            ]);
            setStats(statsRes.data.stats || []);
            setDueItems(dueRes.data.due_items || []);
        } catch (error) {
            console.error("Failed to fetch spaced repetition data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartReview = () => {
        if (dueItems.length > 0) {
            setActiveItem({
                ...dueItems[0],
                questionText: dueItems[0].question_text || `Do you remember the core concepts of ${dueItems[0].topic}?`,
                explanation: dueItems[0].explanation || `The SM-2 algorithm ensures you review ${dueItems[0].topic} just before you're likely to forget it.`
            });
            setShowAnswer(false);
        }
    };

    const handleRate = async (quality) => {
        setSubmitting(true);
        try {
            await api.post('/spaced-repetition/review', {
                topic: activeItem.topic,
                question_id: activeItem.question_id,
                quality
            });
            
            // Remove the reviewed item
            const newDue = dueItems.slice(1);
            setDueItems(newDue);
            
            if (newDue.length > 0) {
                setActiveItem({
                    ...newDue[0],
                    questionText: newDue[0].question_text || `Do you remember the core concepts of ${newDue[0].topic}?`,
                    explanation: newDue[0].explanation || `The SM-2 algorithm ensures you review ${newDue[0].topic} just before you're likely to forget it.`
                });
                setShowAnswer(false);
            } else {
                setActiveItem(null);
                fetchData(); // Refresh stats
            }
        } catch (error) {
            console.error("Failed to submit review:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-200 w-full flex-1 overflow-y-auto">
            <main className="container mx-auto px-4 py-8 mt-16 max-w-4xl">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Spaced Repetition
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            Review concepts right before you forget them for maximum retention.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                ) : activeItem ? (
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-700 shadow-xl max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                                {activeItem.topic}
                            </span>
                            <span className="text-slate-400 text-sm">
                                {dueItems.length} items remaining
                            </span>
                        </div>
                        
                        <div className="mb-8">
                            <h2 className="text-2xl font-medium text-white leading-relaxed">
                                {activeItem.questionText}
                            </h2>
                        </div>

                        {!showAnswer ? (
                            <button
                                onClick={() => setShowAnswer(true)}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-600"
                            >
                                Show Answer
                            </button>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-300">
                                    {activeItem.explanation}
                                </div>
                                
                                <div>
                                    <p className="text-center text-sm text-slate-400 mb-4">How well did you remember this?</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <button 
                                            disabled={submitting}
                                            onClick={() => handleRate(1)}
                                            className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            Blackout (1)
                                        </button>
                                        <button 
                                            disabled={submitting}
                                            onClick={() => handleRate(3)}
                                            className="py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            Hard (3)
                                        </button>
                                        <button 
                                            disabled={submitting}
                                            onClick={() => handleRate(4)}
                                            className="py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            Good (4)
                                        </button>
                                        <button 
                                            disabled={submitting}
                                            onClick={() => handleRate(5)}
                                            className="py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            Perfect (5)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            {stats.length > 0 ? stats.map((stat, i) => (
                                <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${stat.due_items > 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                            <BrainCircuit className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg text-slate-200">{stat.topic}</h3>
                                            <p className="text-sm text-slate-400">{stat.total_items} concepts tracked</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {stat.due_items > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-orange-400 font-bold text-xl">{stat.due_items}</span>
                                                <span className="text-xs text-orange-400/70">Due Review</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">Caught Up</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center p-12 border border-dashed border-slate-700 rounded-2xl">
                                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-300">No Concepts Tracked</h3>
                                    <p className="text-slate-500 mt-2">Complete quizzes to add topics to your Spaced Repetition queue.</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="md:col-span-1">
                            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-20">
                                    <Calendar className="w-24 h-24" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 relative z-10">Daily Review</h3>
                                <p className="text-blue-100 mb-8 relative z-10">
                                    You have {dueItems.length} concepts due for review right now.
                                </p>
                                <button
                                    onClick={handleStartReview}
                                    disabled={dueItems.length === 0}
                                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
                                >
                                    Review Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
        </Layout>
    );
};

export default SpacedRepetition;
