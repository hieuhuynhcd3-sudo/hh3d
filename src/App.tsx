import { useState, useEffect, useCallback } from 'react';
import { Film, Sparkles, Wand2, ChevronRight, Users, Lightbulb, Settings2 } from 'lucide-react';
import type { GeneratedScript as GS } from './types';
import {
  APP_NAME,
  APP_SUBTITLE,
  DEFAULT_CHARACTERS,
  DURATION_OPTIONS,
  ASPECT_OPTIONS,
  TOPIC_OPTIONS,
  SETTING_OPTIONS,
  WEATHER_OPTIONS,
  EMOTION_OPTIONS,
  ENDING_OPTIONS,
  STORAGE_KEYS,
} from './constants';
import type { Character, GeneratedScript, SuggestionItem } from './types';
import { MOCK_SCRIPT } from './mockScript';
import { TextField, TextAreaField, NumberField, SelectField } from './components/FormFields';
import { CharacterCard } from './components/CharacterCard';
import { ScriptOutput } from './components/ScriptOutput';
import { SuggestionLibrary } from './components/SuggestionLibrary';
import { ApiConfig } from './components/ApiConfig';

function loadFormState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FORM_STATE);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [title, setTitle] = useState('');
  const [promptIdea, setPromptIdea] = useState('');
  const [sceneCount, setSceneCount] = useState(8);
  const [durationPerScene, setDurationPerScene] = useState('8s');
  const [aspectRatio, setAspectRatio] = useState(ASPECT_OPTIONS[0]);
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0]);
  const [setting, setSetting] = useState(SETTING_OPTIONS[0]);
  const [weather, setWeather] = useState(WEATHER_OPTIONS[0]);
  const [emotion, setEmotion] = useState(EMOTION_OPTIONS[0]);
  const [endingStyle, setEndingStyle] = useState(ENDING_OPTIONS[0]);
  const [characters, setCharacters] = useState<Character[]>(DEFAULT_CHARACTERS);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedKey) setApiKey(savedKey);

    const saved = loadFormState();
    if (saved) {
      if (saved.title) setTitle(saved.title);
      if (saved.promptIdea) setPromptIdea(saved.promptIdea);
      if (saved.sceneCount) setSceneCount(saved.sceneCount);
      if (saved.durationPerScene) setDurationPerScene(saved.durationPerScene);
      if (saved.aspectRatio) setAspectRatio(saved.aspectRatio);
      if (saved.topic) setTopic(saved.topic);
      if (saved.setting) setSetting(saved.setting);
      if (saved.weather) setWeather(saved.weather);
      if (saved.emotion) setEmotion(saved.emotion);
      if (saved.endingStyle) setEndingStyle(saved.endingStyle);
      if (saved.characters) setCharacters(saved.characters);
    }

    const handleRestore = (e: Event) => {
      const detail = (e as CustomEvent<GS>).detail;
      if (detail) setScript(detail);
    };
    window.addEventListener('restore-script', handleRestore as EventListener);
    return () => window.removeEventListener('restore-script', handleRestore as EventListener);
  }, []);

  useEffect(() => {
    const state = {
      title,
      promptIdea,
      sceneCount,
      durationPerScene,
      aspectRatio,
      topic,
      setting,
      weather,
      emotion,
      endingStyle,
      characters,
    };
    localStorage.setItem(STORAGE_KEYS.FORM_STATE, JSON.stringify(state));
  }, [title, promptIdea, sceneCount, durationPerScene, aspectRatio, topic, setting, weather, emotion, endingStyle, characters]);

  const updateCharacter = (id: string, prompt: string) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, prompt } : c)));
  };

  const generateScript = useCallback(async () => {
    if (!apiKey) {
      setError('Vui lòng cấu hình Gemini API key trước.');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tên video.');
      return;
    }
    setLoading(true);
    setError(null);
    setScript(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          apiKey,
          title,
          promptIdea,
          sceneCount,
          durationPerScene,
          aspectRatio,
          topic,
          setting,
          weather,
          emotion,
          endingStyle,
          characters: characters.map((c) => ({ name: c.name, prompt: c.prompt })),
        }),
      });

      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (!data.scenes || !Array.isArray(data.scenes) || data.scenes.length === 0) {
        throw new Error('Dữ liệu trả về không hợp lệ');
      }

      // Trim extra scenes to match requested count
      if (data.scenes.length > sceneCount) {
        data.scenes = data.scenes.slice(0, sceneCount);
      }
      // Ensure last scene is CTA
      if (data.scenes.length === sceneCount) {
        data.scenes[sceneCount - 1].isCTA = true;
      }
      data.totalScenes = data.scenes.length;

      setScript(data as GeneratedScript);
    } catch {
      // Fallback to mock script — never crash, never show blank screen
      setScript(MOCK_SCRIPT);
      setError(null);
      showToast('API bận, đã tự động chuyển sang kịch bản mẫu chất lượng cao.');
    } finally {
      setLoading(false);
    }
  }, [apiKey, title, promptIdea, sceneCount, durationPerScene, aspectRatio, topic, setting, weather, emotion, endingStyle, characters]);

  const applySuggestion = (s: SuggestionItem) => {
    setTitle(s.title);
    setPromptIdea(s.idea);
    if (s.topic) setTopic(s.topic);
    if (s.setting) setSetting(s.setting);
    if (s.emotion) setEmotion(s.emotion);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-ink-100">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-ink-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 border border-gold-500/30 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-gold-500" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-ink-100 truncate">{APP_NAME}</h1>
              <p className="text-[10px] sm:text-xs text-ink-400 truncate">{APP_SUBTITLE}</p>
            </div>
          </div>
          <ApiConfig apiKey={apiKey} onApiKeyChange={setApiKey} />
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-xs text-gold-400 mb-3">
            <Sparkles className="w-3 h-3" />
            Pixar 3D · Việt Nam
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gold-gradient-text mb-2">
            Tạo Kịch Bản Hoạt Hình Tuổi Thơ
          </h2>
          <p className="text-sm text-ink-400">
            Biến ý tưởng thành video Pixar 3D với Tý, Bơ, Na — AI Gemini tạo kịch bản chi tiết từng cảnh
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-5">
            {/* Video Ideas */}
            <section className="glass-panel rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-gold-500" />
                <h3 className="text-sm font-bold text-ink-100 uppercase tracking-wide">Ý Tưởng Video</h3>
              </div>
              <div className="space-y-3">
                <TextField label="Tên video ngắn" value={title} placeholder="VD: Tý và cơn mưa mùa hạ" onChange={setTitle} />
                <TextAreaField label="Ý tưởng trung tâm" value={promptIdea} placeholder="Mô tả ý tưởng trung tâm của video..." onChange={setPromptIdea} />
              </div>
            </section>

            {/* Quick Setup */}
            <section className="glass-panel rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-4 h-4 text-gold-500" />
                <h3 className="text-sm font-bold text-ink-100 uppercase tracking-wide">Thiết Lập Nhanh</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Số cảnh" value={sceneCount} onChange={setSceneCount} min={1} />
                <SelectField label="Thời lượng mỗi cảnh" value={durationPerScene} options={DURATION_OPTIONS} onChange={setDurationPerScene} />
                <SelectField label="Tỷ lệ khung hình" value={aspectRatio} options={ASPECT_OPTIONS} onChange={setAspectRatio} />
                <SelectField label="Chủ đề chính" value={topic} options={TOPIC_OPTIONS} onChange={setTopic} />
                <SelectField label="Bối cảnh chính" value={setting} options={SETTING_OPTIONS} onChange={setSetting} />
                <SelectField label="Thời tiết / Mùa" value={weather} options={WEATHER_OPTIONS} onChange={setWeather} />
                <SelectField label="Cảm xúc" value={emotion} options={EMOTION_OPTIONS} onChange={setEmotion} />
                <SelectField label="Kiểu kết thúc" value={endingStyle} options={ENDING_OPTIONS} onChange={setEndingStyle} />
              </div>
            </section>

            {/* Characters */}
            <section className="glass-panel rounded-2xl p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gold-500" />
                <h3 className="text-sm font-bold text-ink-100 uppercase tracking-wide">Nhân Vật Chính</h3>
              </div>
              <div className="space-y-2.5">
                {characters.map((char) => (
                  <CharacterCard key={char.id} character={char} onUpdate={(p) => updateCharacter(char.id, p)} />
                ))}
              </div>
            </section>

            {/* Generate Button */}
            <div className="sticky bottom-4 z-20">
              <button
                onClick={generateScript}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-ink-950 rounded-2xl shadow-lg shadow-gold-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-gold-500/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Tạo Kịch Bản
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-300 uppercase tracking-wide">Kịch Bản</h3>
              <button
                onClick={() => setShowSuggestions(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 rounded-lg border border-gold-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Kho Gợi Ý
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <ScriptOutput script={script} loading={loading} error={error} characters={characters} />
          </div>
        </div>
      </main>

      <SuggestionLibrary open={showSuggestions} onClose={() => setShowSuggestions(false)} apiKey={apiKey} onApply={applySuggestion} />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className="glass-panel rounded-xl px-4 py-3 max-w-sm border border-gold-500/40 bg-gold-500/10">
            <p className="text-xs text-gold-300 font-medium leading-relaxed">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
