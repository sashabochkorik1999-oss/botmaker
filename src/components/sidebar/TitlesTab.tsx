import React, { useState } from 'react';
import {
  Type,
  Sparkles,
  Plus,
  Wand2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Check,
} from 'lucide-react';
import { TITLE_PRESETS } from '../../data/stockMedia';
import { MediaClip, TextAnimationType, TextConfig } from '../../types/video';

interface TitlesTabProps {
  onAddClipToTimeline: (clip: Partial<MediaClip>) => void;
  timelineDuration: number;
}

export const TitlesTab: React.FC<TitlesTabProps> = ({
  onAddClipToTimeline,
  timelineDuration,
}) => {
  const [textContent, setTextContent] = useState('МАЙБУТНЄ СТВОРЮЄТЬСЯ ШІ');
  const [selectedAnimation, setSelectedAnimation] = useState<TextAnimationType>('kinetic');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [fontSize, setFontSize] = useState(38);
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [positionY, setPositionY] = useState(78); // 78% is typical bottom subtitle position
  const [bgPill, setBgPill] = useState(true);
  const [outline, setOutline] = useState(true);
  const [glow, setGlow] = useState(true);
  const [duration, setDuration] = useState(4);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  // Quick font colors
  const colorOptions = ['#ffffff', '#facc15', '#38bdf8', '#f43f5e', '#a855f7', '#4ade80'];

  const handleAddTitle = () => {
    if (!textContent.trim()) return;

    const textConfig: TextConfig = {
      content: textContent,
      fontFamily,
      fontSize,
      color: textColor,
      accentColor,
      animation: selectedAnimation,
      positionY,
      positionX: 50,
      bgPill,
      outline,
      glow,
    };

    onAddClipToTimeline({
      title: `Титр: ${textContent.slice(0, 16)}...`,
      type: 'text',
      trackIndex: 2, // Track 2 is Titles
      duration,
      textConfig,
      color: '#38bdf8',
    });
  };

  // AI Auto Captions Generator
  const handleGenerateAICaptions = async () => {
    setIsGeneratingCaptions(true);
    try {
      const res = await fetch('/api/gemini/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textContent || 'Створюйте неймовірні ШІ відео у 4K форматі швидко та якісно',
          videoLength: Math.max(8, timelineDuration),
        }),
      });
      const data = await res.json();
      if (data.captions && Array.isArray(data.captions)) {
        data.captions.forEach((cap: any) => {
          onAddClipToTimeline({
            title: `Субтитр: ${cap.text.slice(0, 12)}`,
            type: 'text',
            trackIndex: 2,
            startTime: cap.startTime,
            duration: Math.max(1.5, cap.endTime - cap.startTime),
            textConfig: {
              content: cap.text,
              fontFamily: 'Plus Jakarta Sans',
              fontSize: 32,
              color: '#ffffff',
              accentColor: '#facc15',
              animation: 'karaoke',
              positionY: 82,
              positionX: 50,
              bgPill: true,
              outline: true,
              glow: false,
            },
          });
        });
      }
    } catch (err) {
      console.error('Caption error:', err);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Анімовані Титри & Текст
            </h3>
            <p className="text-[11px] text-slate-400">Кінетична типографіка та субтитри</p>
          </div>
        </div>

        {/* AI Auto-Captions button */}
        <button
          onClick={handleGenerateAICaptions}
          disabled={isGeneratingCaptions}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold transition"
          title="Автоматичні ШІ субтитри по всьому таймлайну"
        >
          <Sparkles className={`w-3 h-3 text-indigo-400 ${isGeneratingCaptions ? 'animate-spin' : ''}`} />
          <span>{isGeneratingCaptions ? 'Генерація...' : 'ШІ Субтитри'}</span>
        </button>
      </div>

      {/* Text Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300">Текст титру / субтитру</label>
        <input
          type="text"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Введіть текст..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-medium"
        />
      </div>

      {/* Animation Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-300">Анімація появи</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
          {TITLE_PRESETS.map((preset) => {
            const active = selectedAnimation === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedAnimation(preset.id)}
                className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                  active
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${active ? 'text-amber-300' : 'text-slate-300'}`}>
                    {preset.name}
                  </span>
                  {active && <Check className="w-3 h-3 text-amber-400" />}
                </div>
                <span className="text-[9px] text-slate-500 truncate mt-0.5">{preset.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography Customization */}
      <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 space-y-3">
        {/* Font size & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300 font-medium">
              <span>Розмір</span>
              <span className="text-amber-400 font-mono">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="18"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300 font-medium">
              <span>Позиція Y</span>
              <span className="text-amber-400 font-mono">{positionY}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              value={positionY}
              onChange={(e) => setPositionY(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Колір шрифту</span>
            <span className="font-mono text-[10px] text-slate-400">{textColor}</span>
          </label>
          <div className="flex items-center gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setTextColor(c)}
                className={`w-6 h-6 rounded-full border transition ${
                  textColor === c ? 'scale-110 border-amber-400 shadow-md ring-2 ring-amber-500/40' : 'border-slate-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Toggles: Background Pill, Outline, Glow */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setBgPill(!bgPill)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
              bgPill
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Плашка (Pill)
          </button>
          <button
            onClick={() => setOutline(!outline)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
              outline
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Обведення
          </button>
          <button
            onClick={() => setGlow(!glow)}
            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
              glow
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Світіння
          </button>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddTitle}
        disabled={!textContent.trim()}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition active:scale-[0.98] disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        <span>Накласти титр на відео (Таймлайн)</span>
      </button>
    </div>
  );
};
