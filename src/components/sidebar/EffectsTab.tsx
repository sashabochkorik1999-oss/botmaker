import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Check,
  Layers,
  Wand2,
  Zap,
  Flame,
  Sun,
  Contrast,
  CircleDot,
} from 'lucide-react';
import { TRANSITION_PRESETS, FILTER_PRESETS } from '../../data/stockMedia';
import { TransitionType, FilterPresetType, FilterSettings, MediaClip } from '../../types/video';

interface EffectsTabProps {
  selectedClip: MediaClip | null;
  onUpdateClip: (clipId: string, updates: Partial<MediaClip>) => void;
  onApplyToAllClips: (updates: Partial<MediaClip>) => void;
}

export const EffectsTab: React.FC<EffectsTabProps> = ({
  selectedClip,
  onUpdateClip,
  onApplyToAllClips,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'filters' | 'transitions'>('filters');

  // Filter settings local state
  const currentSettings: FilterSettings = selectedClip?.filterSettings || {
    brightness: 100,
    contrast: 105,
    saturation: 110,
    grain: 15,
    vignette: 25,
    blur: 0,
    chromatic: 0,
  };

  const handlePresetSelect = (presetId: FilterPresetType) => {
    let settings: FilterSettings = { ...currentSettings };
    if (presetId === 'hdr-4k') {
      settings = { brightness: 105, contrast: 120, saturation: 115, grain: 0, vignette: 30, blur: 0, chromatic: 0 };
    } else if (presetId === 'teal-orange') {
      settings = { brightness: 100, contrast: 125, saturation: 130, grain: 10, vignette: 35, blur: 0, chromatic: 2 };
    } else if (presetId === 'cyberpunk') {
      settings = { brightness: 110, contrast: 135, saturation: 150, grain: 15, vignette: 40, blur: 0, chromatic: 4 };
    } else if (presetId === 'vhs-retro') {
      settings = { brightness: 95, contrast: 110, saturation: 85, grain: 50, vignette: 45, blur: 2, chromatic: 6 };
    } else if (presetId === 'film-grain') {
      settings = { brightness: 100, contrast: 115, saturation: 100, grain: 65, vignette: 30, blur: 0, chromatic: 1 };
    } else if (presetId === 'monochrome') {
      settings = { brightness: 100, contrast: 140, saturation: 0, grain: 35, vignette: 50, blur: 0, chromatic: 0 };
    }

    if (selectedClip) {
      onUpdateClip(selectedClip.id, {
        filterPreset: presetId,
        filterSettings: settings,
      });
    } else {
      onApplyToAllClips({
        filterPreset: presetId,
        filterSettings: settings,
      });
    }
  };

  const handleSettingChange = (key: keyof FilterSettings, value: number) => {
    const updated = { ...currentSettings, [key]: value };
    if (selectedClip) {
      onUpdateClip(selectedClip.id, { filterSettings: updated });
    } else {
      onApplyToAllClips({ filterSettings: updated });
    }
  };

  const handleTransitionSelect = (type: TransitionType) => {
    if (selectedClip) {
      onUpdateClip(selectedClip.id, {
        transitionIn: { type, duration: 0.8 },
      });
    } else {
      onApplyToAllClips({
        transitionIn: { type, duration: 0.8 },
      });
    }
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Переходи & FX Ефекти
            </h3>
            <p className="text-[11px] text-slate-400">Голлівудські пресети та корекція кольору</p>
          </div>
        </div>
      </div>

      {/* Target Clip indicator */}
      <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Об'єкт:</span>
          <span className="font-semibold text-cyan-300 truncate">
            {selectedClip ? selectedClip.title : 'Усі відеокліпи (Глобально)'}
          </span>
        </div>
        {selectedClip && (
          <button
            onClick={() => onApplyToAllClips({ filterPreset: selectedClip.filterPreset, filterSettings: currentSettings })}
            className="text-[10px] text-slate-400 hover:text-white underline shrink-0 ml-2"
          >
            До всіх
          </button>
        )}
      </div>

      {/* Sub Tabs: Filters vs Transitions */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('filters')}
          className={`py-1.5 rounded-md transition ${
            activeSubTab === 'filters' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Колір & Фільтри
        </button>
        <button
          onClick={() => setActiveSubTab('transitions')}
          className={`py-1.5 rounded-md transition ${
            activeSubTab === 'transitions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Переходи (Transitions)
        </button>
      </div>

      {activeSubTab === 'filters' ? (
        <div className="space-y-4">
          {/* Preset Buttons Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Кінематографічні пресети</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {FILTER_PRESETS.map((preset) => {
                const active = (selectedClip?.filterPreset || 'hdr-4k') === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                      active
                        ? 'bg-emerald-950/50 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.color }} />
                        <span className={`text-[11px] font-bold ${active ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {preset.name}
                        </span>
                      </div>
                      {active && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[9px] text-slate-500 truncate mt-1">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Granular Sliders */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Точне налаштування ефектів</span>
            </h4>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Контраст 4K</span>
                <span className="font-mono text-emerald-400">{currentSettings.contrast}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="180"
                value={currentSettings.contrast}
                onChange={(e) => handleSettingChange('contrast', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Saturation */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Насиченість кольору</span>
                <span className="font-mono text-emerald-400">{currentSettings.saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={currentSettings.saturation}
                onChange={(e) => handleSettingChange('saturation', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Film Grain */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Зерно 35мм плівки</span>
                <span className="font-mono text-emerald-400">{currentSettings.grain}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentSettings.grain}
                onChange={(e) => handleSettingChange('grain', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Vignette */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Віньєтка (Затемнення країв)</span>
                <span className="font-mono text-emerald-400">{currentSettings.vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={currentSettings.vignette}
                onChange={(e) => handleSettingChange('vignette', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Transitions Tab */
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">
              Оберіть перехід на вході в кліп
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {TRANSITION_PRESETS.map((trans) => {
                const active = selectedClip?.transitionIn?.type === trans.id;
                return (
                  <button
                    key={trans.id}
                    onClick={() => handleTransitionSelect(trans.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      active
                        ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{trans.icon}</span>
                      <div>
                        <div className="text-xs font-bold">{trans.name}</div>
                        <div className="text-[10px] text-slate-500">{trans.desc}</div>
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
