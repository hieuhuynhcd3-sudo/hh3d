import { useState } from 'react';
import {
  Copy, Check, Download, Film, Megaphone, Undo2, Redo2,
  FileText, FileType, Image, Video, Lightbulb, Users, ShoppingBag,
} from 'lucide-react';
import type { GeneratedScript, Character } from '../types';

interface ScriptOutputProps {
  script: GeneratedScript | null;
  loading: boolean;
  error: string | null;
  characters: Character[];
}

// --- Quality keyword constants ---

const IMAGE_QUALITY = '3D Pixar style animation, highly detailed, 8k resolution, 4k uhd, Octane Render, ray tracing, cinematic lighting, masterpiece';
const VIDEO_QUALITY = 'Aspect ratio 9:16, 60fps, high quality 3D animated video, fluid movement, hyper-realistic physics';

// --- Vietnamese rural environment lock ---

const ENV_LOCK = '[Environment]: Authentic Northern Vietnamese rural village, red dirt path, lush green bamboo trees line, golden ripe rice fields, traditional brick houses with red clay tile roofs, Banyan tree near a calm lotus pond, warm golden sunlight, rustic peaceful atmosphere.';
const ENV_NEGATIVE = 'No European style buildings, no modern concrete roads, no Western architecture, no city elements.';

// --- Strict character lock (outfit, proportion, props) ---

const CHARACTER_LOCK = 'Only feature the main characters Ty, Bo, and Na. Strictly no random background people, no character face morphing, keep character designs 100% consistent. No text or letters printed on clothing.';
const CHARACTER_DESCRIPTORS = '7-year-old Vietnamese boy Ty (shaved head with small 3-braids tuft, wearing moss-green Ba Ba shirt and dark shorts), 7-year-old chubby Vietnamese boy Bo (round black glasses, bright yellow t-shirt and denim shorts), 7-year-old Vietnamese girl Na (pigtails with red ribbons, pink floral dress)';
const OUTFIT_LOCK = 'Strict outfit lock: Ty must always wear moss-green Ba Ba shirt and dark shorts. Bo must always wear bright yellow t-shirt and denim shorts. Na must always wear pink floral dress. Never change outfits between scenes. No printed text or letters on any clothing.';
const PROPORTION_LOCK = 'Proportion & scale lock: Ty is average height, Bo is slightly shorter and chubby, Na is petite. Maintain consistent body proportions and heights across all scenes. No face morphing, no body distortion.';
const PROPS_LOCK = 'Props & physics lock: Props (bug net, bamboo tube, wooden stick, rubber tire) must keep identical shape and material throughout the scene. Characters must firmly grip props in hand (no floating objects, no clipping artifacts). Props must not transform into unrelated objects.';;

// --- Safety filter: replace sensitive words with kid-safe toys ---

const SAFETY_REPLACEMENTS: Record<string, string> = {
  gun: 'bamboo pop gun',
  weapon: 'toy bamboo',
  shoot: 'pop with bamboo toy',
  firearm: 'toy bamboo pop-shooter',
  kill: 'tag playfully',
  bullet: 'bamboo dart',
  sword: 'wooden toy sword',
  knife: 'wooden toy knife',
  blood: 'red paint splatter',
  fight: 'playful tussle',
  punch: 'gentle tap',
};

function applySafetyFilter(text: string): string {
  let result = text;
  for (const [bad, safe] of Object.entries(SAFETY_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${bad}\\b`, 'gi');
    result = result.replace(regex, safe);
  }
  return result;
}

// --- Template enforcement ---

function enforceImageTemplate(prompt: string): string {
  let p = prompt;
  if (!p.includes('Pixar 3D style') && !p.includes('3D Pixar style')) {
    p = `${p}${p.trim() ? '. ' : ''}${IMAGE_QUALITY}`;
  }
  if (!p.toLowerCase().includes('[environment]')) {
    p += `\n${ENV_LOCK}`;
  }
  if (!p.toLowerCase().includes('only feature the main characters')) {
    p += `\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}`;
  }
  if (!p.toLowerCase().includes('strict outfit lock')) {
    p += `\n${OUTFIT_LOCK}`;
  }
  if (!p.toLowerCase().includes('proportion & scale lock')) {
    p += `\n${PROPORTION_LOCK}`;
  }
  if (!p.toLowerCase().includes('props & physics lock')) {
    p += `\n${PROPS_LOCK}`;
  }
  if (!p.toLowerCase().includes('no european style')) {
    p += `\n${ENV_NEGATIVE}`;
  }
  if (!p.toLowerCase().includes('family-friendly')) {
    p += '\n[Safety & Policy]: Family-friendly, kids content, no violence, no real weapons, safe toys only.';
  }
  return applySafetyFilter(p);
}

function enforceVideoTemplate(prompt: string, dialogue: string, charNames: string[]): string {
  let p = prompt;
  if (!p.includes('60fps')) {
    p = `${p}${p.trim() ? '. ' : ''}${VIDEO_QUALITY}`;
  }
  if (!p.toLowerCase().includes('[environment]')) {
    p += `\n${ENV_LOCK}`;
  }
  if (!p.toLowerCase().includes('only feature the main characters')) {
    p += `\n[Subject]: ${CHARACTER_DESCRIPTORS}. ${CHARACTER_LOCK}`;
  }
  if (!p.toLowerCase().includes('strict outfit lock')) {
    p += `\n${OUTFIT_LOCK}`;
  }
  if (!p.toLowerCase().includes('proportion & scale lock')) {
    p += `\n${PROPORTION_LOCK}`;
  }
  if (!p.toLowerCase().includes('props & physics lock')) {
    p += `\n${PROPS_LOCK}`;
  }
  if (!p.toLowerCase().includes('no european style')) {
    p += `\n${ENV_NEGATIVE}`;
  }
  if (!p.toLowerCase().includes('camera movement')) {
    p += '\n[Camera Movement]: Smooth cinematic camera movement tracking the action.';
  }
  if (dialogue && dialogue.trim() && !p.toLowerCase().includes('lip-sync')) {
    const speaker = charNames[0] || 'Character';
    p += `\n[Character Motion & Lip-sync]: ${speaker} lip-sync speaking naturally in Vietnamese with clear mouth movements matching dialogue: "${dialogue}". Lip-sync accuracy high, expressive facial animation. Strictly keep identical faces and outfits for Ty, Bo, and Na (no morphing).`;
  }
  if (!p.toLowerCase().includes('object physics') && !p.toLowerCase().includes('physics & scale')) {
    p += '\n[Object Physics & Scale]: Characters firmly hold objects in hand (no floating objects, no clipping). Animals and objects maintain realistic, proportionate sizes. Foot movements sync with ground during running.';
  }
  if (!p.toLowerCase().includes('lighting & atmosphere') && !p.toLowerCase().includes('environment & lighting')) {
    p += '\n[Environment & Lighting]: Authentic Vietnamese countryside, bamboo leaves swaying in wind, golden afternoon sunlight with soft dust particles.';
  }
  if (!p.toLowerCase().includes('audio & sound')) {
    p += '\n[Audio & Sound Effects]: Cheerful traditional Vietnamese acoustic music, children laughing, footsteps on dirt road, natural ambient sounds.';
  }
  return applySafetyFilter(p);
}

// --- Formatters ---

function formatFullScript(script: GeneratedScript): string {
  let text = `🎬 ${script.videoTitle}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Tóm tắt: ${script.summary || script.centralIdea}\n`;
  text += `Tổng cảnh: ${script.totalScenes} | Tổng thời lượng: ${script.totalDuration} | Tỷ lệ: ${script.aspectRatio}\n`;
  if (script.affiliateSuggestion) {
    text += `🛒 Gợi ý Affiliate: ${script.affiliateSuggestion}\n`;
  }
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  script.scenes.forEach((scene) => {
    text += `CẢNH ${scene.sceneNumber}: ${scene.title}\n`;
    text += `⏱ Thời lượng: ${scene.duration}\n`;
    text += `🖼️ IMAGE PROMPT:\n${scene.visualPrompt}\n\n`;
    text += `🎥 VIDEO PROMPT:\n${scene.videoPrompt}\n\n`;
    text += `📷 Camera: ${scene.cameraMotion}\n`;
    text += `💬 Lời thoại: ${scene.dialogue}\n`;
    text += `🔊 Âm thanh: ${scene.soundDesign}\n`;
    if (scene.isCTA) text += `📢 CTA SCENE\n`;
    text += `\n${'─'.repeat(40)}\n\n`;
  });
  return text;
}

function formatImagePrompts(script: GeneratedScript): string {
  return script.scenes
    .map((s) => `CẢNH ${s.sceneNumber}: ${s.title}\n${s.visualPrompt}`)
    .join('\n\n' + '─'.repeat(40) + '\n\n');
}

function formatVideoPrompts(script: GeneratedScript): string {
  return script.scenes
    .map((s) => `CẢNH ${s.sceneNumber}: ${s.title}\n${s.videoPrompt}`)
    .join('\n\n' + '─'.repeat(40) + '\n\n');
}

function formatCharacterPrompts(characters: Character[]): string {
  return characters.map((c) => `${c.name}: ${c.prompt}`).join('\n\n');
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadHtmlAsWord(content: string, filename: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kịch bản</title></head><body>${content}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// --- Small copy button ---

function CopyButton({ onCopy, label }: { onCopy: () => void; label: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Đã copy' : label}
    </button>
  );
}

// --- Main component ---

export function ScriptOutput({ script, loading, error, characters }: ScriptOutputProps) {
  const [history, setHistory] = useState<GeneratedScript[]>([]);
  const [redoStack, setRedoStack] = useState<GeneratedScript[]>([]);

  const safeName = (s: string) => s.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_');

  const undo = () => {
    if (history.length === 0 || !script) return;
    setRedoStack((r) => [...r, script]);
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    // Use a custom event to restore script in parent
    window.dispatchEvent(new CustomEvent('restore-script', { detail: prev }));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    if (script) setHistory((h) => [...h, script]);
    window.dispatchEvent(new CustomEvent('restore-script', { detail: next }));
  };

  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-ink-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold-500 animate-spin" />
        </div>
        <p className="text-sm text-ink-300 font-medium">Đang tạo kịch bản...</p>
        <p className="text-xs text-ink-500 mt-1">Gemini 3.6 Flash đang sáng tạo câu chuyện</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px] border-accent-red/30">
        <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mb-3">
          <span className="text-2xl">⚠</span>
        </div>
        <p className="text-sm text-accent-red font-medium text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center min-h-[300px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-700/10 border border-gold-500/20 flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-gold-500/50" />
        </div>
        <p className="text-sm text-ink-400 font-medium">Kịch bản sẽ hiển thị tại đây</p>
        <p className="text-xs text-ink-500 mt-1">Điền form và nhấn "Tạo Kịch Bản" để bắt đầu</p>
      </div>
    );
  }

  const charText = script.characterPrompts || formatCharacterPrompts(characters);
  const charNames = characters.map((c) => c.name);

  // Apply client-side safety filter + template enforcement to every scene
  const safeScenes = script.scenes.map((s) => ({
    ...s,
    visualPrompt: enforceImageTemplate(s.visualPrompt),
    videoPrompt: enforceVideoTemplate(s.videoPrompt, s.dialogue, charNames),
  }));
  const safeScript = { ...script, scenes: safeScenes };

  const wordContent = `
    <h1>${script.videoTitle}</h1>
    <p><b>Tóm tắt:</b> ${script.summary || script.centralIdea}</p>
    <p><b>Tổng cảnh:</b> ${script.totalScenes} | <b>Thời lượng:</b> ${script.totalDuration} | <b>Tỷ lệ:</b> ${script.aspectRatio}</p>
    <hr/>
    <h2>Prompt khóa nhân vật</h2>
    <pre>${charText}</pre>
    <hr/>
    <table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
      <tr><th>STT</th><th>IMAGE PROMPT</th><th>VIDEO PROMPT</th></tr>
      ${safeScenes.map((s) => `<tr><td>${s.sceneNumber}</td><td>${s.visualPrompt}</td><td>${s.videoPrompt}</td></tr>`).join('')}
    </table>
  `;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Title bar */}
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-lg font-bold text-ink-100">{script.videoTitle}</h2>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-[10px] px-2 py-1 rounded-md bg-ink-800 text-ink-300 border border-ink-700">{script.totalScenes} cảnh</span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-ink-800 text-ink-300 border border-ink-700">{script.totalDuration}</span>
          <span className="text-[10px] px-2 py-1 rounded-md bg-ink-800 text-ink-300 border border-ink-700">{script.aspectRatio}</span>
        </div>
      </div>

      {/* Top toolbar */}
      <div className="glass-panel rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <button onClick={undo} disabled={history.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors disabled:opacity-40">
          <Undo2 className="w-3 h-3" /> Hoàn tác
        </button>
        <button onClick={redo} disabled={redoStack.length === 0} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors disabled:opacity-40">
          <Redo2 className="w-3 h-3" /> Làm lại
        </button>
        <div className="w-px h-5 bg-ink-700" />
        <CopyButton label="Copy toàn bộ" onCopy={() => navigator.clipboard.writeText(formatFullScript(safeScript))} />
        <button onClick={() => downloadText(formatFullScript(safeScript), `${safeName(safeScript.videoTitle)}.txt`)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors">
          <FileText className="w-3 h-3" /> TXT
        </button>
        <button onClick={() => downloadHtmlAsWord(wordContent, `${safeName(safeScript.videoTitle)}.doc`)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors">
          <FileType className="w-3 h-3" /> Word
        </button>
        <div className="w-px h-5 bg-ink-700" />
        <CopyButton label="Copy ảnh" onCopy={() => navigator.clipboard.writeText(formatImagePrompts(safeScript))} />
        <button onClick={() => downloadText(formatImagePrompts(safeScript), `${safeName(safeScript.videoTitle)}_image_prompts.txt`)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors">
          <Image className="w-3 h-3" /> TXT ảnh
        </button>
        <div className="w-px h-5 bg-ink-700" />
        <CopyButton label="Copy video" onCopy={() => navigator.clipboard.writeText(formatVideoPrompts(safeScript))} />
        <button onClick={() => downloadText(formatVideoPrompts(safeScript), `${safeName(safeScript.videoTitle)}_video_prompts.txt`)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-200 rounded-lg border border-ink-700 transition-colors">
          <Video className="w-3 h-3" /> TXT video
        </button>
      </div>

      {/* Summary + Character Lock (2-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-gold-500" />
            <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wide">Tóm tắt kịch bản</h3>
          </div>
          <p className="text-sm text-ink-300 leading-relaxed">{script.summary || script.centralIdea}</p>
        </div>
        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gold-500" />
              <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wide">Prompt khóa nhân vật</h3>
            </div>
            <CopyButton label="Copy" onCopy={() => navigator.clipboard.writeText(charText)} />
          </div>
          <pre className="text-xs text-ink-300 leading-relaxed whitespace-pre-wrap font-mono max-h-32 overflow-y-auto scrollbar-thin">{charText}</pre>
        </div>
      </div>

      {/* Yellow tip box */}
      <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 leading-relaxed">
        💡 Mẹo đồng nhất: Dùng ảnh 3D nhân vật ở Section 2 làm Reference Image khi tạo ảnh.
      </div>

      {/* Affiliate suggestion box */}
      {safeScript.affiliateSuggestion && (
        <div className="glass-panel rounded-2xl p-4 border border-gold-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-4 h-4 text-gold-500" />
            <h3 className="text-xs font-bold text-ink-100 uppercase tracking-wide">Gợi ý sản phẩm Affiliate</h3>
          </div>
          <p className="text-xs text-ink-300 leading-relaxed">{safeScript.affiliateSuggestion}</p>
        </div>
      )}

      {/* Prompt table (3 columns: STT, IMAGE PROMPT, VIDEO PROMPT) */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink-850 border-b border-ink-700">
                <th className="px-3 py-3 text-[10px] font-bold text-gold-400 uppercase tracking-wide w-12 text-center">STT</th>
                <th className="px-3 py-3 text-[10px] font-bold text-gold-400 uppercase tracking-wide">IMAGE PROMPT</th>
                <th className="px-3 py-3 text-[10px] font-bold text-gold-400 uppercase tracking-wide">VIDEO PROMPT</th>
              </tr>
            </thead>
            <tbody>
              {safeScenes.map((scene) => (
                <tr key={scene.sceneNumber} className={`border-b border-ink-800 hover:bg-ink-800/30 transition-colors ${scene.isCTA ? 'bg-gold-500/5' : ''}`}>
                  <td className="px-3 py-3 text-center align-top">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mx-auto ${scene.isCTA ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' : 'bg-ink-800 text-ink-300 border border-ink-700'}`}>
                      {scene.sceneNumber}
                    </div>
                    {scene.isCTA && <Megaphone className="w-3 h-3 text-gold-500 mx-auto mt-1" />}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-xs text-ink-200 leading-relaxed font-mono">{scene.visualPrompt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] text-ink-500">{scene.duration}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(scene.visualPrompt)}
                        className="p-1 rounded text-ink-400 hover:text-gold-500 hover:bg-ink-800 transition-colors"
                        title="Copy image prompt"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <p className="text-xs text-ink-200 leading-relaxed font-mono">{scene.videoPrompt}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-ink-400">📷 {scene.cameraMotion}</p>
                      <p className="text-[10px] text-ink-300">💬 {scene.dialogue}</p>
                      <p className="text-[10px] text-ink-400">🔊 {scene.soundDesign}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(scene.videoPrompt)}
                      className="mt-1 p-1 rounded text-ink-400 hover:text-gold-500 hover:bg-ink-800 transition-colors"
                      title="Copy video prompt"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
