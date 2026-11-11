import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Shield,
  Copy,
  Check,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TeamMember, TimelineComment } from '../../types/video';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  comments: TimelineComment[];
  onAddTeamMember: (member: TeamMember) => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  comments,
  onAddTeamMember,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Монтажер (Editor)');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const colors = ['#38bdf8', '#f43f5e', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];
    const newMember: TeamMember = {
      id: `u_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      role: inviteRole,
      color: colors[Math.floor(Math.random() * colors.length)],
      activeTrack: 'Video Track 1',
      cursorSec: 0,
      avatar: '',
      isOnline: true,
    };

    onAddTeamMember(newMember);
    setInviteEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Командна співпраця у реальному часі</h3>
              <p className="text-[11px] text-slate-400">Спільний відеомонтаж, курсори та коментарі</p>
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
          {/* Share Link Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Пряме посилання на спільну кімнату</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Синхронізація активна
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Скопійовано' : 'Скопіювати'}</span>
              </button>
            </div>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInvite} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Запросити учасника</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Введіть email колеги..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Редактор (Editor)">Редактор</option>
                <option value="Колорист (Colorist)">Колорист</option>
                <option value="Звукорежисер (Sound)">Звукорежисер</option>
                <option value="Глядач (Viewer)">Глядач</option>
              </select>

              <button
                type="submit"
                disabled={!inviteEmail.trim()}
                className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Додати</span>
              </button>
            </div>
          </form>

          {/* Active Members List */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">
              Поточна команда у проєкті ({teamMembers.length})
            </label>

            <div className="space-y-1.5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{member.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5 text-sky-400" />
                          <span>{member.role}</span>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-400">Онлайн на таймлайні</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    {member.activeTrack}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
