import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with telemetry header
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Prompt Enhancement API
app.post('/api/gemini/prompt-enhance', async (req, res) => {
  try {
    const { prompt, style = 'Cinematic 4K', camera = 'Pan' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Fallback high-quality enhancement if no key yet
      return res.json({
        enhancedPrompt: `Ultra-photorealistic 4K masterpiece of ${prompt}, shot on 35mm Arri Alexa LF, anamorphic lens flare, ${camera} camera movement, volumetric dramatic lighting, photorealistic textures, 8k resolution, cinematic color grading, ${style} aesthetic, octane render detail, slow shutter motion blur.`,
        suggestedAudio: `Ambient cinematic drone with subtle rising strings and gentle sub-bass impact.`,
        suggestedTitles: [`${prompt.slice(0, 30).toUpperCase()}`, 'A VISUAL JOURNEY'],
        cameraMovement: camera,
        lighting: 'Volumetric cinematic rim lighting, golden hour diffusion',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an elite Hollywood AI Director and cinematography prompt engineer.
Enhance this video prompt for a state-of-the-art AI video generation model:
User Idea: "${prompt}"
Desired Style: "${style}"
Camera Motion: "${camera}"

Return ONLY valid JSON with no markdown wrapping:
{
  "enhancedPrompt": "detailed visual prompt describing subject, environment, lighting, camera lens, motion, color grading, photorealism",
  "suggestedAudio": "audio track description matching the scene mood",
  "suggestedTitles": ["main title in Ukrainian or English", "subtitle/tagline"],
  "cameraMovement": "specific camera motion instructions",
  "lighting": "lighting setup description"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    const fallbackText = `4K cinematic masterpiece of ${req.body.prompt || 'scene'}, shot on 35mm Arri Alexa LF, anamorphic lens flare, ${req.body.camera || 'Pan'} camera movement, volumetric dramatic lighting, photorealistic textures, 8k resolution, cinematic color grading, ${req.body.style || 'Cinematic'} aesthetic, slow shutter motion blur.`;
    return res.json({
      enhancedPrompt: fallbackText,
      suggestedAudio: 'Ambient cinematic drone with subtle rising strings and gentle sub-bass impact.',
      suggestedTitles: [`${(req.body.prompt || 'КІНО').slice(0, 24).toUpperCase()}`, 'A VISUAL JOURNEY'],
      cameraMovement: req.body.camera || 'Pan',
      lighting: 'Volumetric cinematic rim lighting, golden hour diffusion',
    });
  }
});

// 2. Storyboard Script to Scenes Generator
app.post('/api/gemini/storyboard', async (req, res) => {
  try {
    const { script, style = 'Cinematic', targetDuration = 15 } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        scenes: [
          {
            id: 'scene-1',
            title: 'Епічний початок (Вступ)',
            prompt: `Wide establishing drone shot of ${script || 'a futuristic landscape'}, cinematic dawn light, 4K HDR.`,
            duration: 4,
            transition: 'Cross Dissolve',
            camera: 'Slow Push In',
            caption: 'Подорож починається тут і зараз...',
            soundEffect: 'Deep Cinematic Whoosh',
          },
          {
            id: 'scene-2',
            title: 'Кульмінація та дія',
            prompt: `Close-up dynamic action shot with volumetric lights and particle embers, highly detailed.`,
            duration: 5,
            transition: 'Zoom Blur',
            camera: 'Orbit 180',
            caption: 'Кожна мить змінює хід майбутнього',
            soundEffect: 'Subtle Bass Impact',
          },
          {
            id: 'scene-3',
            title: 'Гранд-фінал (Висновки)',
            prompt: `Breathtaking high-angle vista, golden hour sunset reflections, atmospheric anamorphic flare.`,
            duration: 6,
            transition: 'Film Burn',
            camera: 'Slow Pull Back',
            caption: 'Нова ера відеомонтажу з ШІ',
            soundEffect: 'Orchestral Climax',
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a professional film director. Turn this concept or script into a 3-scene video storyboard for a total duration of around ${targetDuration} seconds.
Script: "${script}"
Style: "${style}"

Return ONLY valid JSON matching this schema:
{
  "scenes": [
    {
      "id": "scene-1",
      "title": "scene title in Ukrainian",
      "prompt": "detailed visual 4K prompt in English for video AI model",
      "duration": 4,
      "transition": "Cross Dissolve" | "Zoom Blur" | "Glitch RGB" | "Film Burn",
      "camera": "Slow Push In" | "Orbit 360" | "Drone Flyover" | "Pan Right",
      "caption": "subtitles/voiceover line in Ukrainian",
      "soundEffect": "audio cue name"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating storyboard:', error);
    return res.json({
      scenes: [
        {
          id: 'scene-1',
          title: 'Сцена 1: Початок історії',
          prompt: `Wide establishing drone shot of ${req.body.script || 'a futuristic world'}, cinematic lighting, 4K HDR.`,
          duration: 4,
          transition: 'Cross Dissolve',
          camera: 'Slow Push In',
          caption: 'Подорож у майбутнє починається тут...',
          soundEffect: 'Deep Cinematic Whoosh',
        },
        {
          id: 'scene-2',
          title: 'Сцена 2: Кульмінація',
          prompt: `Dynamic close-up shot with particle embers and volumetric cyan neon glow, high detail.`,
          duration: 5,
          transition: 'Zoom Blur',
          camera: 'Orbit 180',
          caption: 'Кожна секунда змінює сприйняття реальності',
          soundEffect: 'Subtle Bass Impact',
        },
        {
          id: 'scene-3',
          title: 'Сцена 3: Фінал',
          prompt: `Breathtaking high-angle panorama at golden hour, anamorphic lens flare, 4K masterpiece.`,
          duration: 6,
          transition: 'Film Burn',
          camera: 'Slow Pull Back',
          caption: 'NovaCinema AI: Новий стандарт відеомонтажу',
          soundEffect: 'Orchestral Climax',
        },
      ],
    });
  }
});

// 3. AI Auto-Captions generator
app.post('/api/gemini/captions', async (req, res) => {
  try {
    const { text, videoLength = 12 } = req.body;
    const ai = getAIClient();

    if (!ai) {
      const words = (text || 'Створюйте неймовірні ШІ відео у 4K форматі швидко та якісно').split(' ');
      const step = Math.max(1.5, Math.floor((videoLength / Math.max(1, Math.ceil(words.length / 3))) * 10) / 10);
      const captions = [];
      let curTime = 0.5;

      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ');
        captions.push({
          id: `cap-${i}`,
          startTime: Math.round(curTime * 10) / 10,
          endTime: Math.round((curTime + step - 0.2) * 10) / 10,
          text: chunk,
          animation: i % 2 === 0 ? 'Kinetic Wave' : 'Typewriter',
        });
        curTime += step;
      }
      return res.json({ captions });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Analyze this narration or concept and split it into engaging, timed social media subtitle captions (like TikTok/Reels captions) for a video lasting ${videoLength} seconds.
Content: "${text}"

Return JSON:
{
  "captions": [
    {
      "id": "cap-1",
      "startTime": 0.5,
      "endTime": 2.5,
      "text": "short punchy caption text in Ukrainian",
      "animation": "Kinetic Wave" | "Typewriter" | "Neon Pulse" | "Karaoke Bounce" | "Lower Third"
    }
  ]
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Captions error:', error);
    const words = (req.body.text || 'Створюйте неймовірні ШІ відео у 4K форматі швидко та якісно').split(' ');
    const step = 2.0;
    const captions = [];
    let curTime = 0.5;

    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ');
      captions.push({
        id: `cap-${i}`,
        startTime: Math.round(curTime * 10) / 10,
        endTime: Math.round((curTime + step - 0.2) * 10) / 10,
        text: chunk,
        animation: i % 2 === 0 ? 'Kinetic Wave' : 'Karaoke Bounce',
      });
      curTime += step;
    }
    return res.json({ captions });
  }
});

// 4. Social Media Copywriting Generator
app.post('/api/gemini/social-copy', async (req, res) => {
  try {
    const { videoTitle, description, platform = 'all' } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.json({
        title: `🔥 ${videoTitle || 'Шокуюче відео з ШІ у 4K'}`,
        description: `Створено у NovaCinema AI Studio! Дивіться у найвищій роздільній здатності 4K Ultra HD. Як вам такий рівень генерації? Пишіть у коментарях! 👇`,
        hashtags: ['#ШІВідео', '#4KUltraHD', '#AIVideo', '#NovaCinema', '#FutureTech', '#Shorts', '#Reels'],
        platforms: {
          youtube: { title: `${videoTitle} | 4K Ultra HD AI Film`, tags: 'ai, 4k, video editing, generative' },
          tiktok: { soundTag: 'Original AI Soundtrack - NovaCinema', caption: `${videoTitle} 🚀 Створено ШІ за 10 секунд! #ai #shorts` },
          instagram: { caption: `Майбутнє відеомонтажу вже тут ✨\n\n${description || 'Генерація за промптом + 4K хмарний рендеринг'}\n\n#reels #aivideo #editing` },
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a viral social media strategist. Generate high-converting social media package for this AI-generated video.
Title: "${videoTitle}"
Concept: "${description}"

Return JSON:
{
  "title": "catchy viral title with emoji in Ukrainian",
  "description": "engaging post copy with call to action in Ukrainian",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"],
  "platforms": {
    "youtube": { "title": "SEO optimized 4K title", "tags": "comma,separated,tags" },
    "tiktok": { "caption": "short viral caption with hooks", "soundTag": "suggested sound name" },
    "instagram": { "caption": "aesthetic reels caption with spacing and hooks" }
  }
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Social copy error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. Cloud Render Cluster Manager
const activeRenderJobs: Record<string, any> = {};

app.post('/api/cloud-render/submit', (req, res) => {
  const { resolution = '4K (3840x2160)', fps = 60, format = 'mp4', clipsCount = 4, projectTitle = 'Untitled Video' } = req.body;
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const job = {
    id: jobId,
    projectTitle,
    resolution,
    fps,
    format,
    clipsCount,
    status: 'queued', // queued -> processing -> completed
    progress: 0,
    startTime: Date.now(),
    node: 'Cluster-EU-Frankfurt (8x NVIDIA H100 Tensor Core)',
    speedMultiplier: '12.4x realtime',
    estimatedSeconds: Math.max(3, Math.min(10, clipsCount * 2)),
    downloadUrl: '',
  };

  activeRenderJobs[jobId] = job;
  return res.json(job);
});

app.get('/api/cloud-render/status/:id', (req, res) => {
  const job = activeRenderJobs[req.params.id];
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  const elapsed = (Date.now() - job.startTime) / 1000;
  if (elapsed >= job.estimatedSeconds) {
    job.status = 'completed';
    job.progress = 100;
    job.downloadUrl = `/downloads/${job.id}.${job.format}`;
  } else {
    job.status = 'processing';
    job.progress = Math.min(99, Math.round((elapsed / job.estimatedSeconds) * 100));
  }

  return res.json(job);
});

// 6. Real-time Team Collaboration Mock & State
const teamRooms: Record<string, any> = {
  'demo-room': {
    users: [
      { id: 'u1', name: 'Олександр (Ви)', role: 'Режисер (Admin)', color: '#38bdf8', activeTrack: 'Video Track 1', cursorSec: 3.2 },
      { id: 'u2', name: 'Олена Коваль', role: 'Монтажер титрів', color: '#f43f5e', activeTrack: 'Titles Track', cursorSec: 7.5 },
      { id: 'u3', name: 'Марк Стеценко', role: 'Колорист & FX', color: '#10b981', activeTrack: 'Effects Track', cursorSec: 1.8 },
      { id: 'u4', name: 'Анна Мельник', role: 'Звукорежисер', color: '#a855f7', activeTrack: 'Audio Track', cursorSec: 10.0 },
    ],
    comments: [
      { id: 'c1', timestamp: 2.5, author: 'Олена Коваль', text: 'Тут гарно ляже кінетичний титр з неоновим ефектом!', timeAgo: '3 хв тому', resolved: false },
      { id: 'c2', timestamp: 6.0, author: 'Марк Стеценко', text: 'Додав пресет Teal & Orange для глибини 4K сцени.', timeAgo: '12 хв тому', resolved: true },
      { id: 'c3', timestamp: 9.4, author: 'Анна Мельник', text: 'Зробила плавний fade-in аудіодоріжки на початку.', timeAgo: '1 год тому', resolved: false },
    ],
  },
};

app.get('/api/collaboration/room/:roomId', (req, res) => {
  const roomId = req.params.roomId || 'demo-room';
  if (!teamRooms[roomId]) {
    teamRooms[roomId] = {
      users: [
        { id: 'u1', name: 'Олександр (Ви)', role: 'Режисер (Admin)', color: '#38bdf8', activeTrack: 'Video Track 1', cursorSec: 2.0 },
        { id: 'u2', name: 'Олена Коваль', role: 'Монтажер титрів', color: '#f43f5e', activeTrack: 'Titles Track', cursorSec: 5.5 },
      ],
      comments: [],
    };
  }
  return res.json(teamRooms[roomId]);
});

app.post('/api/collaboration/comment', (req, res) => {
  const { roomId = 'demo-room', timestamp, author, text } = req.body;
  if (!teamRooms[roomId]) {
    teamRooms[roomId] = { users: [], comments: [] };
  }
  const comment = {
    id: `c_${Date.now()}`,
    timestamp: Number(timestamp) || 0,
    author: author || 'Олександр (Ви)',
    text: text || '',
    timeAgo: 'Щойно',
    resolved: false,
  };
  teamRooms[roomId].comments.push(comment);
  return res.json({ success: true, comment });
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`NovaCinema AI Studio server running on port ${port}`);
  });
}

startServer();
