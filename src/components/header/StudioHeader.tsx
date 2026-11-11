import React, { useState } from 'react';
import {
  Sparkles,
  CloudLightning,
  Share2,
  Download,
  Users,
  Monitor,
  Smartphone,
  Square,
  Film,
  CheckCircle2,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { AspectRatio, TeamMember } from '../../types/video';

interface StudioHeaderProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  teamMembers: TeamMember[];
  onOpenExportModal: () => void;
  onOpenSocialModal: () => void;
  onOpenTeamModal: () => void;
  onOpenStoryboardModal: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  projectTitle,
  onUpdateTitle,
  aspectRatio,
  onChangeAspectRatio,
  teamMembers,
  onOpenExportModal,
  onOpenSocialModal,
  onOpenTeamModal,
  onOpenStoryboardModal,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
  };

  const aspectRatios: { id: AspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: '16:9', label: '16:9', icon: <Monitor className="w-3.5 h-3.5" />, desc: 'YouTube & TV' },
    { id: '9:16', label: '9:16', icon: <Smartphone className="w-3.5 h-3.5" />, desc: 'TikTok & Reels' },
    { id: '1:1', label: '1:1', icon: <Square className="w-3.5 h-3.5" />, desc: 'Instagram Feed' },
    { id: '21:9', label: '21:9', icon: <Film className="w-3.5 h-3.5" />, desc: 'Кіно Cinema' },
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur px-4 flex items-center justify-between text-white select-none z-30 shrink-0">
      {/* Brand & Project Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 border border-indigo-500/30">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-['Outfit']">
            NovaCinema <span className="text-cyan-400 font-mono text-xs font-semibold px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 ml-1">4K AI</span>
          </span>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        {/* Editable Title */}
        <div className="flex items-center gap-2 group">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-slate-900 border border-cyan-500/60 text-white text-xs px-2.5 py-1 rounded font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800/60 transition"
              title="Натисніть для перейменування проєкту"
            >
              <span>{projectTitle}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-400">✎</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hidden md:flex">
            <CheckCircle2 className="w-3 h-3" />
            <span>Хмара збережена</span>
          </div>
        </div>
      </div>

      {/* Center Controls: Aspect Ratio & Cloud Telemetry */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {aspectRatios.map((item) => {
            const active = aspectRatio === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeAspectRatio(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={item.desc}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cloud Speed Status */}
        <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-md">
          <CloudLightning className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-[11px]">H100 GPU • 12.4x</span>
        </div>
      </div>

      {/* Right Controls: Storyboard, Team, Social, Export */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Storyboard Script AI Modal Button */}
        <button
          onClick={onOpenStoryboardModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition text-xs font-semibold"
          title="Генерація цілого сценарію у сцени ШІ"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">ШІ Сценарій</span>
        </button>

        {/* Real-time Team Collaboration */}
        <button
          onClick={onOpenTeamModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition group"
          title="Командна співпраця у реальному часі"
        >
          <div className="flex -space-x-1.5 items-center">
            {teamMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-5 h-5 rounded-full border border-slate-950 flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
                style={{ backgroundColor: member.color }}
                title={`${member.name} (${member.role})`}
              >
                {member.name.slice(0, 1)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-300 font-medium hidden md:inline ml-1">
            Команда ({teamMembers.length})
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping hidden md:block" />
        </button>

        {/* Instant Social Publishing */}
        <button
          onClick={onOpenSocialModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-white transition text-xs font-semibold"
          title="Миттєва публікація у соцмережі (TikTok, YouTube, Reels, Telegram)"
        >
          <Share2 className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden sm:inline">Публікація</span>
        </button>

        {/* 4K Cloud Export Button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:from-cyan-400 hover:via-indigo-400 hover:to-fuchsia-400 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition active:scale-95"
          title="Хмарний рендеринг та експорт у 4K Ultra HD"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Експорт 4K</span>
        </button>
      </div>
    </header>
  );
};
