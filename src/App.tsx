import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudioHeader } from './components/header/StudioHeader';
import { Sidebar } from './components/sidebar/Sidebar';
import { PlayerContainer } from './components/player/PlayerContainer';
import { TimelineEditor } from './components/timeline/TimelineEditor';
import { ExportModal } from './components/modals/ExportModal';
import { SocialPublishModal } from './components/modals/SocialPublishModal';
import { TeamModal } from './components/modals/TeamModal';
import { StoryboardModal } from './components/modals/StoryboardModal';
import {
  MediaClip,
  AspectRatio,
  Resolution,
  TeamMember,
  TimelineComment,
} from './types/video';
import { audioEngine } from './services/audioEngine';

export default function App() {
  const [projectTitle, setProjectTitle] = useState('Кіберпанк 2099 — ШІ Трейлер 4K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('4K');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');

  // Modal open states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isStoryboardModalOpen, setIsStoryboardModalOpen] = useState(false);

  // Initial rich 4K cinematic project demo clips
  const [clips, setClips] = useState<MediaClip[]>([
    {
      id: 'clip-1',
      title: 'Неоновий Токіо (ШІ 4K)',
      type: 'video',
      trackIndex: 0,
      startTime: 0,
      duration: 5,
      generatorType: 'procedural-cyberpunk',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
      volume: 100,
      speed: 1,
      opacity: 100,
      filterPreset: 'cyberpunk',
      filterSettings: {
        brightness: 110,
        contrast: 130,
        saturation: 140,
        grain: 15,
        vignette: 35,
        blur: 0,
        chromatic: 3,
      },
      transitionIn: { type: 'fade', duration: 0.8 },
    },
    {
      id: 'clip-2',
      title: 'Квантова ШІ Нейромережа',
      type: 'video',
      trackIndex: 0,
      startTime: 5,
      duration: 5,
      generatorType: 'procedural-neural',
      thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
      volume: 100,
      speed: 1,
      opacity: 100,
      filterPreset: 'hdr-4k',
      filterSettings: {
        brightness: 105,
        contrast: 125,
        saturation: 115,
        grain: 5,
        vignette: 25,
        blur: 0,
        chromatic: 1,
      },
      transitionIn: { type: 'dissolve', duration: 0.8 },
    },
    {
      id: 'clip-3',
      title: 'Дрон над Альпами 8K',
      type: 'video',
      trackIndex: 0,
      startTime: 10,
      duration: 5,
      generatorType: 'procedural-mountains',
      thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
      volume: 100,
      speed: 1,
      opacity: 100,
      filterPreset: 'teal-orange',
      filterSettings: {
        brightness: 100,
        contrast: 120,
        saturation: 125,
        grain: 10,
        vignette: 30,
        blur: 0,
        chromatic: 0,
      },
      transitionIn: { type: 'zoom-blur', duration: 0.8 },
    },
    // Track 1: B-Roll overlay
    {
      id: 'clip-overlay-1',
      title: 'B-Roll: Матриця даних',
      type: 'overlay',
      trackIndex: 1,
      startTime: 2,
      duration: 3,
      generatorType: 'procedural-matrix',
      volume: 0,
      speed: 1,
      opacity: 85,
      filterPreset: 'cyberpunk',
    },
    // Track 2: Animated Titles
    {
      id: 'clip-title-1',
      title: 'Титр: НОВА ЕРА ШІ ВІДЕО',
      type: 'text',
      trackIndex: 2,
      startTime: 0.5,
      duration: 4,
      textConfig: {
        content: 'НОВА ЕРА ШІ ВІДЕО 4K',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 36,
        color: '#ffffff',
        accentColor: '#38bdf8',
        animation: 'kinetic',
        positionY: 78,
        positionX: 50,
        bgPill: true,
        outline: true,
        glow: true,
      },
      color: '#38bdf8',
      volume: 0,
      speed: 1,
      opacity: 100,
      filterPreset: 'none',
    },
    {
      id: 'clip-title-2',
      title: 'Титр: Квантова свідомість',
      type: 'text',
      trackIndex: 2,
      startTime: 5.5,
      duration: 4,
      textConfig: {
        content: 'Квантова швидкість обробки на H100',
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 32,
        color: '#ffffff',
        accentColor: '#facc15',
        animation: 'typewriter',
        positionY: 82,
        positionX: 50,
        bgPill: true,
        outline: true,
        glow: false,
      },
      color: '#38bdf8',
      volume: 0,
      speed: 1,
      opacity: 100,
      filterPreset: 'none',
    },
    // Track 3: Audio Soundtrack & SFX
    {
      id: 'clip-audio-1',
      title: 'Епічний Голлівудський Саундтрек',
      type: 'audio',
      trackIndex: 3,
      startTime: 0,
      duration: 15,
      volume: 80,
      speed: 1,
      opacity: 100,
      filterPreset: 'none',
      audioWaveform: [30, 50, 70, 90, 85, 95, 70, 80, 100, 85, 75, 60, 40],
      color: '#a855f7',
    },
  ]);

  // Team collaborators
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'u1',
      name: 'Олександр (Ви)',
      role: 'Режисер (Admin)',
      color: '#38bdf8',
      activeTrack: 'Video Track 0',
      cursorSec: 2.5,
      avatar: '',
      isOnline: true,
    },
    {
      id: 'u2',
      name: 'Олена Коваль',
      role: 'Монтажер титрів',
      color: '#f43f5e',
      activeTrack: 'Titles Track 2',
      cursorSec: 6.8,
      avatar: '',
      isOnline: true,
    },
    {
      id: 'u3',
      name: 'Марк Стеценко',
      role: 'Колорист & FX',
      color: '#10b981',
      activeTrack: 'Effects Track',
      cursorSec: 11.2,
      avatar: '',
      isOnline: true,
    },
  ]);

  // Timeline review comments
  const [comments, setComments] = useState<TimelineComment[]>([
    {
      id: 'c1',
      timestamp: 2.0,
      author: 'Олена Коваль',
      text: 'Додала сюди кінетичний титр із неоновим сяйвом!',
      timeAgo: '4 хв тому',
      resolved: true,
    },
    {
      id: 'c2',
      timestamp: 7.5,
      author: 'Марк Стеценко',
      text: 'Корекція кольору Teal & Orange виглядає дуже кінематографічно у 4K.',
      timeAgo: '15 хв тому',
      resolved: false,
    },
  ]);

  // Calculate total timeline duration
  const totalDuration = Math.max(
    15,
    ...clips.map((c) => c.startTime + c.duration)
  );

  // Playback requestAnimationFrame loop
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioEngine.stopSoundtrackLoop();
      return;
    }

    lastTimeRef.current = performance.now();
    audioEngine.startSoundtrackLoop();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
        const next = prev + delta;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0; // Loop or stop
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // Keyboard shortcuts (Space = Play/Pause, Del = Delete selected)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 1 / 30));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(totalDuration, t + 1 / 30));
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          handleDeleteClip(selectedClipId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalDuration, selectedClipId]);

  // Add clip to timeline
  const handleAddClip = useCallback(
    (newClipData: Partial<MediaClip>) => {
      const trackIndex = newClipData.trackIndex ?? 0;
      // Find end time of last clip on this track
      const trackClips = clips.filter((c) => c.trackIndex === trackIndex);
      const lastEndTime = trackClips.length > 0 ? Math.max(...trackClips.map((c) => c.startTime + c.duration)) : 0;
      const startTime = newClipData.startTime !== undefined ? newClipData.startTime : lastEndTime;

      const newClip: MediaClip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: newClipData.title || 'Новий кліп',
        type: newClipData.type || (trackIndex === 2 ? 'text' : trackIndex === 3 ? 'audio' : 'video'),
        trackIndex,
        startTime,
        duration: newClipData.duration || 5,
        generatorType: newClipData.generatorType || 'procedural-cyberpunk',
        thumbnailUrl: newClipData.thumbnailUrl,
        prompt: newClipData.prompt,
        volume: newClipData.volume ?? 100,
        speed: newClipData.speed ?? 1,
        opacity: newClipData.opacity ?? 100,
        filterPreset: newClipData.filterPreset || 'hdr-4k',
        filterSettings: newClipData.filterSettings || {
          brightness: 100,
          contrast: 105,
          saturation: 110,
          grain: 0,
          vignette: 20,
          blur: 0,
          chromatic: 0,
        },
        transitionIn: newClipData.transitionIn || { type: 'dissolve', duration: 0.8 },
        textConfig: newClipData.textConfig,
        audioWaveform: newClipData.audioWaveform,
      };

      setClips((prev) => [...prev, newClip]);
      setSelectedClipId(newClip.id);
      audioEngine.playSFX('whoosh');
    },
    [clips]
  );

  // Split clip at playhead
  const handleSplitClip = useCallback((clipId: string, splitTime: number) => {
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === clipId);
      if (idx === -1) return prev;
      const original = prev[idx];
      const firstDuration = splitTime - original.startTime;
      const secondDuration = original.duration - firstDuration;

      if (firstDuration <= 0.2 || secondDuration <= 0.2) return prev;

      const firstPart: MediaClip = {
        ...original,
        duration: firstDuration,
      };

      const secondPart: MediaClip = {
        ...original,
        id: `clip_${Date.now()}_split`,
        title: `${original.title} (Частина 2)`,
        startTime: splitTime,
        duration: secondDuration,
      };

      const copy = [...prev];
      copy.splice(idx, 1, firstPart, secondPart);
      return copy;
    });
    audioEngine.playSFX('typewriter');
  }, []);

  // Delete clip
  const handleDeleteClip = useCallback((clipId: string) => {
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    setSelectedClipId(null);
  }, []);

  // Duplicate clip
  const handleDuplicateClip = useCallback((clipId: string) => {
    setClips((prev) => {
      const original = prev.find((c) => c.id === clipId);
      if (!original) return prev;
      const duplicated: MediaClip = {
        ...original,
        id: `clip_${Date.now()}_dup`,
        title: `${original.title} (Копія)`,
        startTime: original.startTime + original.duration + 0.1,
      };
      return [...prev, duplicated];
    });
    audioEngine.playSFX('whoosh');
  }, []);

  // Update clip properties
  const handleUpdateClip = useCallback((clipId: string, updates: Partial<MediaClip>) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, ...updates } : c)));
  }, []);

  // Apply to all clips
  const handleApplyToAllClips = useCallback((updates: Partial<MediaClip>) => {
    setClips((prev) => prev.map((c) => ({ ...c, ...updates })));
  }, []);

  // Apply full storyboard sequence
  const handleApplyStoryboard = useCallback((scenes: Array<Partial<MediaClip>>) => {
    // Replace video track with generated storyboard scenes
    setClips((prev) => {
      const nonVideoClips = prev.filter((c) => c.trackIndex !== 0 && c.trackIndex !== 2);
      const newClips: MediaClip[] = scenes.map((s, idx) => ({
        id: `sb_${Date.now()}_${idx}`,
        title: s.title || `Сцена ${idx + 1}`,
        type: s.type || 'video',
        trackIndex: s.trackIndex ?? 0,
        startTime: s.startTime ?? idx * 5,
        duration: s.duration || 5,
        generatorType: s.generatorType || 'procedural-cyberpunk',
        prompt: s.prompt,
        thumbnailUrl: s.thumbnailUrl,
        volume: 100,
        speed: 1,
        opacity: 100,
        filterPreset: s.filterPreset || 'hdr-4k',
        transitionIn: s.transitionIn || { type: 'dissolve', duration: 0.8 },
        textConfig: s.textConfig,
      }));
      return [...nonVideoClips, ...newClips];
    });
    setCurrentTime(0);
  }, []);

  // Add Comment on timeline
  const handleAddCommentAtCurrentTime = () => {
    const text = prompt(`Введіть коментар на таймкод ${currentTime.toFixed(1)}с:`);
    if (text && text.trim()) {
      const newComment: TimelineComment = {
        id: `comm_${Date.now()}`,
        timestamp: Math.round(currentTime * 10) / 10,
        author: 'Олександр (Ви)',
        text: text.trim(),
        timeAgo: 'Щойно',
        resolved: false,
      };
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const handleAddCommentFromTab = (text: string) => {
    const newComment: TimelineComment = {
      id: `comm_${Date.now()}`,
      timestamp: Math.round(currentTime * 10) / 10,
      author: 'Олександр (Ви)',
      text,
      timeAgo: 'Щойно',
      resolved: false,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* Top Studio Header */}
      <StudioHeader
        projectTitle={projectTitle}
        onUpdateTitle={setProjectTitle}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        teamMembers={teamMembers}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSocialModal={() => setIsSocialModalOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenStoryboardModal={() => setIsStoryboardModalOpen(true)}
      />

      {/* Main Studio Body: Sidebar on Left, Player & Inspector on Right */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Interactive Sidebar */}
        <Sidebar
          onAddClipToTimeline={handleAddClip}
          selectedClip={selectedClip}
          onUpdateClip={handleUpdateClip}
          onApplyToAllClips={handleApplyToAllClips}
          aspectRatio={aspectRatio}
          timelineDuration={totalDuration}
          teamMembers={teamMembers}
          comments={comments}
          currentTime={currentTime}
          onSeek={setCurrentTime}
          onAddComment={handleAddCommentFromTab}
        />

        {/* Center Live Canvas Player Viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <PlayerContainer
            clips={clips}
            currentTime={currentTime}
            duration={totalDuration}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onSeek={setCurrentTime}
            aspectRatio={aspectRatio}
            resolution={resolution}
            onChangeResolution={setResolution}
          />
        </main>
      </div>

      {/* Bottom Multi-Track Timeline Editor */}
      <TimelineEditor
        clips={clips}
        currentTime={currentTime}
        duration={totalDuration}
        selectedClipId={selectedClipId}
        onSelectClip={(c) => setSelectedClipId(c ? c.id : null)}
        onSeek={setCurrentTime}
        onSplitClip={handleSplitClip}
        onDeleteClip={handleDeleteClip}
        onDuplicateClip={handleDuplicateClip}
        onUpdateClip={handleUpdateClip}
        teamMembers={teamMembers}
        comments={comments}
        onAddCommentAtCurrentTime={handleAddCommentAtCurrentTime}
      />

      {/* Modals */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clips={clips}
        duration={totalDuration}
        aspectRatio={aspectRatio}
        projectTitle={projectTitle}
      />

      <SocialPublishModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        projectTitle={projectTitle}
      />

      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMembers={teamMembers}
        comments={comments}
        onAddTeamMember={(newMember) => setTeamMembers((prev) => [...prev, newMember])}
      />

      <StoryboardModal
        isOpen={isStoryboardModalOpen}
        onClose={() => setIsStoryboardModalOpen(false)}
        onApplyStoryboard={handleApplyStoryboard}
      />
    </div>
  );
}
