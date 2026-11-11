import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  Shield,
  Copy,
  Check,
} from 'lucide-react';
import { TeamMember, TimelineComment } from '../../types/video';

interface TeamTabProps {
  teamMembers: TeamMember[];
  comments: TimelineComment[];
  currentTime: number;
  onSeek: (time: number) => void;
  onAddComment: (text: string) => void;
}

export const TeamTab: React.FC<TeamTabProps> = ({
  teamMembers,
  comments,
  currentTime,
  onSeek,
  onAddComment,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Командна співпраця
            </h3>
            <p className="text-[11px] text-slate-400">Спільний монтаж та коментарі онлайн</p>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1 text-[11px] bg-slate-900 border border-slate-700 hover:border-sky-500 px-2 py-1 rounded text-sky-300 transition"
          title="Скопіювати посилання для співавторів"
        >
          {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copiedLink ? 'Скопійовано' : 'Лінк'}</span>
        </button>
      </div>

      {/* Online Collaborators */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
          <span>Учасники проєкту ({teamMembers.length})</span>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </label>

        <div className="space-y-1.5">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{member.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>{member.role}</span>
                    <span>•</span>
                    <span className="text-sky-300 font-mono">{formatTimecode(member.cursorSec)}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {member.activeTrack}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments & Review Markers */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
            <span>Коментарі до таймлайну ({comments.length})</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Поточний: {formatTimecode(currentTime)}
          </span>
        </div>

        {/* New comment input */}
        <form onSubmit={handleSendComment} className="flex gap-1.5">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder={`Коментар на ${formatTimecode(currentTime)}...`}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg transition flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Comment list */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              onClick={() => onSeek(comment.timestamp)}
              className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 cursor-pointer transition space-y-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-200">{comment.author}</span>
                <div className="flex items-center gap-1.5 font-mono text-sky-400">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatTimecode(comment.timestamp)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300">{comment.text}</p>
              <div className="flex items-center justify-between text-[9px] text-slate-500">
                <span>{comment.timeAgo}</span>
                {comment.resolved ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Виправлено
                  </span>
                ) : (
                  <span className="text-amber-400">В роботі</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
