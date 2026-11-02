import { DepthZone } from './course';

export type UserRole = 'student' | 'instructor';

export interface UserProfile {
  id: string;
  name: string;
  callsign: string;
  email: string;
  role: UserRole;
  level: number;
  xp: number;
  credits: number;
  currentDepthMeters: number;
  deepestZone: DepthZone;
  streakDays: number;
  lastDiveDate: string;
  enrolledDate: string;
}

export type SubmersiblePartCategory = 'hull' | 'propulsion' | 'tool' | 'trail' | 'theme' | 'decal';

export interface SubmersiblePart {
  id: string;
  category: SubmersiblePartCategory;
  name: string;
  description: string;
  costCredits: number;
  levelRequired: number;
  isUnlocked: boolean;
  accentColor?: string;
  bonusStat?: string;
  iconName: string;
}

export interface SubmersibleConfig {
  hullId: string;
  propulsionId: string;
  toolId: string;
  trailId: string;
  themeId: string;
  equippedDecalId?: string;
}

export interface AssignmentSubmission {
  assignmentId: string;
  submittedAt: string;
  content: string;
  fileAttachmentName?: string;
  grade?: number; // 0 - 100
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Flashcard {
  id: string;
  chapterId: string;
  concept: string;
  definition: string;
  contextExample: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: string; // ISO string
  lastRating?: 'again' | 'hard' | 'good' | 'easy';
}

export interface MindMapNode {
  id: string;
  label: string;
  category: 'concept' | 'definition' | 'formula' | 'experiment' | 'note';
  x: number;
  y: number;
  details?: string;
  color?: string;
}

export interface MindMapEdge {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface UserProgress {
  completedLessonIds: string[];
  masteredTopicIds: string[];
  quizScores: Record<string, number>; // lessonId -> percentage score
  assignmentSubmissions: Record<string, AssignmentSubmission>;
  notes: Record<string, string>; // lessonId -> student note
  bookmarks: string[]; // lessonIds
  lastVisitedLessonId?: string;
  submersible: SubmersibleConfig;
  inventory: string[]; // partIds unlocked
  unlockedAchievements: string[];
  diveHistory: {
    date: string;
    depthMeters: number;
    activity: string;
    xpEarned: number;
  }[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  category: 'depth' | 'mastery' | 'streak' | 'exam' | 'craft';
  unlockedAt?: string;
}
