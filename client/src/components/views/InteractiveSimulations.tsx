import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Zap, Compass, Activity, Sliders } from 'lucide-react';
import { SoundEffects } from '../../services/audio';

interface SimulationProps {
  type: 'neural-weights' | 'gradient-descent' | 'ocean-sensor-mesh' | 'strategy-matrix';
}

export const InteractiveSimulation: React.FC<SimulationProps> = ({ type }) => {
  if (type === 'neural-weights') {
    return <NeuralWeightSimulator />;
  }
  if (type === 'gradient-descent') {
    return <GradientDescentSimulator />;
  }
  return <OceanSensorMeshSimulator />;
};

// 1. NEURAL WEIGHT & DECISION BOUNDARY SIMULATOR
const NeuralWeightSimulator: React.FC = () => {
  const [w1, setW1] = useState(1.5);
  const [w2, setW2] = useState(-1.0);
  const [bias, setBias] = useState(0.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample data points to classify (Acoustic ping classification)
  const dataPoints = [
    { x: -0.6, y: -0.5, label: 0 },
    { x: -0.4, y: -0.2, label: 0 },
    { x: -0.7, y: 0.1, label: 0 },
    { x: -0.2, y: -0.6, label: 0 },
    { x: 0.5, y: 0.6, label: 1 },
    { x: 0.7, y: 0.2, label: 1 },
    { x: 0.3, y: 0.7, label: 1 },
    { x: 0.6, y: -0.1, label: 1 }
  ];

  // Calculate accuracy
  let correct = 0;
  dataPoints.forEach((pt) => {
    const z = w1 * pt.x + w2 * pt.y + bias;
    const pred = z >= 0 ? 1 : 0;
    if (pred === pt.label) correct++;
  });
  const accuracy = Math.round((correct / dataPoints.length) * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = 440;
    const h = canvas.height = 260;

    // Draw background grid
    ctx.fillStyle = '#071426';
    ctx.fillRect(0, 0, w, h);

    // Coordinate transforms
    const toScreenX = (x: number) => (x + 1) * 0.5 * w;
    const toScreenY = (y: number) => (1 - (y + 1) * 0.5) * h;

    // Draw axes
    ctx.strokeStyle = 'rgba(143, 167, 179, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Draw decision hyperplane boundary line: w1 * x + w2 * y + bias = 0
    // => y = (-w1 * x - bias) / w2
    ctx.strokeStyle = '#3FF2E6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const xMin = -1.2;
    const xMax = 1.2;
    if (Math.abs(w2) > 0.001) {
      const y1 = (-w1 * xMin - bias) / w2;
      const y2 = (-w1 * xMax - bias) / w2;
      ctx.moveTo(toScreenX(xMin), toScreenY(y1));
      ctx.lineTo(toScreenX(xMax), toScreenY(y2));
    } else {
      const xConst = -bias / w1;
      ctx.moveTo(toScreenX(xConst), 0);
      ctx.lineTo(toScreenX(xConst), h);
    }
    ctx.stroke();

    // Draw data points
    dataPoints.forEach((pt) => {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);
      const z = w1 * pt.x + w2 * pt.y + bias;
      const pred = z >= 0 ? 1 : 0;
      const isRight = pred === pt.label;

      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = pt.label === 1 ? '#7CFFB2' : '#FF6B9A';
      ctx.fill();

      ctx.strokeStyle = isRight ? '#3FF2E6' : '#FF0055';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [w1, w2, bias]);

  return (
    <div className="submersible-glass p-5 rounded-xl border border-[#3FF2E6]/25 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#3FF2E6]">
          <Sliders className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Interactive Sandbox: Synaptic Decision Hyperplane</h4>
        </div>
        <div className="font-mono text-xs px-2.5 py-1 rounded bg-[#0A2A33] border border-[#3FF2E6]/30 text-[#7CFFB2]">
          Classification Accuracy: {accuracy}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="rounded-lg border border-[#3FF2E6]/20 max-w-full shadow-inner" />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Weight 1 (w₁):</span>
              <span className="text-[#3FF2E6]">{w1.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={w1}
              onChange={(e) => { setW1(parseFloat(e.target.value)); SoundEffects.playClick(); }}
              className="w-full accent-[#3FF2E6] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Weight 2 (w₂):</span>
              <span className="text-[#5CC8FF]">{w2.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.05"
              value={w2}
              onChange={(e) => { setW2(parseFloat(e.target.value)); SoundEffects.playClick(); }}
              className="w-full accent-[#5CC8FF] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Bias (b):</span>
              <span className="text-[#9B7BFF]">{bias.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.05"
              value={bias}
              onChange={(e) => { setBias(parseFloat(e.target.value)); SoundEffects.playClick(); }}
              className="w-full accent-[#9B7BFF] cursor-pointer"
            />
          </div>

          <p className="text-xs text-[#8FA7B3] leading-relaxed">
            Adjust the weights and bias above to pivot and translate the decision hyperplane so that the green and pink acoustic signals are cleanly separated!
          </p>
        </div>
      </div>
    </div>
  );
};

// 2. GRADIENT DESCENT SIMULATOR
const GradientDescentSimulator: React.FC = () => {
  const [learningRate, setLearningRate] = useState(0.12);
  const [momentum, setMomentum] = useState(0.7);
  const [posX, setPosX] = useState(2.8);
  const [velocity, setVelocity] = useState(0);
  const [history, setHistory] = useState<number[]>([2.8]);
  const [isRunning, setIsRunning] = useState(false);

  // Non-convex 1D loss function: L(x) = x^2 * sin(x)^2 + 0.1 * x^2
  const lossFunc = (x: number) => Math.pow(x, 2) * Math.pow(Math.sin(x), 2) + 0.1 * Math.pow(x, 2);
  const gradFunc = (x: number) => {
    const eps = 0.001;
    return (lossFunc(x + eps) - lossFunc(x - eps)) / (2 * eps);
  };

  const stepDescent = () => {
    const g = gradFunc(posX);
    const newV = momentum * velocity + (1 - momentum) * g;
    const newX = posX - learningRate * newV;
    setVelocity(newV);
    setPosX(newX);
    setHistory((prev) => [...prev.slice(-30), newX]);
    SoundEffects.playClick();
  };

  const resetDescent = () => {
    setPosX(2.8);
    setVelocity(0);
    setHistory([2.8]);
    setIsRunning(false);
  };

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        stepDescent();
      }, 140);
    }
    return () => clearInterval(timer);
  }, [isRunning, posX, velocity, learningRate, momentum]);

  return (
    <div className="submersible-glass p-5 rounded-xl border border-[#5CC8FF]/25 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#5CC8FF]">
          <Compass className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Interactive Sandbox: High-Dimensional Loss Descent</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-3 py-1 rounded bg-[#0A2A33] border border-[#5CC8FF]/40 text-xs font-mono text-[#5CC8FF] flex items-center gap-1.5 hover:bg-[#5CC8FF]/15"
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? 'Pause' : 'Auto-Descend'}
          </button>
          <button
            onClick={resetDescent}
            className="p-1 rounded bg-[#071426] border border-[#8FA7B3]/30 text-[#8FA7B3] hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-[#03060B] p-4 rounded-lg border border-[#5CC8FF]/20">
          <div className="h-44 relative flex items-center justify-center">
            {/* Visual representation of valley */}
            <svg viewBox="-3 -1 6 12" className="w-full h-full overflow-visible">
              <path
                d="M -3 10 Q -1.5 -0.5 0 0 Q 1.5 -0.5 3 10"
                fill="none"
                stroke="#0A2A33"
                strokeWidth="0.8"
              />
              <path
                d="M -3 8 Q -1.8 1 -1 3 Q -0.3 0 0 0.2 Q 0.5 0 1.2 3 Q 2 1 3 8"
                fill="none"
                stroke="#5CC8FF"
                strokeWidth="0.2"
              />
              {/* Probe marker */}
              <circle
                cx={Math.max(-2.9, Math.min(2.9, posX))}
                cy={lossFunc(Math.max(-2.9, Math.min(2.9, posX)))}
                r="0.25"
                fill="#3FF2E6"
                className="animate-pulse"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mt-2">
            <span>Position: {posX.toFixed(3)}</span>
            <span className="text-[#3FF2E6]">Loss: {lossFunc(posX).toFixed(4)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Learning Rate (η):</span>
              <span className="text-[#5CC8FF]">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.45"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="w-full accent-[#5CC8FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Momentum (β):</span>
              <span className="text-[#9B7BFF]">{momentum.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.95"
              step="0.05"
              value={momentum}
              onChange={(e) => setMomentum(parseFloat(e.target.value))}
              className="w-full accent-[#9B7BFF]"
            />
          </div>

          <button
            onClick={stepDescent}
            className="w-full py-2 rounded bg-[#0A2A33] border border-[#5CC8FF]/50 text-xs font-mono text-[#E8F6FA] hover:bg-[#5CC8FF]/20"
          >
            Step Single Iteration (θ ← θ - η·v)
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. OCEAN SENSOR MESH (ATTENTION ROUTING) SIMULATOR
const OceanSensorMeshSimulator: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(1.0); // sqrt(d_k) factor

  const nodes = [
    { id: 0, label: 'Sensor Alpha (Hydrophone)', x: 60, y: 50 },
    { id: 1, label: 'Sensor Beta (Thermal)', x: 190, y: 35 },
    { id: 2, label: 'Sensor Gamma (Salinity)', x: 140, y: 130 },
    { id: 3, label: 'Sensor Delta (Magnetic)', x: 280, y: 100 }
  ];

  // Simulated Query / Key similarity matrix
  const baseSimilarities = [
    [0.9, 0.6, 0.8, 0.2],
    [0.6, 0.9, 0.4, 0.7],
    [0.8, 0.4, 0.9, 0.3],
    [0.2, 0.7, 0.3, 0.9]
  ];

  // Softmax with temperature: exp(sim / temp) / sum(exp)
  const rawRow = baseSimilarities[selectedNode];
  const expRow = rawRow.map((v) => Math.exp(v / temperature));
  const sumExp = expRow.reduce((a, b) => a + b, 0);
  const attentionWeights = expRow.map((v) => v / sumExp);

  return (
    <div className="submersible-glass p-5 rounded-xl border border-[#9B7BFF]/25 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#9B7BFF]">
          <Activity className="w-5 h-5" />
          <h4 className="font-semibold text-sm">Interactive Sandbox: Scaled Dot-Product Attention Routing</h4>
        </div>
        <div className="text-xs font-mono text-[#3FF2E6]">
          Softmax Scaling (√d_k): {temperature.toFixed(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Sensor Graph */}
        <div className="bg-[#03060B] p-3 rounded-lg border border-[#9B7BFF]/20 relative h-48">
          <svg className="w-full h-full">
            {/* Attention Arcs */}
            {nodes.map((target, idx) => {
              if (idx === selectedNode) return null;
              const source = nodes[selectedNode];
              const weight = attentionWeights[idx];
              return (
                <line
                  key={idx}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#9B7BFF"
                  strokeWidth={Math.max(1, weight * 7)}
                  strokeOpacity={0.2 + weight * 0.8}
                  strokeDasharray={weight > 0.3 ? 'none' : '4 4'}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node, idx) => {
              const isSelected = selectedNode === idx;
              const weight = attentionWeights[idx];
              return (
                <g
                  key={idx}
                  onClick={() => { setSelectedNode(idx); SoundEffects.playClick(); }}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 14 : 10}
                    fill={isSelected ? '#9B7BFF' : '#071426'}
                    stroke={isSelected ? '#3FF2E6' : '#9B7BFF'}
                    strokeWidth={isSelected ? 3 : 1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 22}
                    fill="#E8F6FA"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    N{idx} ({(weight * 100).toFixed(0)}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-mono text-[#8FA7B3] mb-1">
              <span>Attention Temperature / √d_k:</span>
              <span className="text-[#9B7BFF]">{temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#9B7BFF]"
            />
          </div>

          <div className="text-xs text-[#8FA7B3] space-y-1">
            <p><strong>Query Node:</strong> Sensor {selectedNode} ({nodes[selectedNode].label})</p>
            <p>
              Lowering √d_k sharpens attention into a steep winner-take-all argmax, while higher values distribute attention uniformly across all sensors!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
