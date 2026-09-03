import { useState, useRef, useEffect } from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  customPrefix?: string;
}

export function SelectField({ label, value, options, onChange, customPrefix = '📝' }: SelectFieldProps) {
  const isCustom = value.startsWith(customPrefix) && value !== `${customPrefix} Tùy chỉnh khác...`;
  const [showCustom, setShowCustom] = useState(isCustom);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCustom]);

  const handleChange = (val: string) => {
    if (val === `${customPrefix} Tùy chỉnh khác...`) {
      setShowCustom(true);
      onChange('');
    } else {
      setShowCustom(false);
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-300">{label}</label>
      {!showCustom ? (
        <div className="relative group">
          <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full appearance-none bg-ink-850 border border-ink-700 rounded-lg px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all cursor-pointer hover:border-ink-600"
          >
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-ink-850 text-ink-100">
                {opt}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 group-hover:text-gold-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Nhập giá trị tùy chỉnh..."
            className="flex-1 bg-ink-850 border border-gold-500/40 rounded-lg px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/70 focus:ring-1 focus:ring-gold-500/30 transition-all placeholder:text-ink-500"
          />
          <button
            onClick={() => {
              setShowCustom(false);
              onChange(options[0]);
            }}
            className="px-3 py-2.5 text-xs font-medium text-ink-300 bg-ink-800 hover:bg-ink-750 rounded-lg border border-ink-700 transition-colors whitespace-nowrap"
          >
            Chọn lại
          </button>
        </div>
      )}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function NumberField({ label, value, onChange, min = 1 }: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-300">{label}</label>
      <div className="flex items-center gap-1 bg-ink-850 border border-ink-700 rounded-lg overflow-hidden focus-within:border-gold-500/60 transition-all">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-3 py-2.5 text-ink-300 hover:text-gold-500 hover:bg-ink-800 transition-colors text-lg leading-none"
          aria-label="Giảm"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || min))}
          className="w-full bg-transparent text-center text-sm text-ink-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => onChange(value + 1)}
          className="px-3 py-2.5 text-ink-300 hover:text-gold-500 hover:bg-ink-800 transition-colors text-lg leading-none"
          aria-label="Tăng"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-300">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-850 border border-ink-700 rounded-lg px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all placeholder:text-ink-500"
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextAreaField({ label, value, placeholder, onChange, rows = 3 }: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-ink-300">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-850 border border-ink-700 rounded-lg px-3 py-2.5 text-sm text-ink-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all placeholder:text-ink-500 resize-none scrollbar-thin"
      />
    </div>
  );
}
