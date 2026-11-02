import { Course } from '../types/course';

export const DEFAULT_COURSE: Course = {
  id: 'course-deep-learning-ocean',
  subject: 'Autonomous Deep Ocean AI & Neural Architectures',
  title: 'Foundations of Deep Learning: From Perceptrons to Leviathan Models',
  tagline: 'Learn Beyond the Surface: Explore neural frontiers through a 3D bioluminescent expedition',
  instructor: 'Dr. Marina Chen',
  instructorTitle: 'Chief Oceanic Systems Architect & AI Fellow, Deep Oceans Institute',
  instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  description: '[DEMO CONTENT] A comprehensive expedition through neural networks, loss landscapes, attention mechanisms, and deep foundation models. Designed for university students and self-learners, structured across the four oceanic depth zones.',
  depthZones: {
    twilight: {
      name: 'Twilight Zone (0 - 200m)',
      range: '0m - 200m',
      desc: 'Foundational chapters where faint sunlight still reaches. Master core perceptrons, linear algebra vectors, and activation functions.'
    },
    midnight: {
      name: 'Midnight Zone (200 - 1,000m)',
      range: '200m - 1,000m',
      desc: 'Sunlight fades completely. Living bioluminescence lights the way as you traverse high-dimensional gradient descent and backpropagation.'
    },
    abyssal: {
      name: 'Abyssal Zone (1,000 - 4,000m)',
      range: '1,000m - 4,000m',
      desc: 'Vast pressure and ancient trenches. Explore multi-head self-attention, transformer decoders, and generative latent spaces.'
    },
    hadal: {
      name: 'Hadal Trench (4,000 - 11,000m)',
      range: '4,000m - 11,000m',
      desc: 'The deepest, rarest realm. Engage Leviathan challenges, reinforcement learning with environmental rewards, and autonomous frontiers.'
    }
  },
  chapters: [
    {
      id: 'chap-1-twilight',
      number: 1,
      title: 'Perceptrons & Biological Currents',
      reefName: 'Cyan Shallows Reef City',
      depthZone: 'twilight',
      depthMeters: 120,
      summary: '[DEMO CONTENT] Uncover the fundamental building blocks of artificial intelligence inspired by biological neural transmission.',
      accentColor: '#3FF2E6',
      difficulty: 'Foundational',
      estimatedHours: 4.5,
      isUnlocked: true,
      topics: [
        {
          id: 'top-1-1',
          title: 'The Biological & Mathematical Neuron',
          summary: 'Dendrites, axons, synaptic weights, and artificial weighted summation.',
          isUnlocked: true,
          isMastered: true,
          prerequisites: []
        },
        {
          id: 'top-1-2',
          title: 'Non-Linear Activation Functions',
          summary: 'Why non-linearity creates expressive multi-layer decision boundaries.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-1-1']
        },
        {
          id: 'top-1-3',
          title: 'Single-Layer Perceptron Limits',
          summary: 'The XOR problem and the imperative leap to multi-layer architectures.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-1-2']
        }
      ],
      lessons: [
        {
          id: 'les-1-1',
          chapterId: 'chap-1-twilight',
          title: 'The Artificial Neuron & Weighted Summation',
          subtitle: 'Dive Mission 1.1: Calibrating the Synthetic Synapse',
          depthZone: 'twilight',
          depthMeters: 45,
          objective: 'Formulate the mathematical model of a single neuron: z = W · X + b, and calculate forward activations.',
          durationMin: 25,
          xpReward: 150,
          creditReward: 50,
          simulationType: 'neural-weights',
          debriefSummary: 'You have mastered weighted inputs, bias shifts, and linear combinations in artificial neurons.',
          resources: [
            {
              id: 'res-1-1-1',
              title: 'Neural Networks 101: Linear Combinations & Geometric Hyperplanes',
              type: 'pdf',
              url: 'https://arxiv.org/abs/1803.08823',
              meta: 'Document Guide (12 pages)'
            },
            {
              id: 'res-1-1-2',
              title: 'Interactive 3D Decision Surface Simulation',
              type: 'interactive',
              url: '#sandbox',
              meta: 'Lumina Deep Explorer'
            }
          ],
          videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
          contentMarkdown: `### Welcome to the Twilight Zone (45m Depth)
In this introductory dive mission, we examine the fundamental atomic unit of deep learning: **the artificial neuron (Perceptron)**.

#### 1. Biological Analogy vs. Matrix Formulation
In organic organisms like bioluminescent squids, nerve cells transmit electrical impulses across synaptic junctions. In synthetic intelligence, we mathematically model this as:

$$z = \\sum_{i=1}^{n} w_i x_i + b = \\mathbf{w}^T \\mathbf{x} + b$$

Where:
* $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T$ represents your input telemetry vector (e.g., water temperature, pressure, salinity).
* $\\mathbf{w} = [w_1, w_2, \\dots, w_n]^T$ is the learned weight vector governing synaptic strength.
* $b$ is the scalar bias term, shifting the decision hyperplane away from the origin.

#### 2. Geometric Interpretation: Hyperplane Division
A single neuron with two inputs partitions 2D space using a line:
$$w_1 x_1 + w_2 x_2 + b = 0$$

If $\\mathbf{w}^T \\mathbf{x} + b > 0$, the neuron fires; otherwise it remains dormant.

> [!NOTE]
> Notice how the bias term controls how easily the neuron activates without modifying the direction of the boundary normal vector.

#### 3. Hands-on Practice
Use the interactive **Synaptic Weight Manipulator** below to adjust weights $w_1, w_2$ and bias $b$ to classify positive and negative acoustic signals.`,
          quiz: {
            id: 'quiz-1-1',
            title: 'Knowledge Check: Neuron Forward Activation',
            description: 'Verify your mastery of weighted dot products and hyperplane mechanics.',
            passingScore: 70,
            questions: [
              {
                id: 'q-1-1-1',
                question: 'If input vector X = [2.0, -1.0], weights W = [0.5, 3.0], and bias b = -0.5, what is the net linear sum z?',
                type: 'multiple-choice',
                options: [
                  '-2.5',
                  '-1.5',
                  '+0.5',
                  '+1.0'
                ],
                correctIndex: 0,
                explanation: 'Calculation: z = (2.0 * 0.5) + (-1.0 * 3.0) + (-0.5) = 1.0 - 3.0 - 0.5 = -2.5.',
                hint: 'Compute dot product W · X first, then add the bias b.'
              },
              {
                id: 'q-1-1-2',
                question: 'Why is the bias term b essential in an artificial neuron?',
                type: 'multiple-choice',
                options: [
                  'It guarantees that the learning rate is always positive',
                  'It allows the decision boundary to shift away from the coordinate origin (0,0)',
                  'It accelerates GPU tensor cores during backward passes',
                  'It prevents exploding gradients in recurrent networks'
                ],
                correctIndex: 1,
                explanation: 'Without a bias, the hyperplane w · x = 0 is forced to pass directly through the origin (0,0), drastically restricting the family of functions the neuron can separate.',
                hint: 'Consider what happens to w · x when x is all zeros.'
              }
            ]
          }
        },
        {
          id: 'les-1-2',
          chapterId: 'chap-1-twilight',
          title: 'Non-Linear Activation Functions (ReLU, Sigmoid, GELU)',
          subtitle: 'Dive Mission 1.2: Bending the Fabric of Space',
          depthZone: 'twilight',
          depthMeters: 110,
          objective: 'Compare Sigmoid, Tanh, ReLU, and GELU activation functions and evaluate their gradient flow properties.',
          durationMin: 30,
          xpReward: 180,
          creditReward: 60,
          simulationType: 'neural-weights',
          debriefSummary: 'You understood how non-linear activations prevent deep networks from collapsing into a single trivial matrix multiplication.',
          resources: [
            {
              id: 'res-1-2-1',
              title: 'Activation Functions: Mathematical Comparison & Vanishing Gradients',
              type: 'pdf',
              url: 'https://arxiv.org/abs/2010.09458',
              meta: 'Academic Survey'
            }
          ],
          videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
          contentMarkdown: `### Sinking Deeper: Non-Linearity at 110m Depth

If every layer in a deep network only performed linear combinations:
$$y = W_2 (W_1 x + b_1) + b_2 = (W_2 W_1) x + (W_2 b_1 + b_2) = W' x + b'$$
A 100-layer network would mathematically collapse into **a single linear transformation**.

#### Common Activation Functions
1. **Sigmoid $\\sigma(z) = \\frac{1}{1 + e^{-z}}$**:
   * Squeezes real numbers into the range $(0, 1)$.
   * Derivative $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ saturates at large $|z|$, causing the infamous **vanishing gradient problem**.
2. **Rectified Linear Unit (ReLU) $f(z) = \\max(0, z)$**:
   * Constant gradient of 1 for $z > 0$, enabling fast convergence in deep networks.
   * Can suffer from "Dying ReLU" when neurons stay negative and never recover.
3. **Gaussian Error Linear Unit (GELU)**:
   * Smooth, probabilistic non-linearity used in modern Large Language Models and Vision Transformers.`,
          quiz: {
            id: 'quiz-1-2',
            title: 'Activation Function Dynamics',
            description: 'Evaluate your understanding of gradient saturation and non-linear properties.',
            passingScore: 70,
            questions: [
              {
                id: 'q-1-2-1',
                question: 'What is the maximum derivative value of the standard Sigmoid function σ(z)?',
                type: 'multiple-choice',
                options: ['1.0 at z = 0', '0.25 at z = 0', '0.5 at z = 1', 'Infinity at z = 0'],
                correctIndex: 1,
                explanation: 'At z = 0, σ(0) = 0.5. The derivative is σ\'(0) = 0.5 * (1 - 0.5) = 0.25. When chained across many layers, gradients diminish by at least 1/4 each step, leading to vanishing gradients.',
                hint: 'Differentiate σ(z) with respect to z and evaluate at z = 0.'
              }
            ]
          }
        }
      ],
      assignment: {
        id: 'asg-1',
        title: 'Mission Assignment 1: Construct a Binary Ocean Classifier',
        brief: 'Using synthetic oceanic sonar ping features (frequency, amplitude, echo duration), formulate the forward pass equations and implement a 2-layer MLP classifier.',
        deliverable: 'Submit a concise explanation along with your derived weight matrices or Python script.',
        deadline: 'Sunday, 23:59 UTC',
        xpReward: 350,
        creditReward: 120,
        difficulty: 'Foundational'
      }
    },
    {
      id: 'chap-2-midnight',
      number: 2,
      title: 'Loss Landscapes & Gradient Descent',
      reefName: 'Midnight Ridge Citadel',
      depthZone: 'midnight',
      depthMeters: 650,
      summary: '[DEMO CONTENT] Sunlight has dissolved into inky indigo. Navigate high-dimensional optimization, backpropagation, and Adam momentum.',
      accentColor: '#5CC8FF',
      difficulty: 'Intermediate',
      estimatedHours: 6.0,
      isUnlocked: true,
      topics: [
        {
          id: 'top-2-1',
          title: 'Loss Functions & Optimization Landscapes',
          summary: 'Mean Squared Error, Cross-Entropy, and high-dimensional saddle points.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-1-3']
        },
        {
          id: 'top-2-2',
          title: 'Backpropagation & Computational Graphs',
          summary: 'The chain rule in reverse-mode automatic differentiation.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-2-1']
        },
        {
          id: 'top-2-3',
          title: 'Adaptive Optimizers: AdamW & Momentum',
          summary: 'Overcoming ocean ravines using exponential moving averages of gradients.',
          isUnlocked: false,
          isMastered: false,
          prerequisites: ['top-2-2']
        }
      ],
      lessons: [
        {
          id: 'les-2-1',
          chapterId: 'chap-2-midnight',
          title: 'Navigating the Loss Canyon: Gradient Descent Mechanics',
          subtitle: 'Dive Mission 2.1: Descent into the Sub-Surface Ravine',
          depthZone: 'midnight',
          depthMeters: 480,
          objective: 'Derive stochastic gradient updates and compare vanilla SGD against Momentum and Adam.',
          durationMin: 35,
          xpReward: 240,
          creditReward: 80,
          simulationType: 'gradient-descent',
          debriefSummary: 'You visualized the gradient vector pointing in the direction of steepest ascent, and how negative step sizes descend toward minima.',
          resources: [
            {
              id: 'res-2-1-1',
              title: 'Visualizing Loss Landscapes of Neural Nets (Li et al.)',
              type: 'pdf',
              url: 'https://arxiv.org/abs/1712.09913',
              meta: 'Groundbreaking Research'
            }
          ],
          videoUrl: 'https://www.youtube.com/embed/IHZwWFHWa-w',
          contentMarkdown: `### The Midnight Zone (480m Depth)
Sunlight no longer penetrates this depth. In the dark ocean, navigation relies on tactile sonar and gravitational descent. In machine learning, our gravity is **the gradient $\\nabla_\\theta \\mathcal{L}$**.

#### 1. The Optimization Objective
We define an empirical risk loss function $\\mathcal{L}(\\theta)$ over our training data $\\mathcal{D}$:
$$\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)$$

Where $\\eta$ is the learning rate.

#### 2. The Peril of Saddle Points
In high dimensions (millions of parameters), local minima are actually rare; **saddle points** dominate the terrain. A point where gradients are zero, but some eigenvalues of the Hessian are positive and others are negative.

> [!TIP]
> Adam (Adaptive Moment Estimation) tracks both first moments (momentum) and second moments (uncentered variance) to scale learning rates per coordinate.`,
          quiz: {
            id: 'quiz-2-1',
            title: 'Gradient Descent & Loss Topography',
            description: 'Test your understanding of learning rates, momentum, and Hessian matrices.',
            passingScore: 70,
            questions: [
              {
                id: 'q-2-1-1',
                question: 'If the learning rate η is set excessively high during gradient descent, what characteristic behavior occurs?',
                type: 'multiple-choice',
                options: [
                  'Weights converge instantly to global zero',
                  'Loss oscillates wildly and diverges toward infinity or NaN',
                  'Gradients permanently vanish to zero',
                  'The model underfits due to lack of regularization'
                ],
                correctIndex: 1,
                explanation: 'An overly large step size overshoots the minimum and lands on steeper terrain on the opposing wall, causing exponential divergence.',
                hint: 'Think about taking steps larger than the curvature radius of the valley.'
              }
            ]
          }
        }
      ],
      assignment: {
        id: 'asg-2',
        title: 'Mission Assignment 2: Gradient Flow Analysis in Deep MLPs',
        brief: 'Trace backpropagation through a 3-layer neural network by hand or code, computing partial derivatives ∂L/∂W for each weight matrix.',
        deliverable: 'Mathematical derivation or executable Jupyter Notebook submission.',
        deadline: 'Wednesday, 23:59 UTC',
        xpReward: 420,
        creditReward: 150,
        difficulty: 'Intermediate'
      }
    },
    {
      id: 'chap-3-abyssal',
      number: 3,
      title: 'Attention Currents & Transformer Deep Spires',
      reefName: 'Abyssal Spires Sanctuary',
      depthZone: 'abyssal',
      depthMeters: 2400,
      summary: '[DEMO CONTENT] 2,400 meters below. Here, the ocean lights up with living bioluminescence. Discover Scaled Dot-Product Attention, Transformers, and LLM foundations.',
      accentColor: '#9B7BFF',
      difficulty: 'Advanced',
      estimatedHours: 8.5,
      isUnlocked: true,
      topics: [
        {
          id: 'top-3-1',
          title: 'The Sequence Modeling Paradigm Shift',
          summary: 'Why Recurrent Neural Networks (RNNs) gave way to parallelizable self-attention.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-2-3']
        },
        {
          id: 'top-3-2',
          title: 'Scaled Dot-Product Attention: Q, K, V',
          summary: 'Query, Key, and Value projections in vector similarity spaces.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-3-1']
        },
        {
          id: 'top-3-3',
          title: 'Multi-Head Attention & Rotary Positional Embeddings',
          summary: 'Attending to multiple representational subspaces simultaneously.',
          isUnlocked: false,
          isMastered: false,
          prerequisites: ['top-3-2']
        }
      ],
      lessons: [
        {
          id: 'les-3-1',
          chapterId: 'chap-3-abyssal',
          title: 'Scaled Dot-Product Attention & The Transformer Architecture',
          subtitle: 'Dive Mission 3.1: Harnessing the Shimmering Attention Currents',
          depthZone: 'abyssal',
          depthMeters: 2150,
          objective: 'Formulate the canonical equation: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V and explain each component.',
          durationMin: 45,
          xpReward: 320,
          creditReward: 110,
          simulationType: 'ocean-sensor-mesh',
          debriefSummary: 'You mastered Query-Key similarity matrices and how attention vectors dynamically route information across context windows.',
          resources: [
            {
              id: 'res-3-1-1',
              title: 'Attention Is All You Need (Vaswani et al.)',
              type: 'pdf',
              url: 'https://arxiv.org/abs/1706.03762',
              meta: 'Foundational Landmark Paper'
            }
          ],
          videoUrl: 'https://www.youtube.com/embed/ySEx_BqxvVU',
          contentMarkdown: `### The Abyssal Zone (2,150m Depth)
You have arrived at the Abyssal Spires. Pressure is extreme, and light is entirely organic. Here, models do not process information sequentially token-by-token; **they attend globally to all tokens at once**.

#### 1. The Core Attention Equation
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

Where:
* **Query ($Q$)**: What the current token is seeking.
* **Key ($K$)**: What other tokens offer as identity labels.
* **Value ($V$)**: The actual semantic content passed forward.
* **$\\sqrt{d_k}$**: Scaling factor preventing dot products from growing too large into regions where softmax has vanishing gradients.

#### 2. Multi-Head Attention
Instead of performing a single attention function, we project queries, keys, and values $h$ times with learned linear projections:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
This allows the network to jointly attend to syntax, semantics, and distant references.`,
          quiz: {
            id: 'quiz-3-1',
            title: 'Transformer Attention Mechanics',
            description: 'Evaluate your mastery of Query-Key dot products and scaling factors.',
            passingScore: 70,
            questions: [
              {
                id: 'q-3-1-1',
                question: 'Why do we divide the dot-product QK^T by sqrt(d_k) in scaled dot-product attention?',
                type: 'multiple-choice',
                options: [
                  'To ensure matrix inversion is numerically stable',
                  'To prevent dot products from becoming excessively large, which pushes softmax into regions with extremely tiny gradients',
                  'To enforce that all attention probabilities sum to zero',
                  'To convert rectangular tensors into square symmetric matrices'
                ],
                correctIndex: 1,
                explanation: 'For large values of d_k, dot products grow large in magnitude, driving the softmax function into regions where gradients are negligible. Dividing by sqrt(d_k) counteracts this effect.',
                hint: 'Consider the variance of the sum of d_k independent random variables with unit variance.'
              }
            ]
          }
        }
      ],
      assignment: {
        id: 'asg-3',
        title: 'Mission Assignment 3: Implement Multi-Head Attention from Scratch',
        brief: 'Write an implementation of Multi-Head Self-Attention in PyTorch or NumPy, including causal masking for autoregressive decoders.',
        deliverable: 'Jupyter notebook or GitHub repository link with unit tests.',
        deadline: 'Friday, 23:59 UTC',
        xpReward: 600,
        creditReward: 200,
        difficulty: 'Advanced'
      }
    },
    {
      id: 'chap-4-hadal',
      number: 4,
      title: 'The Hadal Trench: Autonomous Leviathan Frontier',
      reefName: 'Hadal Abyssal Trench Spire',
      depthZone: 'hadal',
      depthMeters: 8500,
      summary: '[DEMO CONTENT] The ultimate frontier (8,500m+). Meet the glowing Leviathan in the deepest trench. Reinforcement learning, world models, and autonomous frontier agents.',
      accentColor: '#FF6B9A',
      difficulty: 'Expert',
      estimatedHours: 10.0,
      isUnlocked: true,
      topics: [
        {
          id: 'top-4-1',
          title: 'Reinforcement Learning from Environmental Feedback',
          summary: 'Markov Decision Processes, Policy Gradients, and Q-learning in deep seas.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-3-3']
        },
        {
          id: 'top-4-2',
          title: 'Autonomous World Models & Latent Imagination',
          summary: 'Dreamer architectures: predicting oceanic dynamics inside compressed latent states.',
          isUnlocked: true,
          isMastered: false,
          prerequisites: ['top-4-1']
        },
        {
          id: 'top-4-3',
          title: 'Leviathan Capstone: Autonomous Oceanic Agent',
          summary: 'The grand synthesis challenge: navigation, telemetry perception, and adaptive strategy.',
          isUnlocked: false,
          isMastered: false,
          prerequisites: ['top-4-2']
        }
      ],
      lessons: [
        {
          id: 'les-4-1',
          chapterId: 'chap-4-hadal',
          title: 'Autonomous Agents & Reinforcement Learning in Hostile Environments',
          subtitle: 'Dive Mission 4.1: Meeting the Leviathan at 8,500m',
          depthZone: 'hadal',
          depthMeters: 8500,
          objective: 'Formulate policy gradient objectives: J(θ) = E[Σ γ^t R_t] and analyze reward shaping in uncharted environments.',
          durationMin: 50,
          xpReward: 500,
          creditReward: 250,
          simulationType: 'ocean-sensor-mesh',
          debriefSummary: 'You mastered agent-environment feedback loops, discounted cumulative return, and value estimation in unknown state spaces.',
          resources: [
            {
              id: 'res-4-1-1',
              title: 'Mastering Diverse Domains through World Models (Hafner et al.)',
              type: 'pdf',
              url: 'https://arxiv.org/abs/2301.04104',
              meta: 'Deep Frontier Research'
            }
          ],
          videoUrl: 'https://www.youtube.com/embed/zR11FLZ-O9M',
          contentMarkdown: `### The Hadal Trench (8,500m Depth)
You have reached the floor of the planetary trench. Before you rests the **Leviathan**: a colossal bioluminescent manifestation representing fully autonomous artificial intelligence.

#### 1. Policy Gradients & The Reward Signal
An autonomous submersible agent interacts with its oceanic environment in discrete timesteps:
* States $s_t \\in \\mathcal{S}$ (current depth, pressure, sensor readings)
* Actions $a_t \\in \\mathcal{A}$ (thruster vectors, sonar ping triggers)
* Reward $r_t \\in \\mathbb{R}$ (energy conservation, obstacle avoidance, objective discovery)

The policy gradient theorem states:
$$\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\pi_\\theta}\\left[\\nabla_\\theta \\log \\pi_\\theta(a_t|s_t) Q^{\\pi}(s_t, a_t)\\right]$$

#### 2. The Leviathan Challenge
To master this realm, you must prove your knowledge across all four oceanic depth zones in the **Leviathan Exam Mode**.`,
          quiz: {
            id: 'quiz-4-1',
            title: 'Autonomous RL & Policy Gradient Principles',
            description: 'Evaluate your deep comprehension of reward discounting and policy optimization.',
            passingScore: 70,
            questions: [
              {
                id: 'q-4-1-1',
                question: 'What is the primary role of the discount factor γ (where 0 <= γ < 1) in reinforcement learning?',
                type: 'multiple-choice',
                options: [
                  'To mathematically guarantee that infinite-horizon returns remain bounded and prioritize immediate rewards over distant future rewards',
                  'To normalize input batch gradients to unit variance',
                  'To enforce deterministic exploration in stochastic environments',
                  'To reduce GPU memory allocation during backpropagation'
                ],
                correctIndex: 0,
                explanation: 'A discount factor γ < 1 ensures that the infinite sum of rewards converges to a finite number, while reflecting temporal preference for timely rewards.',
                hint: 'Consider what happens to the infinite geometric series Σ γ^t as t -> ∞.'
              }
            ]
          }
        }
      ],
      assignment: {
        id: 'asg-4',
        title: 'Leviathan Capstone Challenge: Autonomous Navigation Policy',
        brief: 'Design and simulate an autonomous oceanic probe utilizing deep Q-learning or PPO to navigate an obstacle-rich abyssal trench.',
        deliverable: 'Capstone project report, source code, and simulated performance telemetry graphs.',
        deadline: 'Final Exam Week, 23:59 UTC',
        xpReward: 1200,
        creditReward: 500,
        difficulty: 'Expert'
      }
    }
  ]
};
