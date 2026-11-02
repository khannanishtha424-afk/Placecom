import { Course } from '../types/course';
import { UserProfile, UserProgress, Flashcard, MindMapNode, MindMapEdge } from '../types/user';
import { DEFAULT_COURSE } from '../data/defaultCourse';
import { INITIAL_SUBMERSIBLE_PARTS } from '../data/initialSubmersibles';
import { INITIAL_FLASHCARDS } from '../data/initialFlashcards';
import { INITIAL_MINDMAP_NODES, INITIAL_MINDMAP_EDGES } from '../data/initialMindMap';

const STORAGE_KEYS = {
  COURSE: 'lumina_course_data_v1',
  PROFILE: 'lumina_user_profile_v1',
  PROGRESS: 'lumina_user_progress_v1',
  FLASHCARDS: 'lumina_flashcards_v1',
  MINDMAP_NODES: 'lumina_mindmap_nodes_v1',
  MINDMAP_EDGES: 'lumina_mindmap_edges_v1',
  SETTINGS: 'lumina_settings_v1'
};

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  motionIntensity: 'off' | 'calm' | 'full';
  use2DFallback: boolean;
  apiKey?: string;
  focusDiveMode: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr-student-01',
  name: 'Explorer Alex Vance',
  callsign: 'Abyss-Walker',
  email: 'alex.vance@lumina.edu',
  role: 'student',
  level: 3,
  xp: 1450,
  credits: 420,
  currentDepthMeters: 650,
  deepestZone: 'midnight',
  streakDays: 5,
  lastDiveDate: new Date().toISOString(),
  enrolledDate: '2026-10-15'
};

const DEFAULT_PROGRESS: UserProgress = {
  completedLessonIds: ['les-1-1'],
  masteredTopicIds: ['top-1-1'],
  quizScores: {
    'les-1-1': 100
  },
  assignmentSubmissions: {},
  notes: {
    'les-1-1': 'Remember: The bias shifts the activation boundary w · x + b = 0 away from the origin!'
  },
  bookmarks: ['les-1-1'],
  lastVisitedLessonId: 'les-1-2',
  submersible: {
    hullId: 'hull-nautilus-prime',
    propulsionId: 'prop-standard-hydro',
    toolId: 'tool-sonar-scanner',
    trailId: 'trail-cyan-wake',
    themeId: 'theme-abyss-default'
  },
  inventory: ['hull-nautilus-prime', 'prop-standard-hydro', 'tool-sonar-scanner', 'trail-cyan-wake', 'theme-abyss-default'],
  unlockedAchievements: ['ach-first-dive', 'ach-perfect-quiz'],
  diveHistory: [
    { date: '2026-10-28', depthMeters: 45, activity: 'Completed Mission 1.1: Weighted Synapse', xpEarned: 150 },
    { date: '2026-10-29', depthMeters: 110, activity: 'Explored Activation Functions Sandbox', xpEarned: 50 },
    { date: '2026-10-31', depthMeters: 480, activity: 'Trench Descent Practice', xpEarned: 100 },
    { date: '2026-11-01', depthMeters: 650, activity: 'Tidal Memory Vortex Review', xpEarned: 75 }
  ]
};

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.5,
  motionIntensity: 'full',
  use2DFallback: false,
  focusDiveMode: false
};

export const StorageService = {
  getCourse(): Course {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load course from storage, using default', e);
    }
    return DEFAULT_COURSE;
  },

  saveCourse(course: Course): void {
    try {
      localStorage.setItem(STORAGE_KEYS.COURSE, JSON.stringify(course));
    } catch (e) {
      console.error('Failed to save course', e);
    }
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load profile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load progress', e);
    }
    return DEFAULT_PROGRESS;
  },

  saveProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  },

  getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load flashcards', e);
    }
    return INITIAL_FLASHCARDS;
  },

  saveFlashcards(cards: Flashcard[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save flashcards', e);
    }
  },

  getMindMap(): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
    try {
      const nodesData = localStorage.getItem(STORAGE_KEYS.MINDMAP_NODES);
      const edgesData = localStorage.getItem(STORAGE_KEYS.MINDMAP_EDGES);
      if (nodesData && edgesData) {
        return {
          nodes: JSON.parse(nodesData),
          edges: JSON.parse(edgesData)
        };
      }
    } catch (e) {
      console.warn('Failed to load mindmap', e);
    }
    return { nodes: INITIAL_MINDMAP_NODES, edges: INITIAL_MINDMAP_EDGES };
  },

  saveMindMap(nodes: MindMapNode[], edges: MindMapEdge[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MINDMAP_NODES, JSON.stringify(nodes));
      localStorage.setItem(STORAGE_KEYS.MINDMAP_EDGES, JSON.stringify(edges));
    } catch (e) {
      console.error('Failed to save mindmap', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  resetAll(): void {
    localStorage.clear();
  }
};
