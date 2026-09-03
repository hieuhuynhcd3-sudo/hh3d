import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Save, Check } from 'lucide-react';
import type { Character } from '../types';
import { STORAGE_KEYS } from '../constants';

interface CharacterCardProps {
  character: Character;
  onUpdate: (prompt: string) => void;
}

function loadSavedCharacters(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FORM_STATE);
    if (raw) {
      const state = JSON.parse(raw);
      if (state.characters) {
        const map: Record<string, string> = {};
        for (const c of state.characters as Character[]) {
          map[c.id] = c.prompt;
        }
        return map;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function CharacterCard({ character, onUpdate }: CharacterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localPrompt, setLocalPrompt] = useState(character.prompt);
  const [showToast, setShowToast] = useState(false);
  const [saved, setSaved] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalPrompt(character.prompt);
  }, [character.prompt]);

  const handleSave = () => {
    onUpdate(localPrompt);

    // Persist to localStorage form state
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FORM_STATE);
      const state = raw ? JSON.parse(raw) : {};
      if (state.characters) {
        state.characters = state.characters.map((c: Character) =>
          c.id === character.id ? { ...c, prompt: localPrompt } : c
        );
        localStorage.setItem(STORAGE_KEYS.FORM_STATE, JSON.stringify(state));
      }
    } catch {
      /* ignore */
    }

    setSaved(true);
    setShowToast(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setShowToast(false);
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden transition-all duration-300 hover:border-gold-500/20 relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/20 flex items-center justify-center border border-gold-500/30">
            <User className="w-4 h-4 text-gold-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-ink-100">{character.name}</p>
            <p className="text-xs text-ink-400 truncate max-w-[180px]">
              {localPrompt.slice(0, 50)}...
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-ink-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-1">
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={5}
            className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 text-xs text-ink-200 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none scrollbar-thin leading-relaxed"
            placeholder="Mô tả nhân vật bằng tiếng Anh..."
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-[10px] text-ink-500">
              Mô tả chi tiết bằng tiếng Anh để AI tạo hình chính xác nhất
            </p>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 rounded-lg border border-gold-500/40 transition-colors shrink-0"
            >
              {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saved ? 'Đã lưu' : 'Lưu mô tả'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="absolute bottom-3 right-3 px-3 py-2 rounded-lg bg-accent-green/15 border border-accent-green/40 text-xs text-accent-green animate-slide-up backdrop-blur-sm z-10">
          Đã lưu mô tả nhân vật {character.name} thành công!
        </div>
      )}
    </div>
  );
}
