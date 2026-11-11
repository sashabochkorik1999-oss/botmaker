import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Video,
  Sliders,
  Plus,
  Play,
  Check,
  RefreshCw,
  Camera,
  Layers,
  Flame,
} from 'lucide-react';
import { AI_PROMPT_STYLES, CAMERA_PRESETS } from '../../data/stockMedia';
import { MediaClip, AspectRatio } from '../../types/video';

interface AIGeneratorTabProps {
  onAddClipToTimeline: (clip: Partial<MediaClip>) => void;
  aspectRatio: AspectRatio;
}

export const AIGeneratorTab: React.FC<AIGeneratorTabProps> = ({
  onAddClipToTimeline,
  aspectRatio,
}) => {
  const [prompt, setPrompt] = useState('Футуристичний кіберпанк хмарочос у неоновому дощі, голографічні кіти плавають у хмарах');
  const [selectedStyle, setSelectedStyle] = useState(AI_PROMPT_STYLES[0].id);
  const [selectedCamera, setSelectedCamera] = useState('Pan');
  const [motionIntensity, setMotionIntensity] = useState(7);
  const [duration, setDuration] = useState(5);
  const [negativePrompt, setNegativePrompt] = useState('blurry, low-res, deformed, artifact, pixelated');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  // Recently generated clips
  const [generatedClips, setGeneratedClips] = useState<Array<{
    id: string;
    prompt: string;
    generatorType: MediaClip['generatorType'];
    duration: number;
    styleName: string;
    thumb: string;
  }>>([
    {
      id: 'gen-init-1',
      prompt: 'Неонове місто майбутнього з голографічними рибами в небі',
      generatorType: 'procedural-cyberpunk',
      duration: 5,
      styleName: 'Cyberpunk Neon',
      thumb: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'gen-init-2',
      prompt: 'Квантова ШІ-нейромережа, що формує свідомість у 4K',
      generatorType: 'procedural-neural',
      duration: 6,
      styleName: 'Photorealistic 8K',
      thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  // AI Prompt Enhance with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/gemini/prompt-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: AI_PROMPT_STYLES.find((s) => s.id === selectedStyle)?.name || 'Cinematic',
          camera: selectedCamera,
        }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhance error:', err);
      // Fallback enhancement
      setPrompt(
        `4K master shot of ${prompt}, 35mm anamorphic lens, volumetric golden light, atmospheric particles, ${selectedCamera} motion, cinematic grading, 8K ultra detail.`
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Video
  const handleGenerateVideo = () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGenProgress(0);

    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return prev + Math.floor(Math.random() * 15 + 8);
      });
    }, 280);

    setTimeout(() => {
      clearInterval(interval);
      setGenProgress(100);

      // Determine generator visual type based on style or prompt keywords
      const p = prompt.toLowerCase();
      let genType: MediaClip['generatorType'] = 'procedural-cyberpunk';
      if (p.includes('нейро') || p.includes('техно') || p.includes('quantum') || p.includes('код')) {
        genType = 'procedural-neural';
      } else if (p.includes('гори') || p.includes('дрон') || p.includes('альп') || p.includes('природ')) {
        genType = 'procedural-mountains';
      } else if (p.includes('океан') || p.includes('хвил') || p.includes('пляж') || p.includes('море')) {
        genType = 'procedural-waves';
      } else if (p.includes('космос') || p.includes('галактик') || p.includes('зірк') || p.includes('туманн')) {
        genType = 'procedural-nebula';
      } else if (p.includes('матриц') || p.includes('matrix')) {
        genType = 'procedural-matrix';
      }

      const styleObj = AI_PROMPT_STYLES.find((s) => s.id === selectedStyle);
      const newClip = {
        id: `ai_${Date.now()}`,
        prompt: prompt.slice(0, 80) + '...',
        generatorType: genType,
        duration,
        styleName: styleObj?.name || 'Cinematic 4K',
        thumb:
          genType === 'procedural-cyberpunk'
            ? 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80'
            : genType === 'procedural-neural'
            ? 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80'
            : genType === 'procedural-mountains'
            ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80'
            : 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
      };

      setGeneratedClips((prev) => [newClip, ...prev]);
      setIsGenerating(false);

      // Auto add to timeline
      onAddClipToTimeline({
        title: `ШІ: ${prompt.slice(0, 24)}...`,
        duration,
        generatorType: genType,
        prompt,
        thumbnailUrl: newClip.thumb,
        filterPreset: selectedStyle === 'cyberpunk' ? 'cyberpunk' : selectedStyle === 'retro' ? 'vhs-retro' : 'hdr-4k',
      });
    }, 2400);
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              ШІ Генератор Відео
            </h3>
            <p className="text-[11px] text-slate-400">Генерація за текстовим описом 4K</p>
          </div>
        </div>
        <span className="text-[10px] bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-500/30">
          БЕЗКОШТОВНО
        </span>
      </div>

      {/* Prompt Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300">Опис відео (Промпт)</label>
          <button
            onClick={handleEnhancePrompt}
            disabled={isEnhancing}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition font-medium disabled:opacity-50"
            title="ШІ покращує ваш промпт кінематографічними деталями"
          >
            <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'ШІ покращує...' : 'Покращити ШІ'}</span>
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Опишіть сцену, світло, рух персонажів, наприклад: 'Політ дрона над нічним океаном з неоновими хвилями'..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/60 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 resize-none transition"
        />
      </div>

      {/* Style Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300">Візуальний стиль</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
          {AI_PROMPT_STYLES.map((style) => {
            const active = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                  active
                    ? 'bg-cyan-950/60 border-cyan-500/60 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${active ? 'text-white' : 'text-slate-300'}`}>
                    {style.name}
                  </span>
                  {active && <Check className="w-3 h-3 text-cyan-400" />}
                </div>
                <span className="text-[9px] text-cyan-400/80 font-mono mt-0.5">{style.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera Motion & Motion Intensity */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>Рух камери</span>
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {CAMERA_PRESETS.map((cam) => (
              <option key={cam.id} value={cam.id}>
                {cam.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Інтенсивність</span>
            </span>
            <span className="text-cyan-400 font-mono text-[11px]">{motionIntensity}x</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={motionIntensity}
            onChange={(e) => setMotionIntensity(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* Duration selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300">Тривалість кліпу</label>
          <span className="text-xs font-mono text-cyan-400">{duration} сек</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[3, 5, 8, 10].map((sec) => (
            <button
              key={sec}
              onClick={() => setDuration(sec)}
              className={`py-1.5 rounded-md text-xs font-mono font-medium border transition ${
                duration === sec
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {sec}с
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateVideo}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
          isGenerating
            ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white shadow-cyan-500/20 active:scale-[0.98]'
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Генерація ШІ {genProgress}% (4K Render)...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>Згенерувати ШІ-Відео (Безкоштовно)</span>
          </>
        )}
      </button>

      {/* Generation Progress Bar */}
      {isGenerating && (
        <div className="space-y-1 bg-slate-900/90 p-2.5 rounded-lg border border-cyan-500/30">
          <div className="flex justify-between text-[11px] text-cyan-300">
            <span>Обробка нейромережею...</span>
            <span className="font-mono">{genProgress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${genProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">Синтез 4K кадрів • 60 FPS • Кінематографічне світло</p>
        </div>
      )}

      {/* Generated Clips History */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span>Згенеровані кліпи ({generatedClips.length})</span>
          <span className="text-[10px] text-slate-500">Готові до монтажу</span>
        </div>

        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {generatedClips.map((clip) => (
            <div
              key={clip.id}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-2 group transition"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="relative w-14 h-10 rounded overflow-hidden shrink-0 border border-slate-800">
                  <img src={clip.thumb} alt={clip.prompt} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0.5 right-0.5 bg-black/80 font-mono text-[9px] px-1 rounded text-cyan-300">
                    {clip.duration}с
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{clip.prompt}</p>
                  <p className="text-[10px] text-cyan-400/90">{clip.styleName}</p>
                </div>
              </div>

              <button
                onClick={() =>
                  onAddClipToTimeline({
                    title: clip.prompt.slice(0, 20),
                    duration: clip.duration,
                    generatorType: clip.generatorType,
                    thumbnailUrl: clip.thumb,
                  })
                }
                className="shrink-0 p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition text-xs flex items-center gap-1 font-medium"
                title="Додати кліп на таймлайн"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Монтаж</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
