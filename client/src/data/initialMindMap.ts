import { MindMapNode, MindMapEdge } from '../types/user';

export const INITIAL_MINDMAP_NODES: MindMapNode[] = [
  {
    id: 'node-neuron',
    label: 'Artificial Neuron (Perceptron)',
    category: 'concept',
    x: 400,
    y: 200,
    details: 'The fundamental building block: z = W · X + b',
    color: '#3FF2E6'
  },
  {
    id: 'node-activations',
    label: 'Activation Functions',
    category: 'concept',
    x: 650,
    y: 180,
    details: 'ReLU, GELU, Sigmoid, Tanh: introduces non-linearity',
    color: '#5CC8FF'
  },
  {
    id: 'node-gradient',
    label: 'Gradient Descent & Loss',
    category: 'formula',
    x: 400,
    y: 380,
    details: 'θ_{t+1} = θ_t - η ∇L: guides model parameter descent',
    color: '#9B7BFF'
  },
  {
    id: 'node-backprop',
    label: 'Backpropagation Chain Rule',
    category: 'formula',
    x: 650,
    y: 380,
    details: 'Reverse-mode automatic differentiation across computational graph',
    color: '#7CFFB2'
  },
  {
    id: 'node-attention',
    label: 'Scaled Dot-Product Attention',
    category: 'concept',
    x: 900,
    y: 280,
    details: 'Attention(Q,K,V) = softmax(QK^T / √d_k) V',
    color: '#FF6B9A'
  },
  {
    id: 'node-leviathan',
    label: 'Autonomous RL Agents',
    category: 'experiment',
    x: 900,
    y: 450,
    details: 'Policy gradient methods & deep ocean world models',
    color: '#E8F6FA'
  }
];

export const INITIAL_MINDMAP_EDGES: MindMapEdge[] = [
  { id: 'e-1', fromId: 'node-neuron', toId: 'node-activations', label: 'activates through' },
  { id: 'e-2', fromId: 'node-neuron', toId: 'node-gradient', label: 'optimized by' },
  { id: 'e-3', fromId: 'node-gradient', toId: 'node-backprop', label: 'calculated via' },
  { id: 'e-4', fromId: 'node-activations', toId: 'node-attention', label: 'builds into' },
  { id: 'e-5', fromId: 'node-backprop', toId: 'node-attention', label: 'propagates to' },
  { id: 'e-6', fromId: 'node-attention', toId: 'node-leviathan', label: 'empowers' }
];
