"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";

interface AddItemButtonProps {
  label: string;
  onClick: () => void;
}

export function AddItemButton({ label, onClick }: AddItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors mt-1"
    >
      <Plus size={12} /> {label}
    </button>
  );
}

interface ItemToolbarProps {
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canRemove?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  removeLabel?: string;
}

export function ItemToolbar({
  onRemove,
  onMoveUp,
  onMoveDown,
  canRemove = true,
  canMoveUp = false,
  canMoveDown = false,
  removeLabel = "Remove",
}: ItemToolbarProps) {
  return (
    <div className="flex items-center gap-1">
      {onMoveUp && (
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          title="Move up"
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowUp size={13} />
        </button>
      )}
      {onMoveDown && (
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          title="Move down"
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDown size={13} />
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        title={removeLabel}
        className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 size={13} />
        <span className="hidden sm:inline">{removeLabel}</span>
      </button>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  onRemoveSection?: () => void;
  canRemoveSection?: boolean;
}

export function SectionHeader({
  title,
  open,
  onToggle,
  onRemoveSection,
  canRemoveSection = false,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 border-b border-accent/30 mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex-1 flex items-center justify-between py-2 text-xs font-semibold text-accent uppercase tracking-widest"
      >
        {title}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {canRemoveSection && onRemoveSection && (
        <button
          type="button"
          onClick={onRemoveSection}
          title={`Remove ${title} section`}
          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

interface EditorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
}

export function EditorField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 2,
}: EditorFieldProps) {
  const base =
    "w-full bg-muted/40 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 px-3 py-2 transition-colors";

  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={`${base} resize-y min-h-[2.5rem]`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}
