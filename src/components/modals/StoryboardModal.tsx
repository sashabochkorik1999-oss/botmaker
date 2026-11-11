import React, { useState } from 'react';
import {
  X,
  Layers,
  Sparkles,
  Play,
  CheckCircle2,
  Plus,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { MediaClip } from '../../types/video';

interface StoryboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStoryboard: (scenes: Array<Partial<MediaClip>>) => void;
}

export const StoryboardModal: React.FC<StoryboardModalProps> = ({
  isOpen,
  onClose,
  onApplyStoryboard,
}) => {
  const [scriptInput, setScriptInput] = useState(
    'Подорож крізь неоновий кіберпанк мегаполіс до квантової лабораторії майбутнього, де створюється перший штучний інтелект з 4K свідомістю.'
  );
  const [style, setStyle] = useState('Cinematic 4K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<Array<any>>([
    {
      id: 'scene-1',
      title: 'Сцена 1: Неоновий світанок',
      prompt: 'Wide cinematic drone shot flying over a rain-slicked cyberpunk metropolis with glowing holographic advertisements, 4K HDR.',
      duration: 4,
      transition: 'Cross Dissolve',
      camera: 'Slow Push In',
      caption: 'Майбутнє починається на межі світла й тіні...',
      soundEffect: 'Deep Cinematic Whoosh',
      generatorType: 'procedural-cyberpunk',
      thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'scene-2',
      title: 'Сцена 2: Квантова нейромережа',
      prompt: 'Intricate close-up of quantum neural processor glowing with cyan neural synaptic sparks, depth of field.',
      duration: 5,
      transition: 'Zoom Blur',
      camera: 'Orbit 180',
      caption: 'Мільярди квантових звʼязків оживають за мілісекунду',
      soundEffect: 'Subtle Bass Impact',
      generatorType: 'procedural-neural',
      thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'scene-3',
      title: 'Сцена 3: Горизонт нових можливостей',
      prompt: 'Majestic sunrise over futuristic glass towers with lens flare and soaring flying vehicles, photorealistic 8K.',
      duration: 6,
      transition: 'Film Burn',
      camera: 'Slow Pull Back',
      caption: 'NovaCinema AI: Створюйте кіно одним словом',
      soundEffect: 'Orchestral Climax',
      generatorType: 'procedural-mountains',
      thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  if (!isOpen) return null;

  const handleGenerateStoryboard = async () => {
    if (!scriptInput.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptInput, style }),
      });
      const data = await res.json();
      if (data.scenes && Array.isArray(data.scenes)) {
        const enriched = data.scenes.map((s: any, idx: number) => ({
          ...s,
          generatorType:
            idx === 0 ? 'procedural-cyberpunk' : idx === 1 ? 'procedural-neural' : 'procedural-mountains',
          thumb:
            idx === 0
              ? 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80'
              : idx === 1
              ? 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80'
              : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        }));
        setGeneratedScenes(enriched);
      }
    } catch (err) {
      console.error('Storyboard error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToTimeline = () => {
    const clipsToApply: Array<Partial<MediaClip>> = [];
    let curTime = 0;

    generatedScenes.forEach((scene, idx) => {
      // 1. Video Clip
      clipsToApply.push({
        title: scene.title,
        type: 'video',
        trackIndex: 0,
        startTime: curTime,
        duration: scene.duration || 5,
        generatorType: scene.generatorType || 'procedural-cyberpunk',
        prompt: scene.prompt,
        thumbnailUrl: scene.thumb,
        transitionIn: {
          type: idx === 0 ? 'fade' : 'dissolve',
          duration: 0.8,
        },
        filterPreset: 'hdr-4k',
      });

      // 2. Subtitle / Voiceover text clip
      if (scene.caption) {
        clipsToApply.push({
          title: `Титр: ${scene.caption.slice(0, 15)}...`,
          type: 'text',
          trackIndex: 2,
          startTime: curTime + 0.5,
          duration: Math.max(2, (scene.duration || 5) - 1),
          textConfig: {
            content: scene.caption,
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 34,
            color: '#ffffff',
            accentColor: '#38bdf8',
            animation: 'kinetic',
            positionY: 80,
            positionX: 50,
            bgPill: true,
            outline: true,
            glow: true,
          },
        });
      }

      curTime += scene.duration || 5;
    });

    onApplyStoryboard(clipsToApply);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">ШІ Сценарист: Текст у Сториборд 4K</h3>
              <p className="text-[11px] text-slate-400">Перетворення ідеї на готову послідовність сцен</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Script Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ідея або сценарій ролика</label>
            <textarea
              rows={3}
              value={scriptInput}
              onChange={(e) => setScriptInput(e.target.value)}
              placeholder="Опишіть історію, сюжет або тему відео..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3">
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Cinematic 4K">Стиль: Кінематографічний 4K</option>
              <option value="Cyberpunk Neon">Стиль: Кіберпанк Неон</option>
              <option value="Documentary 35mm">Стиль: Документальний 35мм</option>
              <option value="Anime Shinkai">Стиль: Аніме Макото Сінкай</option>
            </select>

            <button
              onClick={handleGenerateStoryboard}
              disabled={isGenerating}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'ШІ створює сцени...' : 'Згенерувати сцени ШІ'}</span>
            </button>
          </div>

          {/* Generated Scenes List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">
              Згенеровані сцени сториборду ({generatedScenes.length})
            </label>

            <div className="space-y-2.5">
              {generatedScenes.map((scene, i) => (
                <div
                  key={scene.id || i}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3"
                >
                  <img
                    src={scene.thumb}
                    alt=""
                    className="w-20 h-14 rounded-lg object-cover shrink-0 border border-slate-800"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{scene.title}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {scene.duration} сек
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{scene.prompt}</p>
                    {scene.caption && (
                      <div className="text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                        <span>💬 Титр:</span>
                        <span className="italic">"{scene.caption}"</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApplyToTimeline}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Застосувати сцени та субтитри до таймлайну</span>
          </button>
        </div>
      </div>
    </div>
  );
};
