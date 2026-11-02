import { Flashcard } from '../types/user';

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    chapterId: 'chap-1-twilight',
    concept: 'Artificial Neuron Linear Equation',
    definition: 'z = W · X + b = Σ (w_i * x_i) + b',
    contextExample: 'Calculates the weighted linear combination of sensory inputs before passing into a non-linear activation.',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: 'fc-2',
    chapterId: 'chap-1-twilight',
    concept: 'Vanishing Gradient Phenomenon',
    definition: 'When gradients of loss with respect to early layer weights become exponentially small during backpropagation, halting learning.',
    contextExample: 'Prominent with Sigmoid and Tanh activations when activations saturate into regions where the derivative approaches zero.',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: 'fc-3',
    chapterId: 'chap-2-midnight',
    concept: 'Stochastic Gradient Descent (SGD) with Momentum',
    definition: 'v_{t+1} = β * v_t + (1 - β) * ∇L; θ_{t+1} = θ_t - η * v_{t+1}',
    contextExample: 'Accumulates past gradients like a rolling ball down an oceanic canyon, dampening oscillations across steep ravine walls.',
    intervalDays: 1,
    easeFactor: 2.4,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: 'fc-4',
    chapterId: 'chap-3-abyssal',
    concept: 'Scaled Dot-Product Attention Formula',
    definition: 'Attention(Q, K, V) = softmax(Q K^T / √d_k) V',
    contextExample: 'Computes compatibility scores between Query vector and Key vectors to compute a weighted sum of Value vectors.',
    intervalDays: 3,
    easeFactor: 2.6,
    repetitions: 2,
    nextReviewDate: new Date().toISOString()
  },
  {
    id: 'fc-5',
    chapterId: 'chap-4-hadal',
    concept: 'Markov Decision Process (MDP)',
    definition: 'A 5-tuple (S, A, P, R, γ) formalizing sequential decision making where the next state depends only on the current state and action.',
    contextExample: 'The fundamental mathematical framework for deep reinforcement learning agents exploring unknown underwater environments.',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString()
  }
];
