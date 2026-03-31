import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    applyNodeChanges,
    applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { aiService } from '../services/api';
import { Loader2 } from 'lucide-react';

const ConceptMap = ({ topic }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    useEffect(() => {
        const fetchConceptMap = async () => {
            if (!topic) return;
            setLoading(true);
            setError(null);
            try {
                // We need to implement getConceptMap in api.js
                const data = await aiService.getConceptMap(topic);
                
                // Style nodes based on if they are the central topic
                const styledNodes = data.nodes.map(node => ({
                    ...node,
                    style: {
                        background: node.data.label.toLowerCase() === topic.toLowerCase() ? '#3b82f6' : '#1e293b',
                        color: 'white',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }
                }));

                setNodes(styledNodes);
                setEdges(data.edges);
            } catch (err) {
                setError("Failed to load concept map. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchConceptMap();
    }, [topic]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-400">Generating concept map for {topic}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-200 text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50">
            <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#334155" gap={16} />
                <Controls className="fill-slate-200 bg-slate-800 border-slate-700" />
                <MiniMap 
                    nodeColor={(node) => {
                        return node.data.label.toLowerCase() === topic.toLowerCase() ? '#3b82f6' : '#64748b';
                    }}
                    maskColor="rgba(15, 23, 42, 0.7)"
                    className="bg-slate-800 border-slate-700"
                />
            </ReactFlow>
        </div>
    );
};

export default ConceptMap;
