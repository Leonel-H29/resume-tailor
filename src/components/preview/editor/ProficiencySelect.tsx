"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";
import {
  LANGUAGE_PROFICIENCY_LEVELS,
  type LanguageProficiencyLevel,
} from "@/domain/entities/resumeSections";

interface ProficiencySelectProps {
  value: string;
  onChange: (value: LanguageProficiencyLevel) => void;
  label: string;
}

const PROFICIENCY_OPTIONS = LANGUAGE_PROFICIENCY_LEVELS.map((level) => ({
  value: level,
  label: level,
}));

export function ProficiencySelect({ value, onChange, label }: ProficiencySelectProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    PROFICIENCY_OPTIONS.find((option) => option.value === value) ??
    PROFICIENCY_OPTIONS.find((option) => option.value === "B2");

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const element = triggerRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
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
              {PROFICIENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    value === option.value
                      ? "bg-accent/10 text-accent"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {option.label}
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
        onClick={() => setOpen((current) => !current)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground hover:border-accent/40 transition-colors focus:outline-none focus:ring-1 focus:ring-accent/50"
      >
        <span>{selected?.label}</span>
        <ChevronDown
          size={13}
          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {dropdown}
    </div>
  );
}
