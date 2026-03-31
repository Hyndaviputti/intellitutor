import React, { useState } from 'react';
import Layout from '../components/Layout.jsx';
import ConceptMap from '../components/ConceptMap';
import { Search } from 'lucide-react';

const ConceptMapPage = () => {
    const [topicInput, setTopicInput] = useState('Machine Learning');
    const [activeTopic, setActiveTopic] = useState('Machine Learning');

    const handleSearch = (e) => {
        e.preventDefault();
        if (topicInput.trim()) {
            setActiveTopic(topicInput.trim());
        }
    };

    return (
        <Layout>
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 w-full">
            
            <main className="flex-grow container mx-auto px-4 py-8 mt-16 max-w-6xl">
                <div className="mb-8 relative">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Knowledge Maps
                    </h1>
                    <p className="text-slate-400 mb-8 max-w-2xl text-lg">
                        Visualize prerequisite knowledge and conceptually mapped learning pathways. Enter a topic to see its AI-generated structure.
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                        <div className="relative flex-grow max-w-xl">
                            <input 
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                placeholder="Enter a topic (e.g., Python, Neural Networks)"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                        </div>
                        <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                        >
                            Generate Map
                        </button>
                    </form>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur z-0"></div>
                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                Mapping: <span className="text-blue-400">{activeTopic}</span>
                            </h2>
                        </div>
                        <ConceptMap key={activeTopic} topic={activeTopic} />
                    </div>
                </div>
            </main>
        </div>
        </Layout>
    );
};

export default ConceptMapPage;
