import React, { useState } from 'react';
import {
  X,
  Share2,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Calendar,
  Eye,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export const SocialPublishModal: React.FC<SocialPublishModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');
  const [postTitle, setPostTitle] = useState(`🔥 ${projectTitle} | 4K Ultra HD AI`);
  const [caption, setCaption] = useState(
    'Подивіться це неймовірне відео, повністю згенероване та змонтоване в NovaCinema AI Studio у 4K! Як вам деталізація? Напишіть у коментарях! 👇'
  );
  const [hashtags, setHashtags] = useState('#ШІВідео #4KUltraHD #AIVideo #NovaCinema #Shorts #Reels #FutureTech');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: '🔴', desc: 'YouTube Shorts & 4K Video' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: 'Вірусний звук & 9:16 формат' },
    { id: 'instagram', name: 'Instagram', icon: '📸', desc: 'Reels & Стрічка' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', desc: 'Прямий канал / група' },
    { id: 'x', name: 'X (Twitter)', icon: '✖️', desc: 'Тред & HD відео' },
  ];

  // AI Copywriter
  const handleGenerateAICopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/gemini/social-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: projectTitle,
          description: caption,
          platform: selectedPlatform,
        }),
      });
      const data = await res.json();
      if (data.title) setPostTitle(data.title);
      if (data.description) setCaption(data.description);
      if (data.hashtags) setHashtags(data.hashtags.join(' '));
    } catch (err) {
      console.error('Social copy error:', err);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
      });
    }, 1800);
  };

  const shareableUrl = `https://novacinema.ai/v/${Math.random().toString(36).substring(2, 9)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Миттєва публікація у соцмережі</h3>
              <p className="text-[11px] text-slate-400">Автоматичний постинг у 4K форматі</p>
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
          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Оберіть платформу</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {platforms.map((p) => {
                const active = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlatform(p.id);
                      setIsPublished(false);
                    }}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                      active
                        ? 'bg-pink-950/60 border-pink-500 text-white shadow-sm shadow-pink-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{p.name}</div>
                      <div className="text-[9px] text-slate-500 truncate">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Copywriter Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerateAICopy}
              disabled={isGeneratingCopy}
              className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-pink-300 transition font-semibold"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCopy ? 'animate-spin' : ''}`} />
              <span>{isGeneratingCopy ? 'ШІ генерує опис...' : 'ШІ Копірайтер (Заголовок & Теги)'}</span>
            </button>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Заголовок публікації</label>
            <input
              type="text"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Caption textarea */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Опис та заклик до дії</label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Хештеги</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500 rounded-lg px-3 py-1.5 text-xs text-pink-300 font-mono placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Success Result */}
          {isPublished && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Відео успішно опубліковано у {platforms.find((p) => p.id === selectedPlatform)?.name}!</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
                <span className="font-mono text-cyan-300 truncate flex-1">{shareableUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-200 hover:text-white flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Скопійовано' : 'Копіювати'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Publish Action Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 transition active:scale-[0.98] disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Send className="w-4 h-4 animate-spin text-white" />
                <span>Завантаження у 4K на сервер соцмережі...</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Опублікувати зараз ({platforms.find((p) => p.id === selectedPlatform)?.name})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
