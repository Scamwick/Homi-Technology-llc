'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
} from 'react';
import { ChevronDown, Check } from 'lucide-react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Select — Custom dropdown with keyboard navigation
 * HōMI Design System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder when no value selected */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Additional classes */
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select\u2026',
  error,
  label,
  disabled = false,
  className = '',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const listboxId = `${baseId}-listbox`;
  const labelId = label ? `${baseId}-label` : undefined;
  const errorId = error ? `${baseId}-error` : undefined;

  const selectedOption = options.find((o) => o.value === value);
  const hasError = Boolean(error);

  /* ── Close on outside click ──────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  /* ── Scroll focused option into view ─────────────────────────────────── */
  useEffect(() => {
    if (!open || focusIndex < 0) return;
    const li = listboxRef.current?.children[focusIndex] as HTMLElement | undefined;
    li?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex, open]);

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setOpen((prev) => {
      if (!prev) {
        const idx = options.findIndex((o) => o.value === value);
        setFocusIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }, [disabled, options, value]);

  const selectOption = useCallback(
    (opt: SelectOption) => {
      onChange(opt.value);
      setOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (open && focusIndex >= 0) {
            selectOption(options[focusIndex]);
          } else {
            toggleOpen();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!open) {
            setOpen(true);
            const idx = options.findIndex((o) => o.value === value);
            setFocusIndex(idx >= 0 ? idx : 0);
          } else {
            setFocusIndex((prev) => Math.min(prev + 1, options.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (open) {
            setFocusIndex((prev) => Math.max(prev - 1, 0));
          }
          break;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          break;
        case 'Home':
          if (open) {
            e.preventDefault();
            setFocusIndex(0);
          }
          break;
        case 'End':
          if (open) {
            e.preventDefault();
            setFocusIndex(options.length - 1);
          }
          break;
      }
    },
    [disabled, open, focusIndex, options, value, selectOption, toggleOpen],
  );

  return (
    <div ref={containerRef} className={['relative', className].filter(Boolean).join(' ')}>
      {/* Label */}
      {label && (
        <label
          id={labelId}
          className="block mb-1.5 text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        id={triggerId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-describedby={errorId}
        aria-invalid={hasError}
        disabled={disabled}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={[
          'flex items-center justify-between w-full',
          'bg-[var(--slate)] text-[var(--text-primary)]',
          'rounded-[var(--radius-md)] h-10 px-3 text-sm',
          'border outline-none',
          'min-h-[44px] sm:min-h-10',
          hasError
            ? 'border-[var(--homi-crimson)]'
            : 'border-[var(--slate-light)]',
          hasError
            ? 'focus:border-[var(--homi-crimson)] focus:ring-2 focus:ring-[rgba(239,68,68,0.2)]'
            : 'focus:border-[var(--cyan)] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          'transition-all duration-[var(--duration-fast)] ease-[var(--ease)]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={selectedOption ? '' : 'text-[var(--text-secondary)]'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={[
            'shrink-0 ml-2 text-[var(--text-secondary)]',
            'transition-transform duration-[var(--duration-fast)] ease-[var(--ease)]',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          aria-activedescendant={
            focusIndex >= 0 ? `${baseId}-option-${focusIndex}` : undefined
          }
          className={[
            'absolute z-50 mt-1 w-full',
            'bg-[var(--navy-light)] border border-[var(--slate)]',
            'rounded-[8px] shadow-lg',
            'max-h-60 overflow-auto',
            'py-1',
            'animate-[homi-select-in_150ms_ease]',
          ].join(' ')}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isFocused = i === focusIndex;
            return (
              <li
                key={opt.value}
                id={`${baseId}-option-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusIndex(i)}
                onClick={() => selectOption(opt)}
                className={[
                  'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                  'min-h-[44px] sm:min-h-0',
                  'transition-colors duration-[var(--duration-fast)]',
                  isFocused ? 'bg-[var(--slate)]' : '',
                  isSelected ? 'text-[var(--cyan)]' : 'text-[var(--text-primary)]',
                ].join(' ')}
              >
                {isSelected && (
                  <Check size={14} className="shrink-0 text-[var(--cyan)]" aria-hidden="true" />
                )}
                <span className={isSelected ? '' : 'ml-[22px]'}>{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Error */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-xs text-[var(--homi-crimson)]"
        >
          {error}
        </p>
      )}

      <style>{`
        @keyframes homi-select-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
