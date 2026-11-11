import React, { useState } from 'react';
import {
  Sparkles,
  Film,
  Type,
  Zap,
  Music,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AIGeneratorTab } from './AIGeneratorTab';
import { StockMediaTab } from './StockMediaTab';
import { TitlesTab } from './TitlesTab';
import { EffectsTab } from './EffectsTab';
import { AudioTab } from './AudioTab';
import { TeamTab } from './TeamTab';
import { MediaClip, AspectRatio, TeamMember, TimelineComment } from '../../types/video';

export type SidebarTabType = 'ai' | 'stock' | 'titles' | 'effects' | 'audio' | 'team';

interface SidebarProps {
  onAddClipToTimeline: (clip: Partial<MediaClip>) => void;
  selectedClip: MediaClip | null;
  onUpdateClip: (clipId: string, updates: Partial<MediaClip>) => void;
  onApplyToAllClips: (updates: Partial<MediaClip>) => void;
  aspectRatio: AspectRatio;
  timelineDuration: number;
  teamMembers: TeamMember[];
  comments: TimelineComment[];
  currentTime: number;
  onSeek: (time: number) => void;
  onAddComment: (text: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onAddClipToTimeline,
  selectedClip,
  onUpdateClip,
  onApplyToAllClips,
  aspectRatio,
  timelineDuration,
  teamMembers,
  comments,
  currentTime,
  onSeek,
  onAddComment,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTabType>('ai');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'ai', label: 'ШІ Генератор', icon: <Sparkles className="w-4 h-4" />, color: 'text-cyan-400', badge: 'Free' },
    { id: 'stock', label: 'Стоки 4K', icon: <Film className="w-4 h-4" />, color: 'text-pink-400' },
    { id: 'titles', label: 'Титри & Текст', icon: <Type className="w-4 h-4" />, color: 'text-amber-400' },
    { id: 'effects', label: 'Переходи & FX', icon: <Zap className="w-4 h-4" />, color: 'text-emerald-400' },
    { id: 'audio', label: 'Аудіо & SFX', icon: <Music className="w-4 h-4" />, color: 'text-purple-400' },
    { id: 'team', label: 'Команда', icon: <Users className="w-4 h-4" />, color: 'text-sky-400', count: teamMembers.length },
  ];

  return (
    <div className="flex h-full border-r border-slate-800 bg-slate-950 select-none z-20 shrink-0">
      {/* Icon Navigation Bar */}
      <div className="w-16 border-r border-slate-800 bg-slate-950/80 flex flex-col items-center py-3 gap-2 shrink-0">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as SidebarTabType);
                if (isCollapsed) setIsCollapsed(false);
              }}
              className={`relative w-11 h-11 rounded-xl flex flex-col items-center justify-center transition group ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-md shadow-cyan-500/10 border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title={item.label}
            >
              <div className={`${isActive ? item.color : 'text-slate-400 group-hover:text-white'} transition`}>
                {item.icon}
              </div>
              <span className="text-[9px] font-medium tracking-tight mt-0.5 truncate max-w-[44px]">
                {item.id === 'ai' ? 'ШІ' : item.id === 'stock' ? 'Стоки' : item.id === 'titles' ? 'Титри' : item.id === 'effects' ? 'FX' : item.id === 'audio' ? 'Звук' : 'Команда'}
              </span>

              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[8px] font-extrabold px-1 rounded-full uppercase">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.count}
                </span>
              )}

              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyan-400 rounded-r" />
              )}
            </button>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-900 transition"
            title={isCollapsed ? 'Розгорнути панель' : 'Згорнути панель'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tab Content Panel */}
      {!isCollapsed && (
        <div className="w-80 md:w-88 h-full overflow-y-auto bg-slate-950/60 custom-scrollbar">
          {activeTab === 'ai' && (
            <AIGeneratorTab onAddClipToTimeline={onAddClipToTimeline} aspectRatio={aspectRatio} />
          )}
          {activeTab === 'stock' && <StockMediaTab onAddClipToTimeline={onAddClipToTimeline} />}
          {activeTab === 'titles' && (
            <TitlesTab onAddClipToTimeline={onAddClipToTimeline} timelineDuration={timelineDuration} />
          )}
          {activeTab === 'effects' && (
            <EffectsTab
              selectedClip={selectedClip}
              onUpdateClip={onUpdateClip}
              onApplyToAllClips={onApplyToAllClips}
            />
          )}
          {activeTab === 'audio' && <AudioTab onAddClipToTimeline={onAddClipToTimeline} />}
          {activeTab === 'team' && (
            <TeamTab
              teamMembers={teamMembers}
              comments={comments}
              currentTime={currentTime}
              onSeek={onSeek}
              onAddComment={onAddComment}
            />
          )}
        </div>
      )}
    </div>
  );
};
