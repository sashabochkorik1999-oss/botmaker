import React, { useState } from 'react';
import {
  Film,
  Search,
  Plus,
  Play,
  Upload,
  Check,
  Sparkles,
  Layers,
  Clock,
} from 'lucide-react';
import { STOCK_VIDEOS } from '../../data/stockMedia';
import { StockItem, MediaClip } from '../../types/video';

interface StockMediaTabProps {
  onAddClipToTimeline: (clip: Partial<MediaClip>) => void;
}

export const StockMediaTab: React.FC<StockMediaTabProps> = ({
  onAddClipToTimeline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Усі (4K)' },
    { id: 'cinematic', label: 'Кінематографічні' },
    { id: 'cyberpunk', label: 'Кіберпанк' },
    { id: 'ai-tech', label: 'ШІ & Техно' },
    { id: 'nature', label: 'Природа' },
    { id: 'space', label: 'Космос' },
    { id: 'business', label: 'Бізнес' },
  ];

  const filteredItems = STOCK_VIDEOS.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAddClipToTimeline({
        title: file.name.slice(0, 20),
        duration: 6,
        sourceUrl: url,
        generatorType: 'stock',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
        trackIndex: 0,
      });
    }
  };

  return (
    <div className="p-4 space-y-4 text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Стокові Медіафайли 4K
            </h3>
            <p className="text-[11px] text-slate-400">100% безкоштовні для комерційного монтажу</p>
          </div>
        </div>

        {/* Upload Custom */}
        <label className="cursor-pointer p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-pink-500/50 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-medium">
          <Upload className="w-3.5 h-3.5 text-pink-400" />
          <span>Завантажити</span>
          <input type="file" accept="video/*,image/*" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Пошук стокових відео (напр. горі, космос, неон)..."
          className="w-full bg-slate-900 border border-slate-800 focus:border-pink-500/60 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
        />
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-pink-500 text-white shadow-sm shadow-pink-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Stock Videos */}
      <div className="grid grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => setPreviewingId(item.id)}
            onMouseLeave={() => setPreviewingId(null)}
            className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/80 hover:border-pink-500/50 transition flex flex-col"
          >
            {/* Thumbnail / Video */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={item.thumbUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />

              {/* Overlay badges */}
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <span className="bg-black/75 backdrop-blur-sm border border-white/10 text-pink-400 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                  {item.resolution}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 bg-black/80 font-mono text-[10px] px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                <span>{item.duration}с</span>
              </div>
            </div>

            {/* Info & Add buttons */}
            <div className="p-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {item.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Add as Main Track */}
                <button
                  onClick={() =>
                    onAddClipToTimeline({
                      title: item.title,
                      duration: item.duration,
                      generatorType: item.generatorType,
                      thumbnailUrl: item.thumbUrl,
                      trackIndex: 0,
                    })
                  }
                  className="px-2 py-1.5 rounded-lg bg-pink-500/15 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 transition text-xs font-semibold flex items-center gap-1"
                  title="Додати на основну відеодоріжку"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Відео</span>
                </button>

                {/* Add as Overlay / B-Roll */}
                <button
                  onClick={() =>
                    onAddClipToTimeline({
                      title: `B-Roll: ${item.title}`,
                      duration: Math.min(4, item.duration),
                      generatorType: item.generatorType,
                      thumbnailUrl: item.thumbUrl,
                      trackIndex: 1, // Track 1 is Overlay / B-Roll
                    })
                  }
                  className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition text-xs font-semibold"
                  title="Додати як B-Roll / Оверлей (Track 2)"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
