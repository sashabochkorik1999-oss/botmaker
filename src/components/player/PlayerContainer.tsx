import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Grid,
  CheckCircle2,
  Sparkles,
  Eye,
} from 'lucide-react';
import { MediaClip, AspectRatio, Resolution } from '../../types/video';
import { VideoRendererService } from '../../services/videoRenderer';
import { audioEngine } from '../../services/audioEngine';

interface PlayerContainerProps {
  clips: MediaClip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  onChangeResolution: (res: Resolution) => void;
}

export const PlayerContainer: React.FC<PlayerContainerProps> = ({
  clips,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  aspectRatio,
  resolution,
  onChangeResolution,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    VideoRendererService.renderFrame({
      canvas,
      ctx,
      currentTime,
      clips,
      aspectRatio,
      resolution,
    });
  }, [currentTime, clips, aspectRatio, resolution]);

  // Audio mute sync
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMute(next);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  // Format timecode
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  };

  // Aspect ratio style calculation for responsive player box
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[58vh]';
      case '1:1':
        return 'aspect-square max-h-[58vh]';
      case '21:9':
        return 'aspect-[21/9] w-full max-h-[58vh]';
      case '16:9':
      default:
        return 'aspect-video w-full max-h-[58vh]';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-950 flex flex-col justify-between p-3 select-none overflow-hidden relative"
    >
      {/* Top Status Bar over player */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1 mb-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            ПЕРЕГЛЯД НАЖИВО
          </span>

          {/* Resolution Badge Picker */}
          <select
            value={resolution}
            onChange={(e) => onChangeResolution(e.target.value as Resolution)}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
          >
            <option value="4K">4K UHD (3840x2160)</option>
            <option value="2K">2K QHD (2560x1440)</option>
            <option value="1080p">1080p FHD (1920x1080)</option>
            <option value="720p">720p HD</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Zones Toggle */}
          <button
            onClick={() => setShowSafeZones(!showSafeZones)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition ${
              showSafeZones
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Показати межі безпечної зони для TikTok/Reels"
          >
            <Grid className="w-3 h-3" />
            <span>Безпечна зона</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport with Shadow / Border */}
      <div className="flex-1 flex items-center justify-center p-1 relative min-h-0">
        <div
          className={`relative rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/40 border border-slate-800 bg-black flex items-center justify-center ${getAspectRatioClass()}`}
        >
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Social Safe Zones Overlay */}
          {showSafeZones && (
            <div className="absolute inset-0 pointer-events-none border border-dashed border-cyan-400/40 m-6 flex flex-col justify-between p-3">
              <span className="text-[10px] text-cyan-400/60 font-mono">TikTok Safe Area Top</span>
              <span className="text-[10px] text-cyan-400/60 font-mono self-center">Action Safe (90%)</span>
              <span className="text-[10px] text-cyan-400/60 font-mono self-end">Caption Zone Bottom</span>
            </div>
          )}

          {/* Center Play Overlay when paused and hovered */}
          {!isPlaying && (
            <button
              onClick={onTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition group"
            >
              <div className="w-14 h-14 rounded-full bg-cyan-500/90 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 group-hover:scale-110 transition">
                <Play className="w-7 h-7 ml-1 fill-current" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="h-12 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 px-4 flex items-center justify-between text-white mt-2 shrink-0">
        {/* Timecode */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>

        {/* Center Transport Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Jump to start */}
          <button
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="На початок (Home)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 1 / 30))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Крок назад (-1 кадр)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Master Button */}
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-md shadow-cyan-500/25 transition"
            title="Відтворити / Пауза (Пробіл)"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-current" />
            )}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 1 / 30))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Крок вперед (+1 кадр)"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls: Volume & Fullscreen */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition"
              title={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVolume(v);
                if (isMuted && v > 0) {
                  setIsMuted(false);
                  audioEngine.setMute(false);
                }
              }}
              className="w-16 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400 hidden sm:block"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="На весь екран"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
