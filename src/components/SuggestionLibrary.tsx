import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, Loader2, RefreshCw, Tag } from 'lucide-react';
import { SUGGESTION_CATEGORIES, STORAGE_KEYS } from '../constants';
import { getRandomMockSuggestions, MOCK_SUGGESTIONS } from '../mockData';
import type { SuggestionItem } from '../types';

interface SuggestionLibraryProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  onApply: (suggestion: SuggestionItem) => void;
}

const EXACT_COUNT = 6;

// --- History memory (titles of all scripts ever shown) ---

function loadHistory(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveHistory(titles: string[]) {
  try {
    const existing = loadHistory();
    titles.forEach((t) => existing.add(t));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([...existing]));
  } catch {
    /* ignore */
  }
}

// --- Current suggestions (last shown batch) ---

function loadStored(): SuggestionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUGGESTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStored(items: SuggestionItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SUGGESTIONS, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

// --- Helpers ---

function formatSuggestionAsText(item: SuggestionItem): string {
  let text = `🎬 ${item.title}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `Ý tưởng: ${item.idea}\n`;
  text += `Chủ đề: ${item.topic}\n`;
  text += `Bối cảnh: ${item.setting}\n`;
  text += `Cảm xúc: ${item.emotion}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  return text;
}

function downloadSuggestionTxt(item: SuggestionItem) {
  const blob = new Blob([formatSuggestionAsText(item)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${item.title.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Get exactly `count` unique mock suggestions not in historySet. If not enough remain, reset and retry. */
function getUniqueMocks(count: number, historySet: Set<string>): SuggestionItem[] {
  const available = MOCK_SUGGESTIONS.filter((m) => !historySet.has(m.title));

  if (available.length < count) {
    // Not enough unseen mocks — reset history for mocks and use all
    const shuffled = [...MOCK_SUGGESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map((item, i) => ({
      ...item,
      id: `mock-${Date.now()}-${i}`,
      createdAt: Date.now(),
    }));
  }

  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((item, i) => ({
    ...item,
    id: `mock-${Date.now()}-${i}`,
    createdAt: Date.now(),
  }));
}

export function SuggestionLibrary({ open, onClose, apiKey, onApply }: SuggestionLibraryProps) {
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(SUGGESTION_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    if (open) {
      setItems(loadStored());
      setUsedFallback(false);
    }
  }, [open]);

  const generate = useCallback(async () => {
    setLoading(true);
    setUsedFallback(false);

    const historySet = loadHistory();

    // Try API first if key is present
    if (apiKey) {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-suggestions`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            apiKey,
            categories: SUGGESTION_CATEGORIES,
            existingTitles: [...historySet],
          }),
        });

        if (!res.ok) throw new Error(`Lỗi ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const apiItems: SuggestionItem[] = (data.suggestions || []).map((s: Record<string, string>, i: number) => ({
          id: `${Date.now()}-${i}`,
          title: s.title || `Gợi ý ${i + 1}`,
          idea: s.idea || '',
          topic: s.topic || '',
          setting: s.setting || '',
          emotion: s.emotion || '',
          script: '',
          createdAt: Date.now(),
        }));

        // Filter out titles already in history
        let unique = apiItems.filter((n) => !historySet.has(n.title));

        // If fewer than EXACT_COUNT unique from API, top up with mock data
        if (unique.length < EXACT_COUNT) {
          const needed = EXACT_COUNT - unique.length;
          const mockItems = getUniqueMocks(needed + 4, historySet); // extra buffer
          const mockUnique = mockItems.filter(
            (m) => !historySet.has(m.title) && !unique.some((u) => u.title === m.title)
          );
          unique = [...unique, ...mockUnique].slice(0, EXACT_COUNT);
          setUsedFallback(true);
        }

        // Ensure exactly EXACT_COUNT
        const finalItems = unique.slice(0, EXACT_COUNT);

        // If still not enough (edge case), pad with mocks
        if (finalItems.length < EXACT_COUNT) {
          const needed = EXACT_COUNT - finalItems.length;
          const extraMocks = getUniqueMocks(needed, new Set([...historySet, ...finalItems.map((f) => f.title)]));
          finalItems.push(...extraMocks.slice(0, needed));
        }

        // REPLACE state — no appending to previous
        setItems(finalItems);
        saveStored(finalItems);
        saveHistory(finalItems.map((f) => f.title));
        setLoading(false);
        return;
      } catch {
        // Fall through to mock fallback below
      }
    }

    // Fallback: mock data (no API key, or API error 502/404/400/network)
    const mockItems = getUniqueMocks(EXACT_COUNT, historySet);
    const finalMocks = mockItems.slice(0, EXACT_COUNT);

    // REPLACE state
    setItems(finalMocks);
    saveStored(finalMocks);
    saveHistory(finalMocks.map((f) => f.title));
    setUsedFallback(true);
    setLoading(false);
  }, [apiKey]);

  const copyScript = (item: SuggestionItem) => {
    navigator.clipboard.writeText(formatSuggestionAsText(item));
    downloadSuggestionTxt(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = items.filter((i) => {
    const cat = SUGGESTION_CATEGORIES.find((c) =>
      i.topic.toLowerCase().includes(c.split(' ')[0].toLowerCase()) ||
      c.toLowerCase().includes(i.topic.toLowerCase().split(' ')[0])
    );
    return !activeCategory || cat === activeCategory || items.length < EXACT_COUNT;
  });

  const displayItems = filtered.length > 0 ? filtered : items;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] glass-panel rounded-2xl flex flex-col animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-gold-500" />
            <h2 className="text-base font-bold text-ink-100">Kho Gợi Ý Tuổi Thơ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-ink-700">
          <div
            className="flex gap-2 pb-1"
            style={{ display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', width: '100%' }}
          >
            {SUGGESTION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/40'
                    : 'bg-ink-800 text-ink-400 border border-ink-700 hover:border-ink-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
          {usedFallback && (
            <div className="mb-4 p-3 rounded-lg bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300">
              ⚠️ API gặp sự cố. Đang hiển thị kịch bản mẫu từ dữ liệu tĩnh nội bộ.
            </div>
          )}

          {displayItems.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-10 h-10 text-ink-600 mb-3" />
              <p className="text-sm text-ink-400">Chưa có gợi ý nào</p>
              <p className="text-xs text-ink-500 mt-1">Nhấn nút bên dưới để AI tạo gợi ý mới</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-xl p-4 hover:border-gold-500/20 transition-all group"
                >
                  <h3 className="text-sm font-semibold text-ink-100 mb-1.5">{item.title}</h3>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                      Tự động 7 thiết lập
                    </span>
                  </div>
                  <p className="text-xs text-ink-300 leading-relaxed mb-2 line-clamp-3">{item.idea}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.topic && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-ink-800 text-ink-400 border border-ink-700 flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {item.topic}
                      </span>
                    )}
                    {item.emotion && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-ink-800 text-ink-400 border border-ink-700 flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {item.emotion}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyScript(item)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-ink-800 hover:bg-ink-750 text-ink-300 rounded-lg border border-ink-700 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-accent-green" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      COPY KỊCH BẢN
                    </button>
                    <button
                      onClick={() => {
                        onApply(item);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 rounded-lg border border-gold-500/40 transition-colors ml-auto"
                    >
                      ÁP DỤNG KỊCH BẢN
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
              <span className="ml-2 text-sm text-ink-400">Đang tạo gợi ý...</span>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-ink-700">
          <button
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gradient-to-r from-gold-500/20 to-gold-600/20 hover:from-gold-500/30 hover:to-gold-600/30 text-gold-300 rounded-xl border border-gold-500/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Tạo thêm gợi ý AI / Đổi danh sách mới
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
