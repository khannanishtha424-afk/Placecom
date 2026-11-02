export type DepthZone = 'twilight' | 'midnight' | 'abyssal' | 'hadal';

export type MissionType = 
  | 'exploration' 
  | 'problem-solving' 
  | 'leviathan' 
  | 'timed' 
  | 'collaborative' 
  | 'revision' 
  | 'hadal';

export type MissionStatus = 'locked' | 'available' | 'in-progress' | 'mastered';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'scenario' | 'short-answer';
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  passingScore: number; // percentage, e.g. 70
  questions: QuizQuestion[];
}

export interface Assignment {
  id: string;
  title: string;
  brief: string;
  deliverable: string;
  deadline: string;
  xpReward: number;
  creditReward: number;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'dataset' | 'code' | 'interactive';
  url: string;
  meta?: string;
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  isUnlocked: boolean;
  isMastered: boolean;
  prerequisites: string[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  subtitle: string;
  depthZone: DepthZone;
  depthMeters: number;
  objective: string;
  durationMin: number;
  contentMarkdown: string;
  videoUrl?: string;
  simulationType?: 'neural-weights' | 'gradient-descent' | 'ocean-sensor-mesh' | 'strategy-matrix';
  quiz: Quiz;
  resources: Resource[];
  xpReward: number;
  creditReward: number;
  debriefSummary: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  reefName: string;
  depthZone: DepthZone;
  depthMeters: number;
  summary: string;
  accentColor: string;
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedHours: number;
  topics: Topic[];
  lessons: Lesson[];
  assignment?: Assignment;
  isUnlocked: boolean;
}

export interface Course {
  id: string;
  subject: string;
  title: string;
  tagline: string;
  instructor: string;
  instructorTitle: string;
  instructorAvatar: string;
  description: string;
  depthZones: {
    twilight: { name: string; range: string; desc: string };
    midnight: { name: string; range: string; desc: string };
    abyssal: { name: string; range: string; desc: string };
    hadal: { name: string; range: string; desc: string };
  };
  chapters: Chapter[];
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  chapterId: string;
  lessonId?: string;
  depthZone: DepthZone;
  depthMeters: number;
  durationMinutes: number;
  xpReward: number;
  status: MissionStatus;
  objective: string;
  debrief: string;
}
