"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: "en",   label: "English" },
  { value: "auto", label: "Auto-detect from JD" },
  { value: "es",   label: "Spanish" },
  { value: "fr",   label: "French" },
  { value: "de",   label: "German" },
  { value: "pt",   label: "Portuguese" },
  { value: "it",   label: "Italian" },
  { value: "nl",   label: "Dutch" },
  { value: "pl",   label: "Polish" },
  { value: "ja",   label: "Japanese" },
  { value: "zh",   label: "Chinese (Simplified)" },
] as const;

interface LangSelectProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
}

export function LangSelect({ value, onChange, label }: LangSelectProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = LANGUAGE_OPTIONS.find(o => o.value === value);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const dropdown =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            className="fixed z-[200] glass-card overflow-hidden shadow-lg"
            style={{ top: position.top, left: position.left, width: position.width }}
          >
            <div className="max-h-44 overflow-y-auto py-1">
              {LANGUAGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === opt.value ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted/60"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="relative">
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground hover:border-accent/40 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50"
      >
        <span>{selected?.label}</span>
        <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {dropdown}
    </div>
  );
}
