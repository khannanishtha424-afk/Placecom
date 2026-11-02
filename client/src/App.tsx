import React, { useState, useEffect } from 'react';
import { Course, Chapter, Lesson, Assignment } from './types/course';
import { UserProfile, UserProgress, Flashcard, MindMapNode, MindMapEdge, SubmersiblePartCategory, AssignmentSubmission } from './types/user';
import { StorageService, AppSettings } from './services/storage';
import { SoundEffects } from './services/audio';
import { Header, ActiveScreen } from './components/common/Header';
import { EchoAssistant } from './components/common/EchoAssistant';

// Views
import { DescentView } from './components/views/DescentView';
import { BridgeView } from './components/views/BridgeView';
import { ReefExplorerView } from './components/views/ReefExplorerView';
import { LearningChamberView } from './components/views/LearningChamberView';
import { MissionControlView } from './components/views/MissionControlView';
import { CoralKnowledgeReefView } from './components/views/CoralKnowledgeReefView';
import { LeviathanExamView } from './components/views/LeviathanExamView';
import { TidalVortexView } from './components/views/TidalVortexView';
import { IdeaCurrentsView } from './components/views/IdeaCurrentsView';
import { LearningDNAView } from './components/views/LearningDNAView';
import { SubmersibleDockView } from './components/views/SubmersibleDockView';
import { InstructorStudioView } from './components/views/InstructorStudioView';

export const App: React.FC = () => {
  // 1. Initial State from Storage
  const [course, setCourse] = useState<Course>(() => StorageService.getCourse());
  const [profile, setProfile] = useState<UserProfile>(() => StorageService.getProfile());
  const [progress, setProgress] = useState<UserProgress>(() => StorageService.getProgress());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => StorageService.getFlashcards());
  const [mindMap, setMindMap] = useState(() => StorageService.getMindMap());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());

  // 2. Active Screen Navigation State
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen | 'descent'>('bridge');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Apply motion intensity attribute to DOM root for CSS rules
  useEffect(() => {
    document.documentElement.setAttribute('data-motion', settings.motionIntensity);
  }, [settings.motionIntensity]);

  // Audio setup
  useEffect(() => {
    SoundEffects.setMuted(!settings.soundEnabled);
    SoundEffects.setVolume(settings.soundVolume);
    if (settings.soundEnabled && currentScreen !== 'descent') {
      SoundEffects.startAmbientDrone();
    } else {
      SoundEffects.stopAmbientDrone();
    }
  }, [settings.soundEnabled, settings.soundVolume, currentScreen]);

  // Persist State Changes
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  const updateProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    StorageService.saveProgress(newProgress);
  };

  const updateCourse = (newCourse: Course) => {
    setCourse(newCourse);
    StorageService.saveCourse(newCourse);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // 3. Navigation Handlers
  const handleBeginDescent = (role: 'student' | 'instructor') => {
    updateProfile({ ...profile, role });
    setCurrentScreen(role === 'instructor' ? 'instructor-studio' : 'bridge');
    if (settings.soundEnabled) SoundEffects.startAmbientDrone();
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setCurrentScreen('reef-explorer');
  };

  const handleStartLesson = (lessonId: string) => {
    const allLessons = course.chapters.flatMap((c) => c.lessons);
    const target = allLessons.find((l) => l.id === lessonId);
    if (target) {
      setSelectedLesson(target);
      setCurrentScreen('learning-chamber');
    }
  };

  const handleCompleteLesson = (lessonId: string, score: number) => {
    const allLessons = course.chapters.flatMap((c) => c.lessons);
    const currentLes = allLessons.find((l) => l.id === lessonId);
    const xpGain = currentLes ? currentLes.xpReward : 150;
    const creditGain = currentLes ? currentLes.creditReward : 50;

    const newCompleted = Array.from(new Set([...progress.completedLessonIds, lessonId]));
    const newScores = { ...progress.quizScores, [lessonId]: score };

    const newHistory = [
      ...progress.diveHistory,
      {
        date: new Date().toISOString().split('T')[0],
        depthMeters: currentLes ? currentLes.depthMeters : profile.currentDepthMeters,
        activity: `Completed ${currentLes?.title || 'Lesson'} (${score}%)`,
        xpEarned: xpGain
      }
    ];

    updateProgress({
      ...progress,
      completedLessonIds: newCompleted,
      quizScores: newScores,
      diveHistory: newHistory
    });

    const newXp = profile.xp + xpGain;
    const newCredits = profile.credits + creditGain;
    const newLevel = Math.max(profile.level, Math.floor(newXp / 500) + 1);
    const maxDepth = currentLes ? Math.max(profile.currentDepthMeters, currentLes.depthMeters) : profile.currentDepthMeters;

    updateProfile({
      ...profile,
      xp: newXp,
      credits: newCredits,
      level: newLevel,
      currentDepthMeters: maxDepth
    });
  };

  const handleSaveNote = (lessonId: string, noteText: string) => {
    updateProgress({
      ...progress,
      notes: { ...progress.notes, [lessonId]: noteText }
    });
  };

  const handleToggleBookmark = (lessonId: string) => {
    const exists = progress.bookmarks.includes(lessonId);
    const updated = exists
      ? progress.bookmarks.filter((id) => id !== lessonId)
      : [...progress.bookmarks, lessonId];
    updateProgress({ ...progress, bookmarks: updated });
  };

  const handleSubmitAssignment = (assignmentId: string, submission: AssignmentSubmission) => {
    const newSubmissions = {
      ...progress.assignmentSubmissions,
      [assignmentId]: submission
    };
    updateProgress({
      ...progress,
      assignmentSubmissions: newSubmissions
    });
    updateProfile({
      ...profile,
      xp: profile.xp + 350,
      credits: profile.credits + 120
    });
  };

  const handleEquipPart = (category: SubmersiblePartCategory, partId: string) => {
    const updatedSub = { ...progress.submersible };
    if (category === 'hull') updatedSub.hullId = partId;
    if (category === 'propulsion') updatedSub.propulsionId = partId;
    if (category === 'tool') updatedSub.toolId = partId;
    if (category === 'trail') updatedSub.trailId = partId;
    if (category === 'theme') updatedSub.themeId = partId;

    updateProgress({
      ...progress,
      submersible: updatedSub
    });
  };

  const handleUnlockPart = (partId: string, costCredits: number) => {
    if (profile.credits < costCredits) return;
    updateProfile({
      ...profile,
      credits: profile.credits - costCredits
    });
    updateProgress({
      ...progress,
      inventory: [...progress.inventory, partId]
    });
  };

  return (
    <div className="min-h-screen bg-[#03060B] text-[#E8F6FA] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Show Descent Screen first or Navigation Header */}
      {currentScreen === 'descent' ? (
        <DescentView
          onBeginDescent={handleBeginDescent}
          courseSubject={course.subject}
        />
      ) : (
        <>
          {/* Main Top Header */}
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            profile={profile}
            onSwitchRole={(role) => updateProfile({ ...profile, role })}
            motionIntensity={settings.motionIntensity}
            onChangeMotion={(intensity) => updateSettings({ ...settings, motionIntensity: intensity })}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            use2DFallback={settings.use2DFallback}
            onToggle2D={() => updateSettings({ ...settings, use2DFallback: !settings.use2DFallback })}
            focusDiveMode={settings.focusDiveMode}
            onToggleFocusDive={() => updateSettings({ ...settings, focusDiveMode: !settings.focusDiveMode })}
          />

          {/* Active Screen View Switcher */}
          <main className="flex-1">
            {currentScreen === 'bridge' && (
              <BridgeView
                course={course}
                profile={profile}
                progress={progress}
                onSelectChapter={handleSelectChapter}
                onStartLesson={handleStartLesson}
                onOpenMissions={() => setCurrentScreen('mission-control')}
                onOpenSkillTree={() => setCurrentScreen('coral-knowledge')}
                onOpenExam={() => setCurrentScreen('leviathan-exam')}
                motionIntensity={settings.motionIntensity}
                use2DFallback={settings.use2DFallback}
              />
            )}

            {currentScreen === 'reef-explorer' && (
              <ReefExplorerView
                chapter={selectedChapter || course.chapters[0]}
                progress={progress}
                onBackToOcean={() => setCurrentScreen('bridge')}
                onSelectLesson={handleStartLesson}
              />
            )}

            {currentScreen === 'learning-chamber' && (
              <LearningChamberView
                lesson={selectedLesson || course.chapters[0].lessons[0]}
                course={course}
                progress={progress}
                onBackToReef={() => setCurrentScreen('reef-explorer')}
                onCompleteLesson={handleCompleteLesson}
                onNextLesson={handleStartLesson}
                onSaveNote={handleSaveNote}
                onToggleBookmark={handleToggleBookmark}
                focusDiveMode={settings.focusDiveMode}
              />
            )}

            {currentScreen === 'mission-control' && (
              <MissionControlView
                course={course}
                progress={progress}
                onSelectLesson={handleStartLesson}
                onSubmitAssignment={handleSubmitAssignment}
                onOpenLeviathanExam={() => setCurrentScreen('leviathan-exam')}
              />
            )}

            {currentScreen === 'coral-knowledge' && (
              <CoralKnowledgeReefView
                course={course}
                progress={progress}
                onNavigateLesson={handleStartLesson}
              />
            )}

            {currentScreen === 'leviathan-exam' && (
              <LeviathanExamView
                onBackToBridge={() => setCurrentScreen('bridge')}
                onRecordExamScore={(score, xp) => {
                  updateProfile({ ...profile, xp: profile.xp + xp });
                }}
              />
            )}

            {currentScreen === 'tidal-vortex' && (
              <TidalVortexView
                course={course}
                flashcards={flashcards}
                onUpdateFlashcards={(cards) => {
                  setFlashcards(cards);
                  StorageService.saveFlashcards(cards);
                }}
                onNavigateLesson={handleStartLesson}
              />
            )}

            {currentScreen === 'idea-currents' && (
              <IdeaCurrentsView
                nodes={mindMap.nodes}
                edges={mindMap.edges}
                onSaveMindMap={(nodes, edges) => {
                  setMindMap({ nodes, edges });
                  StorageService.saveMindMap(nodes, edges);
                }}
              />
            )}

            {currentScreen === 'learning-dna' && (
              <LearningDNAView
                profile={profile}
                progress={progress}
                course={course}
                onNavigateLesson={handleStartLesson}
              />
            )}

            {currentScreen === 'submersible-dock' && (
              <SubmersibleDockView
                profile={profile}
                progress={progress}
                onEquipPart={handleEquipPart}
                onUnlockPart={handleUnlockPart}
              />
            )}

            {currentScreen === 'instructor-studio' && (
              <InstructorStudioView
                course={course}
                progress={progress}
                onSaveCourse={updateCourse}
                onResetCourse={() => {
                  StorageService.resetAll();
                  window.location.reload();
                }}
              />
            )}
          </main>

          {/* Floating Holographic AI Tutor ECHO Orb & Drawer */}
          <EchoAssistant
            course={course}
            currentLesson={currentScreen === 'learning-chamber' ? (selectedLesson || undefined) : undefined}
            apiKey={settings.apiKey}
            onNavigateLesson={handleStartLesson}
            onOpenFlashcards={() => setCurrentScreen('tidal-vortex')}
          />
        </>
      )}
    </div>
  );
};

export default App;
