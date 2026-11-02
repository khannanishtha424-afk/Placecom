import { Course, Lesson } from '../types/course';

export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export interface EchoMessage {
  id: string;
  sender: 'user' | 'echo';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'navigate_lesson' | 'try_quiz' | 'open_flashcards';
    payload?: string;
  };
}

export const AiTutorService = {
  isConfigured(apiKey?: string): boolean {
    return Boolean(apiKey && apiKey.trim().length > 10);
  },

  async askEcho(
    prompt: string,
    context: {
      course: Course;
      currentLesson?: Lesson;
      level?: ExplanationLevel;
      apiKey?: string;
    }
  ): Promise<{ response: string; isLive: boolean; suggestedAction?: EchoMessage['suggestedAction'] }> {
    const isLive = this.isConfigured(context.apiKey);

    // If live API key provided, attempt calling the LLM endpoint
    if (isLive && context.apiKey) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + context.apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are ECHO, the Lumina Deep Academy Holographic AI Tutor. Current course: ${context.course.title}. Current lesson: ${context.currentLesson?.title || 'Ocean Bridge'}. Target learner level: ${context.level || 'intermediate'}. Please answer the student prompt accurately, encouraging deep oceanic exploration and clarity. Prompt: ${prompt}`
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              response: text,
              isLive: true
            };
          }
        }
      } catch (err) {
        console.warn('Live API request failed, falling back to simulated neural knowledge bank', err);
      }
    }

    // High-Fidelity Demo Knowledge Engine with domain comprehension
    const lower = prompt.toLowerCase();
    const level = context.level || 'intermediate';

    // 1. Activation functions
    if (lower.includes('activation') || lower.includes('relu') || lower.includes('sigmoid')) {
      if (level === 'beginner') {
        return {
          response: `**ECHO Concept Guide: Activation Functions (Beginner)**

Think of a neuron like a light dimmer switch with a threshold. 
* Without an activation function, chaining neurons together is like putting five magnifying glasses in a row—everything is still just a flat magnification of the original image!
* **ReLU (Rectified Linear Unit)** is simple: if the signal is negative, it stays off ($0$). If positive, it passes right through. That simple bend allows networks to draw complex decision boundaries like outlines of underwater sea creatures!`,
          isLive: false,
          suggestedAction: {
            label: 'Test ReLU in Interactive Sandbox',
            actionType: 'navigate_lesson',
            payload: 'les-1-2'
          }
        };
      } else {
        return {
          response: `**ECHO Concept Guide: Activation Dynamics (${level.toUpperCase()})**

Non-linear activations $\\sigma(z)$ break the affine group structure of composite linear maps:
$$\\mathbf{y} = W_L \\sigma(W_{L-1} \\dots \\sigma(W_1 \\mathbf{x} + \\mathbf{b}_1) \\dots + \\mathbf{b}_{L-1}) + \\mathbf{b}_L$$

Key Trade-offs:
1. **Sigmoid $\\sigma(z) = \\frac{1}{1 + e^{-z}}$**: Squeezes outputs to $(0, 1)$, but $\\sigma'(z) \\le 0.25$, causing gradients to vanish across deep depths.
2. **ReLU $\\max(0, z)$**: Scale-invariant gradient of $1.0$ for $z > 0$, preventing vanishing gradients, though susceptible to inactive "dying" states if bias pushes $z < 0$ globally.
3. **GELU $x \\Phi(x)$**: Smoothed probabilistic activation utilized in GPT and Transformer backbones.`,
          isLive: false
        };
      }
    }

    // 2. Attention and Transformers
    if (lower.includes('attention') || lower.includes('transformer') || lower.includes('q k v') || lower.includes('query')) {
      return {
        response: `**ECHO Deep Dive: Scaled Dot-Product Attention**

Attention allows each token in a sentence (or oceanic sensor in a swarm) to broadcast what it needs and what it knows:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V$$

* **Query ($Q$)**: The question or search parameter from token $i$.
* **Key ($K$)**: The index tag or identity of token $j$.
* **Value ($V$)**: The raw factual vector transmitted if $Q$ and $K$ match.
* **$\\sqrt{d_k}$**: Scaling factor. When vector dimensionality $d_k$ is high (e.g., 64 or 128), dot products have large variance $\\approx d_k$. Without dividing by $\\sqrt{d_k}$, softmax turns into an extreme one-hot vector with almost zero gradient flow.`,
        isLive: false,
        suggestedAction: {
          label: 'Inspect Abyssal Spires Chapter',
          actionType: 'navigate_lesson',
          payload: 'les-3-1'
        }
      };
    }

    // 3. Gradient descent & optimization
    if (lower.includes('gradient') || lower.includes('learning rate') || lower.includes('adam') || lower.includes('loss')) {
      return {
        response: `**ECHO Telemetry: Gradient Descent & Optimization Topography**

Imagine steering our submersible through a deep, jagged underwater canyon without headlights:
* The **Gradient $\\nabla_\\theta \\mathcal{L}$** points directly up the steepest underwater ridge.
* Therefore, by stepping in the **opposite direction ($-\\eta \\nabla_\\theta \\mathcal{L}$)**, the submersible descends toward the lowest point (minimal error).

**Common Pitfalls:**
* **Learning rate too large:** Submersible crashes from one canyon wall to another, diverging into the void.
* **Learning rate too small:** Progress is infinitesimally slow, burning precious computational oxygen.
* **Momentum:** Adds velocity from previous steps ($v_t = \\beta v_{t-1} + (1-\\beta)g_t$), rolling smoothly through shallow ravines.`,
        isLive: false
      };
    }

    // 4. Summarize or practice questions
    if (lower.includes('summarize') || lower.includes('summary') || lower.includes('recap')) {
      return {
        response: `**ECHO Mission Summary: ${context.currentLesson ? context.currentLesson.title : 'Current Exploration Zone'}**

1. **Core Thesis:** Deep architectures require non-linearities and stable gradient transport to construct hierarchical representations of high-dimensional environments.
2. **Mathematical Anchor:** Forward inference is tensor contraction followed by non-linear gating; optimization is reverse-mode automatic differentiation.
3. **Explorer Takeaway:** Mastery of activation saturation and parameter scale is the difference between an unstable dive and reaching the Hadal floor.`,
        isLive: false
      };
    }

    // 5. Next steps or recommendation
    if (lower.includes('next') || lower.includes('recommend') || lower.includes('what should i do')) {
      return {
        response: `**ECHO Navigation Recommendation:**

Based on your current telemetry and depth profile (Zone: Midnight, 650m):
* **Recommended Mission:** Complete the *Loss Landscapes & Gradient Descent* practice quiz to unlock the *AdamW Momentum* chapter node.
* **Revision Priority:** Revisit the *Vanishing Gradient* flashcard in the Tidal Memory Vortex—it is scheduled for review today.`,
        isLive: false,
        suggestedAction: {
          label: 'Dive into Flashcard Revision',
          actionType: 'open_flashcards'
        }
      };
    }

    // Default intelligent companion response
    return {
      response: `**ECHO Telemetry Received:** 

You asked: *"${prompt}"*

From our oceanic knowledge archives: In ${context.course.title}, this directly intersects with how deep representations preserve geometric structure under transformation. 

Would you like me to:
1. Break this concept down with everyday visual analogies?
2. Formulate the exact mathematical proof or gradient equations?
3. Generate a rapid 3-question knowledge check for your dive log?`,
      isLive: false
    };
  }
};
