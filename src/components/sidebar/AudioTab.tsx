import React, { useState } from 'react';
import {
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Sparkles,
  Radio,
  Zap,
} from 'lucide-react';
import { STOCK_AUDIO } from '../../data/stockMedia';
import { StockAudioItem, MediaClip } from '../../types/video';
import { audioEngine } from '../../services/audioEngine';

interface AudioTabProps {
  onAddClipToTimeline: (clip: Partial<MediaClip>) => void;
}

export const AudioTab: React.FC<AudioTabProps> = ({ onAddClipToTimeline }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handlePlayPreview = (audio: StockAudioItem) => {
    if (playingAudioId === audio.id) {
      audioEngine.stopSoundtrackLoop();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(audio.id);
    if (audio.sfxSynthType) {
      audioEngine.playSFX(audio.sfxSynthType);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, audio.duration * 1000);
    } else {
      audioEngine.startSoundtrackLoop();
    }
  };

  const handleAddAudio = (audio: StockAudioItem) => {
    onAddClipToTimeline({
      title: audio.title,
      type: 'audio',
      trackIndex: 3, // Track 3 is Audio & SFX
      duration: Math.min(15, audio.duration),
      volume: 80,
      audioWaveform: audio.waveform,
      color: '#a855f7',
    });
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Музика та Звукові Ефекти
            </h3>
            <p className="text-[11px] text-slate-400">Роялті-фрі саундтреки та кіно-SFX</p>
          </div>
        </div>
      </div>

      {/* Audio List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {STOCK_AUDIO.map((audio) => {
          const isPlaying = playingAudioId === audio.id;
          return (
            <div
              key={audio.id}
              className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                isPlaying
                  ? 'bg-purple-950/40 border-purple-500/60 shadow-sm shadow-purple-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handlePlayPreview(audio)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0 ${
                      isPlaying
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{audio.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="capitalize">{audio.genre}</span>
                      <span>•</span>
                      <span className="font-mono text-purple-300">{audio.duration}с</span>
                      {audio.bpm && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{audio.bpm} BPM</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddAudio(audio)}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition flex items-center gap-1 shrink-0"
                  title="Додати на аудіодоріжку таймлайну"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Додати</span>
                </button>
              </div>

              {/* Waveform graphic */}
              <div className="h-6 flex items-center gap-1 bg-slate-950/60 rounded px-2 overflow-hidden">
                {audio.waveform.map((bar, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'
                    }`}
                    style={{ height: `${bar}%` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
