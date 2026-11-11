import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Magnet,
  MessageSquarePlus,
  Play,
  Volume2,
  Eye,
  Lock,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MediaClip, TeamMember, TimelineComment } from '../../types/video';

interface TimelineEditorProps {
  clips: MediaClip[];
  currentTime: number;
  duration: number;
  selectedClipId: string | null;
  onSelectClip: (clip: MediaClip | null) => void;
  onSeek: (time: number) => void;
  onSplitClip: (clipId: string, splitTime: number) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onUpdateClip: (clipId: string, updates: Partial<MediaClip>) => void;
  teamMembers: TeamMember[];
  comments: TimelineComment[];
  onAddCommentAtCurrentTime: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  clips,
  currentTime,
  duration,
  selectedClipId,
  onSelectClip,
  onSeek,
  onSplitClip,
  onDeleteClip,
  onDuplicateClip,
  onUpdateClip,
  teamMembers,
  comments,
  onAddCommentAtCurrentTime,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(45); // pixels per second
  const [isSnapping, setIsSnapping] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Track labels & configs
  const tracks = [
    { index: 0, name: 'Відео (ШІ & Стоки)', icon: '🎬', color: 'border-cyan-500/30' },
    { index: 1, name: 'B-Roll & Оверлеї', icon: '🎞️', color: 'border-indigo-500/30' },
    { index: 2, name: 'Анімовані титри', icon: '💬', color: 'border-amber-500/30' },
    { index: 3, name: 'Саундтрек & SFX', icon: '🎵', color: 'border-purple-500/30' },
  ];

  const totalWidth = Math.max(800, duration * zoomLevel);

  // Scrubbing handling
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft - 180; // 180px track label width
    if (clickX >= 0) {
      const newTime = Math.max(0, Math.min(duration, clickX / zoomLevel));
      onSeek(newTime);
      setIsScrubbing(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isScrubbing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scrollLeft = containerRef.current.scrollLeft;
      const clickX = e.clientX - rect.left + scrollLeft - 180;
      if (clickX >= 0) {
        const newTime = Math.max(0, Math.min(duration, clickX / zoomLevel));
        onSeek(newTime);
      }
    };

    const handleMouseUp = () => {
      if (isScrubbing) setIsScrubbing(false);
    };

    if (isScrubbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, duration, zoomLevel, onSeek]);

  // Handle Split current selected clip at playhead
  const handleSplitSelected = () => {
    if (!selectedClipId) return;
    const clip = clips.find((c) => c.id === selectedClipId);
    if (!clip) return;
    if (currentTime > clip.startTime + 0.3 && currentTime < clip.startTime + clip.duration - 0.3) {
      onSplitClip(clip.id, currentTime);
    }
  };

  return (
    <div className="h-64 sm:h-72 border-t border-slate-800 bg-slate-950 flex flex-col select-none z-20 shrink-0">
      {/* Timeline Action Toolbar */}
      <div className="h-10 border-b border-slate-800 bg-slate-900/90 px-3 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Split Cut */}
          <button
            onClick={handleSplitSelected}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition font-medium"
            title="Розрізати кліп по позиції курсора (✂️)"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Розрізати</span>
          </button>

          {/* Duplicate */}
          <button
            onClick={() => selectedClipId && onDuplicateClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition"
            title="Дублювати обраний кліп"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Дублювати</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => selectedClipId && onDeleteClip(selectedClipId)}
            disabled={!selectedClipId}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-red-950/40 hover:text-red-400 disabled:opacity-40 text-slate-200 transition"
            title="Видалити кліп (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Add Team Comment Marker */}
          <button
            onClick={onAddCommentAtCurrentTime}
            className="flex items-center gap-1 px-2 py-1 rounded bg-sky-950/50 border border-sky-800/40 text-sky-300 hover:bg-sky-900/50 transition font-medium"
            title="Додати мітку з коментарем для команди на поточному таймкоді"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Коментар</span>
          </button>
        </div>

        {/* Right Tools: Snapping & Zoom */}
        <div className="flex items-center gap-3">
          {/* Magnet Snapping */}
          <button
            onClick={() => setIsSnapping(!isSnapping)}
            className={`p-1.5 rounded transition ${
              isSnapping ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Магнітне прилипання до меж кліпів"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(20, z - 8))}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title="Зменшити масштаб таймлайну"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{zoomLevel}px</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(100, z + 8))}
              className="p-1 rounded text-slate-400 hover:text-white transition"
              title="Збільшити масштаб таймлайну"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Track Scroll Area */}
      <div
        ref={containerRef}
        onMouseDown={handleTimelineMouseDown}
        className="flex-1 overflow-x-auto overflow-y-auto relative custom-scrollbar flex"
      >
        {/* Left Fixed Track Header Labels */}
        <div className="w-44 border-r border-slate-800 bg-slate-950 shrink-0 sticky left-0 z-20 shadow-lg">
          {/* Header corner ruler label */}
          <div className="h-7 border-b border-slate-800 bg-slate-900 px-3 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
            <span>Доріжки</span>
            <span>4K HQ</span>
          </div>

          {/* Track Labels */}
          {tracks.map((t) => (
            <div
              key={t.index}
              className="h-12 border-b border-slate-800/80 px-3 flex items-center justify-between text-xs font-semibold text-slate-300 bg-slate-950/90"
            >
              <div className="flex items-center gap-2 truncate">
                <span>{t.icon}</span>
                <span className="truncate text-[11px]">{t.name}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Eye className="w-3 h-3 hover:text-slate-400 cursor-pointer" />
                <Lock className="w-3 h-3 hover:text-slate-400 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Tracks & Scrubber Lane */}
        <div className="relative min-h-full" style={{ width: `${totalWidth}px` }}>
          {/* Time Ruler Top */}
          <div className="h-7 border-b border-slate-800 bg-slate-900/60 relative cursor-pointer">
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => (
              <div
                key={sec}
                className="absolute top-0 bottom-0 border-l border-slate-800 text-[9px] font-mono text-slate-400 pl-1 pt-1 select-none pointer-events-none"
                style={{ left: `${sec * zoomLevel}px` }}
              >
                00:{String(sec).padStart(2, '0')}
              </div>
            ))}

            {/* Team Comment Markers on Ruler */}
            {comments.map((comment) => (
              <div
                key={comment.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(comment.timestamp);
                }}
                className="absolute top-1 -translate-x-1/2 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-md cursor-pointer hover:scale-125 transition z-10"
                style={{ left: `${comment.timestamp * zoomLevel}px` }}
                title={`${comment.author}: ${comment.text}`}
              >
                💬
              </div>
            ))}
          </div>

          {/* Tracks Content */}
          <div className="relative">
            {tracks.map((track) => {
              const trackClips = clips.filter((c) => c.trackIndex === track.index);
              return (
                <div
                  key={track.index}
                  className="h-12 border-b border-slate-800/80 relative bg-slate-950/40"
                >
                  {/* Grid lines */}
                  {Array.from({ length: Math.ceil(duration) + 1 }).map((_, sec) => (
                    <div
                      key={sec}
                      className="absolute top-0 bottom-0 border-l border-slate-900/60 pointer-events-none"
                      style={{ left: `${sec * zoomLevel}px` }}
                    />
                  ))}

                  {/* Clips on this track */}
                  {trackClips.map((clip) => {
                    const isSelected = selectedClipId === clip.id;
                    const clipLeft = clip.startTime * zoomLevel;
                    const clipWidth = Math.max(30, clip.duration * zoomLevel);

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip);
                        }}
                        className={`absolute top-1 bottom-1 rounded-lg border flex items-center px-2 cursor-pointer transition select-none group overflow-hidden ${
                          isSelected
                            ? 'ring-2 ring-cyan-400 border-white z-10'
                            : 'border-slate-700/80 hover:border-slate-500'
                        }`}
                        style={{
                          left: `${clipLeft}px`,
                          width: `${clipWidth}px`,
                          backgroundColor:
                            clip.trackIndex === 0
                              ? '#0e3a53'
                              : clip.trackIndex === 1
                              ? '#261b4d'
                              : clip.trackIndex === 2
                              ? '#422006'
                              : '#3b0764',
                        }}
                      >
                        {/* Thumbnail or wave */}
                        {clip.thumbnailUrl && (
                          <img
                            src={clip.thumbnailUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover mr-1.5 shrink-0 opacity-80"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold text-white truncate">{clip.title}</p>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-mono">
                            <span>{clip.duration.toFixed(1)}с</span>
                            {clip.filterPreset && clip.filterPreset !== 'none' && (
                              <span className="text-cyan-300">FX</span>
                            )}
                            {clip.transitionIn && clip.transitionIn.type !== 'none' && (
                              <span className="text-emerald-300">⚡{clip.transitionIn.type}</span>
                            )}
                          </div>
                        </div>

                        {/* Drag handles for visual trim */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 group-hover:bg-cyan-400 cursor-ew-resize" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 group-hover:bg-cyan-400 cursor-ew-resize" />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Playhead Scrubber Red Line with Head */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-30 transition-all duration-75"
              style={{ left: `${currentTime * zoomLevel}px` }}
            >
              {/* Playhead Marker Pin */}
              <div className="w-3.5 h-3.5 bg-red-500 -translate-x-1/2 rotate-45 -mt-1 shadow-md shadow-red-500/40" />
              <div className="w-[2px] bg-red-500 h-full -ml-[1px]" />
            </div>

            {/* Teammates Cursor Indicators on Timeline */}
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${member.cursorSec * zoomLevel}px` }}
              >
                <div
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white -translate-x-1/2 -mt-4 shadow"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.split(' ')[0]}
                </div>
                <div
                  className="w-[1.5px] h-full -ml-[1px] opacity-75"
                  style={{ backgroundColor: member.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
