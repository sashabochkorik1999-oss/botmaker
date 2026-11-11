import { MediaClip, AspectRatio, Resolution, FilterPresetType, TextAnimationType } from '../types/video';

export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  currentTime: number;
  clips: MediaClip[];
  aspectRatio: AspectRatio;
  resolution: Resolution;
  videoElementsMap?: Map<string, HTMLVideoElement>;
}

export class VideoRendererService {
  // Dimension calculators
  public static getDimensions(aspectRatio: AspectRatio, resolution: Resolution): { width: number; height: number } {
    let baseWidth = 1920;
    let baseHeight = 1080;

    if (resolution === '4K') {
      baseWidth = 3840;
      baseHeight = 2160;
    } else if (resolution === '2K') {
      baseWidth = 2560;
      baseHeight = 1440;
    } else if (resolution === '720p') {
      baseWidth = 1280;
      baseHeight = 720;
    }

    switch (aspectRatio) {
      case '9:16':
        return { width: Math.round((baseHeight * 9) / 16), height: baseHeight };
      case '1:1':
        return { width: baseHeight, height: baseHeight };
      case '21:9':
        return { width: Math.round((baseHeight * 21) / 9), height: baseHeight };
      case '16:9':
      default:
        return { width: baseWidth, height: baseHeight };
    }
  }

  // Draw procedural backgrounds if video not ready or for AI generative clips
  private static drawProceduralScene(
    ctx: CanvasRenderingContext2D,
    type: string | undefined,
    width: number,
    height: number,
    time: number
  ) {
    const t = time;

    switch (type) {
      case 'procedural-cyberpunk': {
        // Dark futuristic city with neon grid & skyscrapers
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#090014');
        grad.addColorStop(0.5, '#1e0538');
        grad.addColorStop(1, '#ff007f');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Cyberpunk sun
        const sunY = height * 0.55;
        const sunRadius = height * 0.22;
        const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
        sunGrad.addColorStop(0, '#ffff00');
        sunGrad.addColorStop(0.6, '#ff007f');
        sunGrad.addColorStop(1, '#7928ca');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(width / 2, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();

        // Sun scanlines
        ctx.fillStyle = '#090014';
        for (let i = 0; i < 9; i++) {
          const slitY = sunY + (i / 9) * sunRadius;
          ctx.fillRect(width / 2 - sunRadius, slitY, sunRadius * 2, 3 + i * 1.5);
        }

        // Perspective 3D Grid
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const horizon = height * 0.65;
        const vanishingX = width / 2;

        // Radiating perspective lines
        for (let x = -width; x <= width * 2; x += width * 0.12) {
          ctx.moveTo(vanishingX, horizon);
          ctx.lineTo(x, height);
        }
        ctx.stroke();

        // Horizontal moving grid lines
        const speed = (t * 80) % 60;
        for (let y = horizon; y <= height; y += 15) {
          const depth = (y - horizon) / (height - horizon);
          const py = horizon + Math.pow(depth, 2) * (height - horizon) + speed * depth;
          if (py <= height) {
            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(width, py);
            ctx.stroke();
          }
        }
        break;
      }

      case 'procedural-nebula': {
        // Deep space nebula with starfield
        ctx.fillStyle = '#03000a';
        ctx.fillRect(0, 0, width, height);

        // Nebula clouds
        const nebulae = [
          { x: width * 0.35 + Math.sin(t * 0.2) * 40, y: height * 0.45, color: 'rgba(147, 51, 234, 0.4)', r: width * 0.35 },
          { x: width * 0.65 + Math.cos(t * 0.15) * 50, y: height * 0.55, color: 'rgba(59, 130, 246, 0.35)', r: width * 0.4 },
          { x: width * 0.5, y: height * 0.3 + Math.sin(t * 0.3) * 30, color: 'rgba(236, 72, 153, 0.25)', r: width * 0.3 },
        ];

        nebulae.forEach((neb) => {
          const g = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.r);
          g.addColorStop(0, neb.color);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Stars
        ctx.fillStyle = '#ffffff';
        const numStars = 60;
        for (let i = 0; i < numStars; i++) {
          const seed = i * 1337;
          const sx = ((seed % 1000) / 1000) * width;
          const sy = (((seed * 3) % 1000) / 1000) * height;
          const brightness = Math.abs(Math.sin(t * 1.5 + i));
          const starR = (1 + (i % 3)) * (0.6 + brightness * 0.4);
          ctx.globalAlpha = 0.3 + brightness * 0.7;
          ctx.beginPath();
          ctx.arc(sx, sy, starR, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
        break;
      }

      case 'procedural-neural': {
        // Glowing AI Neural Mesh Network
        ctx.fillStyle = '#050b14';
        ctx.fillRect(0, 0, width, height);

        const nodes: { x: number; y: number }[] = [];
        const count = 28;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + t * 0.15;
          const radius = (height * 0.32) * (0.4 + 0.6 * Math.sin(i * 3 + t * 0.3));
          nodes.push({
            x: width / 2 + Math.cos(angle) * radius * (width / height),
            y: height / 2 + Math.sin(angle) * radius,
          });
        }

        // Draw connections
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
            if (dist < width * 0.22) {
              const alpha = 1 - dist / (width * 0.22);
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.45})`;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw nodes
        nodes.forEach((node, idx) => {
          const pulse = Math.sin(t * 3 + idx) * 0.5 + 0.5;
          ctx.fillStyle = idx % 3 === 0 ? '#38bdf8' : idx % 3 === 1 ? '#818cf8' : '#c084fc';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4 + pulse * 4, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'procedural-waves': {
        // Golden hour ocean waves
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
        skyGrad.addColorStop(0, '#ff7e5f');
        skyGrad.addColorStop(0.5, '#feb47b');
        skyGrad.addColorStop(1, '#ffeccc');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height * 0.6);

        // Sun
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.48, height * 0.12, 0, Math.PI * 2);
        ctx.fill();

        // Water
        ctx.fillStyle = '#0f2027';
        ctx.fillRect(0, height * 0.55, width, height * 0.45);

        // Wave layers
        for (let w = 0; w < 4; w++) {
          ctx.fillStyle = `rgba(${30 + w * 20}, ${60 + w * 25}, ${110 + w * 20}, ${0.7 - w * 0.12})`;
          ctx.beginPath();
          ctx.moveTo(0, height);
          const waveY = height * (0.6 + w * 0.08);
          ctx.lineTo(0, waveY);

          for (let x = 0; x <= width; x += 30) {
            const y = waveY + Math.sin(x * 0.005 + t * (1.5 + w * 0.5) + w) * (15 + w * 6);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'procedural-mountains': {
        // Epic mountain sunrise
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#1a1c29');
        grad.addColorStop(0.4, '#4a3b53');
        grad.addColorStop(0.7, '#e87a5d');
        grad.addColorStop(1, '#f9c58d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Mountain layers
        const layers = [
          { y: height * 0.5, color: '#2a2233', freq: 0.003, amp: height * 0.15 },
          { y: height * 0.62, color: '#1e1824', freq: 0.005, amp: height * 0.12 },
          { y: height * 0.75, color: '#110d14', freq: 0.008, amp: height * 0.1 },
        ];

        layers.forEach((layer) => {
          ctx.fillStyle = layer.color;
          ctx.beginPath();
          ctx.moveTo(0, height);
          ctx.lineTo(0, layer.y);
          for (let x = 0; x <= width; x += 20) {
            const my = layer.y - Math.abs(Math.sin(x * layer.freq)) * layer.amp;
            ctx.lineTo(x, my);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        });
        break;
      }

      case 'procedural-matrix': {
        // Cyber Matrix Digital Rain
        ctx.fillStyle = '#020b05';
        ctx.fillRect(0, 0, width, height);
        ctx.font = 'bold 20px monospace';

        const cols = Math.floor(width / 24);
        const chars = '01アカサタナハマヤラワイウエオカキクケコ0123456789ABCDEFШІВІДЕО';

        for (let i = 0; i < cols; i++) {
          const colX = i * 24;
          const offset = ((i * 17 + t * 150) % (height + 200)) - 100;
          for (let j = 0; j < 8; j++) {
            const charY = offset - j * 24;
            if (charY > 0 && charY < height) {
              const char = chars[(i * 5 + j * 3) % chars.length];
              ctx.fillStyle = j === 0 ? '#ffffff' : `rgba(34, 197, 94, ${1 - j * 0.12})`;
              ctx.fillText(char, colX, charY);
            }
          }
        }
        break;
      }

      default: {
        // High-end cinematic dark ambient gradient
        const g = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.7);
        g.addColorStop(0, '#1e293b');
        g.addColorStop(0.6, '#0f172a');
        g.addColorStop(1, '#020617');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);

        // Subtle moving ambient orb
        const ox = width * 0.5 + Math.sin(t * 0.5) * (width * 0.2);
        const oy = height * 0.5 + Math.cos(t * 0.4) * (height * 0.15);
        const orbGrad = ctx.createRadialGradient(ox, oy, 10, ox, oy, width * 0.4);
        orbGrad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(0, 0, width, height);
        break;
      }
    }
  }

  // Draw animated titles & subtitles
  private static drawAnimatedTitle(
    ctx: CanvasRenderingContext2D,
    textConfig: NonNullable<MediaClip['textConfig']>,
    clipElapsed: number,
    clipDuration: number,
    width: number,
    height: number
  ) {
    const { content, fontSize, color, accentColor, animation, positionY, positionX, bgPill, outline, glow } = textConfig;
    if (!content) return;

    ctx.save();

    // Scale font size according to target canvas resolution
    const scaleFactor = height / 720;
    const computedFontSize = Math.max(16, Math.round(fontSize * scaleFactor));
    ctx.font = `800 ${computedFontSize}px 'Plus Jakarta Sans', -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = (width * (positionX || 50)) / 100;
    const cy = (height * (positionY || 50)) / 100;

    let displayText = content;
    let alpha = 1;
    let scale = 1;
    let offsetY = 0;

    // Animation presets logic
    switch (animation) {
      case 'typewriter': {
        const progress = Math.min(1, clipElapsed / Math.max(0.8, clipDuration * 0.6));
        const charsToShow = Math.floor(content.length * progress);
        displayText = content.substring(0, charsToShow);
        // Blinking cursor
        if (Math.floor(clipElapsed * 3) % 2 === 0 && progress < 1) {
          displayText += ' ▍';
        }
        break;
      }

      case 'kinetic': {
        const beat = Math.sin(clipElapsed * 5);
        scale = 1 + beat * 0.08;
        break;
      }

      case 'neon': {
        const pulse = Math.abs(Math.sin(clipElapsed * 4));
        ctx.shadowColor = accentColor || '#38bdf8';
        ctx.shadowBlur = 20 * scaleFactor * (0.6 + pulse * 0.8);
        break;
      }

      case 'cinematic': {
        // Slow majestic zoom in
        scale = 0.9 + (clipElapsed / clipDuration) * 0.15;
        alpha = Math.min(1, clipElapsed * 1.5);
        ctx.letterSpacing = `${Math.round(4 * scaleFactor)}px`;
        break;
      }

      case 'glitch': {
        if (Math.sin(clipElapsed * 12) > 0.7) {
          offsetY = (Math.random() - 0.5) * 8 * scaleFactor;
          // RGB split simulation
          ctx.fillStyle = '#ff0055';
          ctx.fillText(content, cx - 4 * scaleFactor, cy + offsetY);
          ctx.fillStyle = '#00ffff';
          ctx.fillText(content, cx + 4 * scaleFactor, cy + offsetY);
        }
        break;
      }

      case 'karaoke': {
        // Word highlight
        const words = content.split(' ');
        const wordIdx = Math.min(words.length - 1, Math.floor((clipElapsed / clipDuration) * words.length));
        ctx.save();
        // Measure and draw each word
        const totalW = ctx.measureText(content).width;
        let startX = cx - totalW / 2;

        words.forEach((w, i) => {
          const wWidth = ctx.measureText(w + ' ').width;
          ctx.fillStyle = i <= wordIdx ? '#facc15' : 'rgba(255, 255, 255, 0.6)';
          if (i === wordIdx) {
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 15;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.fillText(w, startX + wWidth / 2, cy);
          startX += wWidth;
        });
        ctx.restore();
        ctx.restore();
        return;
      }

      case 'lowerthird': {
        // Clean banner box
        const textMetrics = ctx.measureText(content);
        const boxW = textMetrics.width + 50 * scaleFactor;
        const boxH = computedFontSize * 1.8;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH);

        // Accent strip on left
        ctx.fillStyle = accentColor || '#38bdf8';
        ctx.fillRect(cx - boxW / 2, cy - boxH / 2, 6 * scaleFactor, boxH);
        break;
      }

      case 'minimal':
      default:
        alpha = Math.min(1, clipElapsed * 2);
        break;
    }

    ctx.globalAlpha = alpha;

    // Background pill if requested
    if (bgPill && animation !== 'lowerthird') {
      const textMetrics = ctx.measureText(displayText);
      const padX = 24 * scaleFactor;
      const padY = 12 * scaleFactor;
      const pillW = textMetrics.width + padX * 2;
      const pillH = computedFontSize + padY * 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      const r = pillH / 2;
      ctx.roundRect(cx - pillW / 2, cy - pillH / 2, pillW, pillH, r);
      ctx.fill();
    }

    ctx.translate(cx, cy + offsetY);
    ctx.scale(scale, scale);

    if (outline) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.lineWidth = Math.max(3, Math.round(5 * scaleFactor));
      ctx.strokeText(displayText, 0, 0);
    }

    if (glow && animation !== 'neon') {
      ctx.shadowColor = accentColor || '#38bdf8';
      ctx.shadowBlur = 14 * scaleFactor;
    }

    ctx.fillStyle = color || '#ffffff';
    ctx.fillText(displayText, 0, 0);

    ctx.restore();
  }

  // Apply visual post-filters
  private static applyFilterEffects(
    ctx: CanvasRenderingContext2D,
    preset: FilterPresetType,
    settings: NonNullable<MediaClip['filterSettings']>,
    width: number,
    height: number,
    time: number
  ) {
    if (preset === 'none' && !settings) return;

    // Vignette
    if (settings.vignette > 0 || preset === 'film-grain' || preset === 'hdr-4k') {
      const vigGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.4,
        width / 2,
        height / 2,
        Math.hypot(width, height) * 0.55
      );
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.85, (settings.vignette || 40) / 100)})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // VHS Scanlines & Noise
    if (preset === 'vhs-retro') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      // Tracking glitch bar
      const barY = ((time * 80) % height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(0, barY, width, 18);
    }

    // Film Grain
    if (settings.grain > 0 || preset === 'film-grain') {
      const grainIntensity = (settings.grain || 30) / 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      const grainCount = Math.floor(width * 0.08);
      for (let i = 0; i < grainCount; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        ctx.fillRect(gx, gy, 2, 2);
      }
    }

    // Teal & Orange tone overlay
    if (preset === 'teal-orange') {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.08)'; // Teal shadows
      ctx.fillRect(0, 0, width, height);
      const sunG = ctx.createLinearGradient(0, 0, width, height);
      sunG.addColorStop(0, 'rgba(249, 115, 22, 0.08)'); // Orange highlights
      sunG.addColorStop(1, 'transparent');
      ctx.fillStyle = sunG;
      ctx.fillRect(0, 0, width, height);
    }

    // Cyberpunk Neon tint
    if (preset === 'cyberpunk') {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.06)';
      ctx.fillRect(0, 0, width, height);
    }

    // Monochrome Noir
    if (preset === 'monochrome') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Master Render Frame
  public static renderFrame(params: RenderContext) {
    const { canvas, ctx, currentTime, clips, aspectRatio, resolution, videoElementsMap } = params;
    const { width, height } = this.getDimensions(aspectRatio, resolution);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Filter active clips at current timeline time
    const activeClips = clips.filter(
      (c) => currentTime >= c.startTime && currentTime < c.startTime + c.duration
    );

    // Track 0: Main Video Clip
    const mainClip = activeClips.find((c) => c.trackIndex === 0);

    if (mainClip) {
      const clipElapsed = currentTime - mainClip.startTime;
      ctx.save();

      // Clip Opacity
      ctx.globalAlpha = (mainClip.opacity ?? 100) / 100;

      // Handle Transition In
      if (mainClip.transitionIn && mainClip.transitionIn.type !== 'none') {
        const transDur = mainClip.transitionIn.duration || 0.8;
        if (clipElapsed < transDur) {
          const tProgress = clipElapsed / transDur;
          switch (mainClip.transitionIn.type) {
            case 'dissolve':
            case 'fade':
              ctx.globalAlpha *= tProgress;
              break;
            case 'zoom-blur': {
              const scale = 1.3 - tProgress * 0.3;
              ctx.translate(width / 2, height / 2);
              ctx.scale(scale, scale);
              ctx.translate(-width / 2, -height / 2);
              ctx.globalAlpha *= tProgress;
              break;
            }
            case 'whip-pan': {
              const offsetX = (1 - tProgress) * width;
              ctx.translate(offsetX, 0);
              break;
            }
            case 'film-burn': {
              // Orange flash
              ctx.fillStyle = `rgba(255, 120, 30, ${1 - tProgress})`;
              ctx.fillRect(0, 0, width, height);
              break;
            }
          }
        }
      }

      // Check if real video element available
      const videoEl = videoElementsMap?.get(mainClip.id);
      if (videoEl && videoEl.readyState >= 2 && !videoEl.paused) {
        ctx.drawImage(videoEl, 0, 0, width, height);
      } else {
        // Draw rich procedural scene
        this.drawProceduralScene(ctx, mainClip.generatorType, width, height, clipElapsed);
      }

      // Apply Filter Presets
      const settings = mainClip.filterSettings || {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grain: 0,
        vignette: 20,
        blur: 0,
        chromatic: 0,
      };
      this.applyFilterEffects(ctx, mainClip.filterPreset, settings, width, height, clipElapsed);

      ctx.restore();
    } else {
      // Empty timeline standby state
      this.drawProceduralScene(ctx, 'default', width, height, currentTime);
    }

    // Track 1: Overlay / B-Roll
    const overlayClip = activeClips.find((c) => c.trackIndex === 1);
    if (overlayClip) {
      ctx.save();
      ctx.globalAlpha = (overlayClip.opacity ?? 80) / 100;
      // Picture-in-picture top-right by default
      const pipW = width * 0.32;
      const pipH = height * 0.32;
      const pipX = width - pipW - 40;
      const pipY = 40;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipX, pipY, pipW, pipH);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pipX, pipY, pipW, pipH);

      ctx.save();
      ctx.beginPath();
      ctx.rect(pipX, pipY, pipW, pipH);
      ctx.clip();
      this.drawProceduralScene(ctx, overlayClip.generatorType || 'procedural-neural', pipW, pipH, currentTime);
      ctx.restore();

      ctx.restore();
    }

    // Track 2: Animated Titles & Subtitles
    const textClips = activeClips.filter((c) => c.trackIndex === 2 && c.textConfig);
    textClips.forEach((tClip) => {
      if (tClip.textConfig) {
        const clipElapsed = currentTime - tClip.startTime;
        this.drawAnimatedTitle(ctx, tClip.textConfig, clipElapsed, tClip.duration, width, height);
      }
    });

    // 4K Watermark badge (optional, ultra subtle cinema stamp)
    ctx.save();
    ctx.font = `600 ${Math.round(height * 0.02)}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.textAlign = 'right';
    ctx.fillText(`${resolution} • 60FPS • NOVACINEMA AI`, width - 30, height - 25);
    ctx.restore();
  }

  // Real in-browser video export via MediaRecorder!
  public static async exportVideo(params: {
    clips: MediaClip[];
    duration: number;
    resolution: Resolution;
    aspectRatio: AspectRatio;
    fps: number;
    onProgress: (progress: number, currentFrame: number, totalFrames: number) => void;
  }): Promise<Blob> {
    const { clips, duration, resolution, aspectRatio, fps, onProgress } = params;
    const { width, height } = this.getDimensions(aspectRatio, resolution);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(fps);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: resolution === '4K' ? 40_000_000 : 15_000_000,
    });

    const recordedChunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(fullBlob);
      };

      recorder.onerror = (e) => reject(e);

      recorder.start();

      const totalFrames = Math.max(30, Math.round(duration * fps));
      let currentFrame = 0;
      const frameInterval = 1000 / fps;

      const renderNext = () => {
        if (currentFrame >= totalFrames) {
          setTimeout(() => {
            recorder.stop();
          }, 300);
          return;
        }

        const currentTime = (currentFrame / totalFrames) * duration;
        VideoRendererService.renderFrame({
          canvas,
          ctx,
          currentTime,
          clips,
          aspectRatio,
          resolution,
        });

        currentFrame++;
        const progress = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
        onProgress(progress, currentFrame, totalFrames);

        // Render at high frame rate
        setTimeout(renderNext, Math.min(20, frameInterval * 0.5));
      };

      renderNext();
    });
  }
}
