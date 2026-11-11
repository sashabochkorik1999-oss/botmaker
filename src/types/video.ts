export type AspectRatio = '16:9' | '9:16' | '1:1' | '21:9';
export type Resolution = '4K' | '2K' | '1080p' | '720p';
export type ExportFormat = 'mp4' | 'hevc' | 'prores' | 'webm';

export type TextAnimationType =
  | 'kinetic'
  | 'typewriter'
  | 'neon'
  | 'cinematic'
  | 'lowerthird'
  | 'karaoke'
  | 'glitch'
  | 'minimal';

export type TransitionType =
  | 'none'
  | 'dissolve'
  | 'whip-pan'
  | 'zoom-blur'
  | 'glitch'
  | 'film-burn'
  | 'slide'
  | 'fade';

export type FilterPresetType =
  | 'none'
  | 'hdr-4k'
  | 'teal-orange'
  | 'cyberpunk'
  | 'vhs-retro'
  | 'film-grain'
  | 'monochrome'
  | 'golden-hour';

export interface FilterSettings {
  brightness: number; // 50 to 150 (100 normal)
  contrast: number; // 50 to 150
  saturation: number; // 0 to 200
  grain: number; // 0 to 100
  vignette: number; // 0 to 100
  blur: number; // 0 to 20
  chromatic: number; // 0 to 10
}

export interface TextConfig {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  accentColor: string;
  animation: TextAnimationType;
  positionY: number; // 0 to 100 percentage from top
  positionX: number; // 0 to 100 percentage
  bgPill: boolean;
  outline: boolean;
  glow: boolean;
}

export interface MediaClip {
  id: string;
  title: string;
  type: 'video' | 'overlay' | 'text' | 'audio';
  trackIndex: number; // 0: Video, 1: Overlay, 2: Titles, 3: Audio
  startTime: number; // seconds on timeline
  duration: number; // seconds
  sourceUrl?: string;
  generatorType?: 'procedural-cyberpunk' | 'procedural-nebula' | 'procedural-neural' | 'procedural-waves' | 'procedural-mountains' | 'procedural-matrix' | 'custom-ai' | 'stock';
  prompt?: string;
  thumbnailUrl?: string;
  volume: number; // 0-100
  speed: number; // 0.5 to 4.0
  opacity: number; // 0-100
  filterPreset: FilterPresetType;
  filterSettings?: FilterSettings;
  transitionIn?: {
    type: TransitionType;
    duration: number;
  };
  textConfig?: TextConfig;
  audioWaveform?: number[];
  color?: string; // UI track block color
}

export interface StockItem {
  id: string;
  title: string;
  category: 'cinematic' | 'cyberpunk' | 'ai-tech' | 'nature' | 'business' | 'space';
  duration: number;
  videoUrl: string;
  thumbUrl: string;
  generatorType: MediaClip['generatorType'];
  tags: string[];
  resolution: string;
}

export interface StockAudioItem {
  id: string;
  title: string;
  genre: 'cinematic' | 'lofi' | 'electronic' | 'sfx-whoosh' | 'sfx-impact' | 'sfx-glitch';
  duration: number;
  bpm?: number;
  waveform: number[];
  sfxSynthType?: 'whoosh' | 'impact' | 'glitch' | 'chords' | 'typewriter';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  activeTrack: string;
  cursorSec: number;
  avatar: string;
  isOnline: boolean;
}

export interface TimelineComment {
  id: string;
  timestamp: number;
  author: string;
  avatar?: string;
  text: string;
  timeAgo: string;
  resolved: boolean;
}

export interface CloudRenderJob {
  id: string;
  projectTitle: string;
  resolution: Resolution;
  fps: number;
  format: ExportFormat;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  node: string;
  speedMultiplier: string;
  downloadUrl?: string;
  fileSizeMb?: number;
}
