import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout.jsx';
import api from '../services/api';
import { Users, Play, LogIn, Link2, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const CollaborativeStudy = () => {
    const { user } = useAuth();
    const [view, setView] = useState('join'); // 'join', 'lobby', 'quiz', 'results'
    const [sessionState, setSessionState] = useState(null);
    const [topic, setTopic] = useState('Machine Learning');
    const [difficulty, setDifficulty] = useState('medium');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Quiz State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); 
    const [timeLeft, setTimeLeft] = useState(0);
    const [phase, setPhase] = useState('waiting'); // waiting, active_question, show_leaderboard, completed

    // Initial Join/Create Methods
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/collaborative/create', { topic, difficulty });
            setSessionState(res.data.session);
            setView('lobby');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinCode) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/collaborative/join', { join_code: joinCode });
            await pollSessionState(res.data.session_id);
            setView('lobby');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to join session');
        } finally {
            setLoading(false);
        }
    };

    // Polling Mechanism (Updated for sync)
    const pollSessionState = async (sessionId) => {
        try {
            const res = await api.get(`/collaborative/${sessionId}/state`);
            const data = res.data;
            setSessionState(data);
            
            // Sync phases and questions
            if (data.status !== phase) setPhase(data.status);
            if (data.current_question_index !== currentQuestion) {
                setCurrentQuestion(data.current_question_index);
            }

            // Timer sync
            if (data.phase_end_time) {
                const end = new Date(data.phase_end_time).getTime();
                const now = new Date(data.server_time).getTime();
                const remaining = Math.max(0, Math.floor((end - now) / 1000));
                setTimeLeft(remaining);
            }

            // Auto transition views
            if (['active_question', 'show_leaderboard'].includes(data.status) && view === 'lobby') {
                setView('quiz');
            } else if (data.status === 'completed') {
                setView('results');
            }
        } catch (err) {
            console.error("Failed to poll session state:", err);
        }
    };

    useEffect(() => {
        let interval;
        if (sessionState && (view === 'lobby' || view === 'quiz' || view === 'results')) {
            interval = setInterval(() => {
                pollSessionState(sessionState._id || sessionState.id);
            }, 1000); // Faster polling for better sync
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [sessionState, view, phase]);

    // Timer countdown effect for smoothness
    useEffect(() => {
        if (timeLeft > 0 && phase === 'active_question') {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, phase]);

    // Shared Actions
    const handleStartSession = async () => {
        setLoading(true);
        try {
            await api.post(`/collaborative/${sessionState._id}/start`);
            pollSessionState(sessionState._id);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (selectedOptionIndex) => {
        if (selectedAnswers[currentQuestion] !== undefined || phase !== 'active_question') return;
        
        try {
            await api.post(`/collaborative/${sessionState._id}/submit`, { 
                question_index: currentQuestion, 
                answer_index: selectedOptionIndex 
            });
            
            setSelectedAnswers(prev => ({
                ...prev,
                [currentQuestion]: selectedOptionIndex
            }));
            
            // Re-poll immediately to catch the "All users have submitted" state change
            pollSessionState(sessionState._id);
        } catch (err) {
            console.error("Failed to submit answer", err);
        }
    };

    // RENDERERS
    const renderJoinView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="w-32 h-32" />
                </div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Play className="w-6 h-6 text-blue-400" />
                    Host a Session
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Topic</label>
                        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors" >
                            <option value="easy">Beginner</option>
                            <option value="medium">Intermediate</option>
                            <option value="hard">Advanced</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2" >
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Create Room'}
                    </button>
                </form>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LogIn className="w-32 h-32" />
                </div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <LogIn className="w-6 h-6 text-purple-400" />
                    Join a Room
                </h2>
                <form onSubmit={handleJoin} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Room Code</label>
                        <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors font-mono uppercase tracking-widest text-center text-lg" />
                    </div>
                    <div className="pt-20">
                        <button type="submit" disabled={loading || !joinCode} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2" >
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Join Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderLobbyView = () => {
        const isHost = sessionState.host_id === user?.id;
        return (
            <div className="max-w-2xl mx-auto bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Room Code</h2>
                <div className="text-5xl font-mono font-bold tracking-[0.2em] text-blue-400 mb-8 p-6 bg-slate-950 rounded-xl border border-blue-500/20 inline-block shadow-inner shadow-blue-500/10">{sessionState.join_code}</div>
                <div className="mb-12">
                    <p className="text-lg text-slate-300 mb-2">Topic: <span className="font-bold text-white">{sessionState.topic}</span></p>
                    <p className="text-slate-400">Difficulty: <span className="capitalize">{sessionState.difficulty}</span></p>
                </div>
                <div className="flex items-center justify-center gap-4 mb-12">
                    <Users className="w-6 h-6 text-slate-400" />
                    <span className="text-xl font-medium">{sessionState.participants.length} Participants Joined</span>
                </div>
                <div className="flex justify-center">
                    {isHost ? (
                        <button onClick={handleStartSession} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50" >
                            {loading ? 'Starting...' : 'Start Session'}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center gap-4 text-slate-400">
                            <Clock className="w-8 h-8 animate-pulse text-blue-400" />
                            <p>Waiting for the host to start the session...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderQuizView = () => {
        if (!sessionState.quiz_data || sessionState.quiz_data.length === 0) return <div className="text-center p-12">Waiting for questions...</div>;

        const question = sessionState.quiz_data[currentQuestion];
        const hasAnswered = selectedAnswers[currentQuestion] !== undefined;
        const currentAnswersCount = Object.keys(sessionState.answers?.[currentQuestion] || {}).length;
        const totalParticipants = sessionState.participants.length;

        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold bg-slate-800 px-4 py-2 rounded-lg inline-block">Question {currentQuestion + 1} of {sessionState.quiz_data.length}</h2>
                        {phase === 'active_question' && (
                            <div className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{currentAnswersCount} / {totalParticipants} players answered</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-xl ${timeLeft < 5 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
                            <Clock className="w-5 h-5" />
                            <span>{timeLeft}s</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20">
                            <Trophy className="w-5 h-5" />
                            <span className="font-bold">{sessionState.scores?.[user?.id] || 0} pts</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-8 md:p-12 rounded-2xl border border-slate-700 shadow-xl mb-8 relative">
                    {phase === 'show_leaderboard' && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl border border-blue-500/30">
                            <h3 className="text-2xl font-bold mb-2">Next question starting soon...</h3>
                            <p className="text-slate-400">Correct answer: <span className="text-green-400 font-bold">{question.options[question.correct_answer]}</span></p>
                            <div className="w-64 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(timeLeft / 5) * 100}%` }}></div>
                            </div>
                        </div>
                    )}

                    <h3 className="text-2xl font-medium leading-relaxed mb-8">{question.question}</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {question.options.map((option, idx) => {
                            const isSelected = selectedAnswers[currentQuestion] === idx;
                            const isCorrect = idx === question.correct_answer;
                            const showAnswer = phase === 'show_leaderboard';
                            
                            let bgColor = 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-500 text-slate-200';
                            if (isSelected) bgColor = 'bg-blue-600/20 border-blue-500 text-blue-300';
                            if (showAnswer) {
                                if (isCorrect) bgColor = 'bg-green-500/20 border-green-500 text-green-300';
                                else if (isSelected && !isCorrect) bgColor = 'bg-red-500/20 border-red-500 text-red-300';
                                else bgColor = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-50';
                            } else if (hasAnswered && !isSelected) {
                                bgColor = 'bg-slate-800/30 border-slate-700 text-slate-500 cursor-not-allowed opacity-60';
                            }

                            return (
                                <button key={idx} onClick={() => handleAnswer(idx)} disabled={hasAnswered || showAnswer} className={`w-full text-left p-6 rounded-xl border transition-all font-medium ${bgColor}`} >
                                    <span className="inline-block w-8 font-bold">{String.fromCharCode(65 + idx)}.</span>
                                    {option}
                                    {isSelected && <CheckCircle2 className="float-right text-blue-400" />}
                                    {showAnswer && isCorrect && <CheckCircle2 className="float-right text-green-400" />}
                                </button>
                            );
                        })}
                    </div>

                    {hasAnswered && phase === 'active_question' && (
                        <div className="mt-8 text-center text-slate-400 animate-pulse">
                            Waiting for other players...
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4 overflow-x-auto">
                    <span className="text-sm font-bold text-slate-500 uppercase shrink-0">Live Standings:</span>
                    {Object.entries(sessionState.scores || {}).sort((a,b) => b[1] - a[1]).map(([uid, pts], idx) => (
                        <div key={uid} className={`flex items-center gap-3 px-3 py-1.5 rounded-lg shrink-0 border ${uid === user?.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800 border-slate-700'}`}>
                            <span className="text-xs font-black text-slate-500">{idx + 1}</span>
                            <span className="text-xs text-slate-300 max-w-[80px] truncate">{uid === user?.id ? 'You' : `Player ${uid.substr(0,4)}`}</span>
                            <span className="font-bold text-sm">{pts}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderResultsView = () => {
        const sortedScores = Object.entries(sessionState.scores || {}).sort((a, b) => b[1] - a[1]);
        return (
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-12 inline-block">
                    <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6 border-4 border-yellow-500/40">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Session Complete</h2>
                </div>
                <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 mb-8">
                    <h3 className="text-xl font-bold mb-6 text-slate-300">Final Standings</h3>
                    <div className="space-y-4">
                        {sortedScores.map(([uid, pts], idx) => (
                            <div key={uid} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-500 text-yellow-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="font-medium">{uid === user?.id ? 'You' : `Player ${uid.substr(0,4)}`}</span>
                                </div>
                                <div className="text-xl font-bold font-mono">{pts} <span className="text-sm text-slate-500 font-sans">pts</span></div>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => { setView('join'); setSessionState(null); setJoinCode(''); setCurrentQuestion(0); setScore(0); setSelectedAnswers({}); }} className="text-blue-400 hover:text-blue-300 font-medium" >
                    Leave Room and Return to Lobby
                </button>
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-slate-950 text-slate-200 w-full flex-1 overflow-y-auto">
                <main className="container mx-auto px-4 py-12 mt-16 max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Collaborative Study</h1>
                        {view === 'join' && <p className="text-slate-400 text-lg max-w-2xl mx-auto">Synchronized real-time quiz. Compete and learn with peers.</p>}
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-900/40 border border-red-800 rounded-xl text-red-200 text-center flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-red-400">error</span>
                            {error}
                        </div>
                    )}

                    {view === 'join' && renderJoinView()}
                    {view === 'lobby' && sessionState && renderLobbyView()}
                    {view === 'quiz' && sessionState && renderQuizView()}
                    {view === 'results' && sessionState && renderResultsView()}
                </main>
            </div>
        </Layout>
    );
};

export default CollaborativeStudy;
