# LUMINA DEEP ACADEMY: Learn Beyond the Surface
### *A 3D Bioluminescent Learning Ocean LMS*

![Lumina Deep Academy](https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80)

**LUMINA DEEP ACADEMY** transforms online education into an immersive, interactive 3D deep ocean expedition. The learner is a deep sea explorer navigating uncharted waters. Every chapter is a glowing reef city, every topic is a location to explore, every quiz is a dive challenge, and every completed mission helps the learner upgrade their submersible.

---

## 🌊 Depth Zones & Learning Progression
Progress in Lumina Deep Academy is measured in ocean depth:
* **Twilight Zone (0m – 200m):** Foundational chapters where faint sunlight still reaches. Calm currents, linear algebra, and atomic perceptrons.
* **Midnight Zone (200m – 1,000m):** Intermediate chapters. Sunlight dissolves completely; organic bioluminescence illuminates loss canyons, backpropagation, and gradient descent.
* **Abyssal Zone (1,000m – 4,000m):** Advanced chapters. Intense hydrostatic pressures and glowing deep-sea life. Scaled dot-product attention, multi-head transformers, and context routing.
* **Hadal Trench (4,000m – 11,000m):** Expert and capstone discovery content. Encounter the majestic Leviathan at Challenger Deep in high-stakes autonomous reinforcement learning simulations.

---

## ✨ Features & Architecture

### 1. Interactive 3D Learning Ocean (`OceanCanvas.tsx`)
* **Lumen Core:** Central glowing crystal and coral formation at the center of the ocean.
* **4 Reef Cities:** Procedural 3D reef cities representing chapters, located at their authentic depth zones.
* **Plankton Particle Mesh:** Drifting bioluminescent plankton with interactive cursor repulsion.
* **Silken Jellyfish:** Ambient background deep-sea creatures with undulating bells.
* **2D Tactical Sonar Fallback:** Instant toggle to high-performance HTML5 Canvas tactical radar for low-spec devices or battery saving.

### 2. Motion Light System (4 Layers)
* **Layer 1 (Ambient):** Plankton drift, current ribbons, slow light shafts.
* **Layer 2 (Interaction):** Pointer glow wake, sonar ping rings, hover paths.
* **Layer 3 (State):** Locked (cold/dim), Available (breathing pulse), In-progress (filling ring), Mastered (warm glow with circling motes).
* **Layer 4 (Reward):** Bioluminescent celebratory particle bloom and audio chimes on mission mastery.
* **Motion Controls:** `Off`, `Calm`, `Full` intensity settings + **Focus Dive Mode** which dims backgrounds to stillness during reading sessions.

### 3. Holographic AI Ocean Tutor: ECHO (`EchoAssistant.tsx`)
* Represented as an elegant pulsing orb of light emitting sonar ripples.
* Clearly labeled **Demo Mode** with authentic neural knowledge fallback.
* Capable of explaining concepts in simple analogies, breaking down mathematical proofs, providing lesson summaries, and suggesting next activities.
* Supports live Google Gemini API keys configured in settings.

### 4. Interactive Concept Sandboxes (`InteractiveSimulations.tsx`)
* **Synaptic Hyperplane Sandbox:** Manipulate weights $w_1, w_2$ and bias $b$ to classify sensory points with live accuracy metrics.
* **Loss Canyon Gradient Descent Simulator:** Adjust learning rate $\eta$, momentum $\beta$, and step through non-convex loss valleys.
* **Ocean Attention Router:** Inspect Query-Key dot products and observe softmax routing temperature $\sqrt{d_k}$.

### 5. Essential LMS Features Across 10 Core Views
1. **Welcome / Descent Screen:** Cinematic descent through oceanic layers with skip option and dual Student/Instructor login.
2. **Submersible Bridge (Command Center):** Cockpit HUD with sonar radar, active streak, next recommended dive, and 3D ocean view.
3. **Reef Explorer:** Chapter inspection, subtopic coral pods, and DIVE IN triggers.
4. **Immersive Learning Chamber:** Focus Dive reading with 16px high-contrast typography, video lectures, persistent notes, bookmarks, interactive sandboxes, and quizzes.
5. **Mission Control:** Categorized mission dispatch (Exploration, Boss Challenge, Assignments) with real text/code submission and automated grading.
6. **Coral Knowledge Reef:** Branching coral skill tree showing concept prerequisites and illuminated mastery flow.
7. **Leviathan Exam Mode:** Strategic deep dive with live oxygen timer, limited sonar hints, progressive depth sinking per correct question, and detailed debrief.
8. **Tidal Memory Vortex:** Spaced repetition flashcards with SuperMemo interval ratings (Again, Hard, Good, Easy) and whirlpool timeline.
9. **Idea Currents:** Visual mind mapping node canvas with floating orbs and shimmering light threads.
10. **Learning DNA:** Explorer dive log analytics with radar sector breakdown and algorithmic recommendations.
11. **Submersible Dock:** Equip and customize hulls, thrusters, sonar tools, and cosmetic wake trails using earned credits.
12. **Instructor Studio:** Fully editable subject title, chapter depths, lesson text, quizzes, student roster, and JSON Export / Import.

### 6. Procedural Web Audio Soundscape (`audio.ts`)
* Active sonar ping chirps with exponential reverb.
* Subsonic 55Hz ocean floor resonance drone.
* Ascending bioluminescent crystal chord chimes.
* Full mute and volume controls.

---

## 🚀 Getting Started

### Option A: Standalone React + Vite Client (Fastest Development)
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Option B: Run via FastAPI Backend
The built production assets of Lumina Deep Academy are integrated into FastAPI:
```bash
python -m uvicorn main:app --port 9000 --reload
```
* **Lumina Deep Academy 3D LMS:** [http://localhost:9000/lumina](http://localhost:9000/lumina)
* **API Health Check:** [http://localhost:9000/health](http://localhost:9000/health)
* **Legacy Placement Committee Portal:** [http://localhost:9000/student](http://localhost:9000/student)

### Option C: Rebuilding Production Assets
```bash
cd client
npm run build
```
Builds verified optimized bundles into `client/dist`.

---

## 🛠 Technology Stack
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **3D & Graphics:** Three.js, Canvas 2D Fallback, Canvas Confetti
* **Audio:** Web Audio API (Synthesized oscillators and filters)
* **Icons:** Lucide React
* **Persistence:** HTML5 LocalStorage with JSON Export/Import
* **Backend:** FastAPI, Python, SQLite / SQLAlchemy (Existing SDP preserved)
