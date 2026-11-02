import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, Link, RotateCcw, Share2, Layers, Move } from 'lucide-react';
import { MindMapNode, MindMapEdge } from '../../types/user';
import { SoundEffects } from '../../services/audio';

interface IdeaCurrentsViewProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  onSaveMindMap: (nodes: MindMapNode[], edges: MindMapEdge[]) => void;
}

export const IdeaCurrentsView: React.FC<IdeaCurrentsViewProps> = ({
  nodes,
  edges,
  onSaveMindMap
}) => {
  const [currentNodes, setCurrentNodes] = useState<MindMapNode[]>(nodes);
  const [currentEdges, setCurrentEdges] = useState<MindMapEdge[]>(edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // New Node Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<MindMapNode['category']>('concept');
  const [newDetails, setNewDetails] = useState('');

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const handlePointerDownNode = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    SoundEffects.playClick();
    setSelectedNodeId(id);
    setDraggingNodeId(id);
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingNodeId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x, y } : n))
    );
  };

  const handlePointerUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      onSaveMindMap(currentNodes, currentEdges);
    }
  };

  const handleAddNode = () => {
    if (!newLabel.trim()) return;
    SoundEffects.playSonarPing();

    const categoryColors: Record<MindMapNode['category'], string> = {
      concept: '#3FF2E6',
      definition: '#5CC8FF',
      formula: '#9B7BFF',
      experiment: '#7CFFB2',
      note: '#FF6B9A'
    };

    const newNode: MindMapNode = {
      id: 'node-' + Date.now(),
      label: newLabel,
      category: newCategory,
      details: newDetails,
      x: 350 + (Math.random() - 0.5) * 100,
      y: 250 + (Math.random() - 0.5) * 100,
      color: categoryColors[newCategory]
    };

    const updatedNodes = [...currentNodes, newNode];
    setCurrentNodes(updatedNodes);
    onSaveMindMap(updatedNodes, currentEdges);

    setNewLabel('');
    setNewDetails('');
    setShowAddModal(false);
  };

  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    SoundEffects.playClick();

    const updatedNodes = currentNodes.filter((n) => n.id !== selectedNodeId);
    const updatedEdges = currentEdges.filter(
      (e) => e.fromId !== selectedNodeId && e.toId !== selectedNodeId
    );

    setCurrentNodes(updatedNodes);
    setCurrentEdges(updatedEdges);
    setSelectedNodeId(null);
    onSaveMindMap(updatedNodes, updatedEdges);
  };

  const handleToggleConnect = () => {
    if (!selectedNodeId) return;
    if (!connectingFromId) {
      setConnectingFromId(selectedNodeId);
      SoundEffects.playClick();
    } else if (connectingFromId !== selectedNodeId) {
      // Create new edge
      const newEdge: MindMapEdge = {
        id: 'edge-' + Date.now(),
        fromId: connectingFromId,
        toId: selectedNodeId,
        label: 'synapses into'
      };
      const updatedEdges = [...currentEdges, newEdge];
      setCurrentEdges(updatedEdges);
      setConnectingFromId(null);
      SoundEffects.playSonarPing();
      onSaveMindMap(currentNodes, updatedEdges);
    } else {
      setConnectingFromId(null);
    }
  };

  const handleAutoLayout = () => {
    SoundEffects.playSonarPing();
    const count = currentNodes.length;
    const centerX = 500;
    const centerY = 300;
    const radius = 220;

    const updatedNodes = currentNodes.map((n, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      return {
        ...n,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    setCurrentNodes(updatedNodes);
    onSaveMindMap(updatedNodes, currentEdges);
  };

  return (
    <div className="relative min-h-[calc(100vh-62px)] bg-[#03060B] text-[#E8F6FA] p-4 sm:p-6 flex flex-col">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#3FF2E6] mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>NEURAL CURRENTS · CONCEPT MIND MAP</span>
          </div>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-[#E8F6FA]">
            Idea Currents
          </h1>
          <p className="text-xs text-[#8FA7B3]">
            Floating glowing orbs connected by shimmering threads of light. Drag orbs to reposition or connect synaptic pathways.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddModal(true); SoundEffects.playClick(); }}
            className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#3FF2E6] to-[#5CC8FF] text-[#03060B] font-heading font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(63,242,230,0.4)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Idea Orb</span>
          </button>

          <button
            onClick={handleAutoLayout}
            className="py-2 px-3 rounded-xl border border-white/10 hover:border-[#3FF2E6] text-xs font-mono text-[#8FA7B3] hover:text-white flex items-center gap-1.5"
            title="Auto-organize radial layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Radial Layout</span>
          </button>

          {selectedNodeId && (
            <>
              <button
                onClick={handleToggleConnect}
                className={`py-2 px-3 rounded-xl text-xs font-mono flex items-center gap-1.5 border transition-all ${
                  connectingFromId
                    ? 'bg-[#FF6B9A]/20 border-[#FF6B9A] text-[#FF6B9A] animate-pulse'
                    : 'border-[#3FF2E6]/30 text-[#3FF2E6] hover:bg-[#3FF2E6]/15'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>{connectingFromId ? 'Click Target Orb' : 'Connect Thread'}</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                className="p-2 rounded-xl border border-[#FF6B9A]/30 text-[#FF6B9A] hover:bg-[#FF6B9A]/20"
                title="Delete Selected Node"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        onPointerMove={handlePointerMoveCanvas}
        onPointerUp={handlePointerUp}
        className="flex-1 w-full min-h-[550px] submersible-glass rounded-3xl border border-[#3FF2E6]/25 relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
      >
        {/* Shimmering Threads (SVG Edges) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {currentEdges.map((edge) => {
            const fromNode = currentNodes.find((n) => n.id === edge.fromId);
            const toNode = currentNodes.find((n) => n.id === edge.toId);
            if (!fromNode || !toNode) return null;

            return (
              <g key={edge.id}>
                {/* Glow thread */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#3FF2E6"
                  strokeWidth="2.5"
                  strokeOpacity="0.4"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={(fromNode.x + toNode.x) / 2}
                  cy={(fromNode.y + toNode.y) / 2}
                  r="3"
                  fill="#5CC8FF"
                  className="animate-ping"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Glowing Orbs (Nodes) */}
        {currentNodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isConnecting = connectingFromId === node.id;
          const orbColor = node.color || '#3FF2E6';

          return (
            <div
              key={node.id}
              onPointerDown={(e) => handlePointerDownNode(node.id, e)}
              style={{
                left: node.x,
                top: node.y,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute p-4 rounded-2xl max-w-[200px] border transition-shadow cursor-pointer ${
                isSelected
                  ? 'submersible-glass border-[#3FF2E6] shadow-[0_0_20px_rgba(63,242,230,0.5)] z-30'
                  : 'submersible-glass border-white/15 hover:border-white/40 z-20'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse"
                  style={{
                    backgroundColor: orbColor,
                    boxShadow: `0 0 8px ${orbColor}`
                  }}
                />
                <span className="text-[10px] font-mono uppercase text-[#8FA7B3]">
                  {node.category}
                </span>
              </div>

              <div className="font-heading font-bold text-xs text-[#E8F6FA] mb-1">
                {node.label}
              </div>

              {node.details && (
                <div className="text-[11px] text-[#8FA7B3] line-clamp-2 leading-tight">
                  {node.details}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#03060B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="submersible-glass p-6 rounded-3xl border border-[#3FF2E6]/40 max-w-md w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#E8F6FA]">
              Create New Idea Orb
            </h3>

            <div>
              <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                Concept Title / Formula:
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Residual Connection Gradient Highway"
                className="w-full bg-[#03060B] border border-white/20 rounded-xl p-2.5 text-xs text-[#E8F6FA] focus:outline-none focus:border-[#3FF2E6] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                Category:
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as MindMapNode['category'])}
                className="w-full bg-[#03060B] border border-white/20 rounded-xl p-2.5 text-xs text-[#E8F6FA] font-mono"
              >
                <option value="concept">Concept (Cyan)</option>
                <option value="definition">Definition (Aqua)</option>
                <option value="formula">Formula (Violet)</option>
                <option value="experiment">Experiment (Green)</option>
                <option value="note">Personal Note (Ember)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-[#8FA7B3] block mb-1">
                Synaptic Details / Explanation:
              </label>
              <textarea
                rows={3}
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                placeholder="Brief mathematical intuition or architectural significance..."
                className="w-full bg-[#03060B] border border-white/20 rounded-xl p-2.5 text-xs text-[#E8F6FA] font-mono resize-none focus:outline-none focus:border-[#3FF2E6]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-[#8FA7B3]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNode}
                disabled={!newLabel.trim()}
                className="px-5 py-2 rounded-xl font-heading font-bold text-xs bg-[#3FF2E6] text-[#03060B] disabled:opacity-40"
              >
                Create Orb
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
