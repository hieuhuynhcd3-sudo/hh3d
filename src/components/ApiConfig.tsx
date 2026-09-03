import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { STORAGE_KEYS, GEMINI_MODEL } from '../constants';

interface ApiConfigProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

type ModelStatus = 'idle' | 'checking' | 'ready' | 'error';

export function ApiConfig({ apiKey, onApiKeyChange }: ApiConfigProps) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');
  const [modelMessage, setModelMessage] = useState<string>('');

  useEffect(() => {
    setLocalKey(apiKey);
    if (!apiKey) {
      setModelStatus('idle');
      setModelMessage('');
    }
  }, [apiKey]);

  const validateGemini36Model = async (key: string) => {
    setModelStatus('checking');
    setModelMessage('');
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Xin chào' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (res.ok) {
        setModelStatus('ready');
        setModelMessage('🟢 Gemini 3.6 Flash sẵn sàng');
      } else {
        setModelStatus('error');
        setModelMessage('🔴 Model gemini-3.6-flash hiện không khả dụng hoặc API Key chưa kích hoạt quyền access model này');
      }
    } catch {
      setModelStatus('error');
      setModelMessage('🔴 Model gemini-3.6-flash hiện không khả dụng hoặc API Key chưa kích hoạt quyền access model này');
    }
  };

  const save = () => {
    onApiKeyChange(localKey);
    localStorage.setItem(STORAGE_KEYS.API_KEY, localKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (localKey) {
      validateGemini36Model(localKey);
    } else {
      setModelStatus('idle');
      setModelMessage('');
    }
  };

  const masked = apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
          apiKey
            ? 'bg-accent-green/10 text-accent-green border-accent-green/30 hover:bg-accent-green/15'
            : 'bg-accent-red/10 text-accent-red border-accent-red/30 hover:bg-accent-red/15'
        }`}
      >
        {apiKey ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
        {apiKey ? `API: ${masked}` : 'Chưa cấu hình API'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl p-4 z-50 animate-slide-down">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-gold-500" />
              <h3 className="text-sm font-semibold text-ink-100">CẤU HÌNH AI ENGINE</h3>
            </div>
            <p className="text-xs text-ink-400 mb-3 leading-relaxed">
              Sử dụng mô hình <span className="text-gold-400 font-medium">Gemini 3.6 Flash</span> để sinh kịch bản.
              Nhập API key từ Google AI Studio.
            </p>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-ink-900 border border-ink-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-ink-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all placeholder:text-ink-500 font-mono"
              />
              <button
                onClick={() => setShow(!show)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200 transition-colors"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={save}
              className="w-full mt-3 px-4 py-2.5 text-sm font-semibold bg-gold-500/15 hover:bg-gold-500/25 text-gold-300 rounded-lg border border-gold-500/40 transition-all"
            >
              {saved ? 'Đã lưu!' : 'Lưu & Kiểm tra Model'}
            </button>

            {modelStatus === 'checking' && (
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang kiểm tra model {GEMINI_MODEL}...
              </div>
            )}
            {(modelStatus === 'ready' || modelStatus === 'error') && (
              <div
                className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${
                  modelStatus === 'ready'
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                    : 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                }`}
              >
                {modelMessage}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
