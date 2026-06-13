"use client";

import { useState, useEffect, useRef } from "react";
import { EditorField } from "@/components/preview/editor/EditorPrimitives";

interface SkillsCommaInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

/**
 * Comma-separated skills input: keeps a local raw string so partial tokens (e.g. trailing ", Java")
 * are not stripped by re-joining on every keystroke — the root cause of "can't type after PDF save".
 */
export function SkillsCommaInput({ skills, onSkillsChange }: SkillsCommaInputProps) {
  const skillsKey = skills.join("\u0001");
  const [text, setText] = useState(() => skills.join(", "));
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    setText(skills.join(", "));
  }, [skillsKey, skills]);

  const handleChange = (raw: string) => {
    isInternalChange.current = true;
    setText(raw);
    onSkillsChange(
      raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    );
  };

  return (
    <EditorField
      label="Skills (comma-separated)"
      value={text}
      onChange={handleChange}
    />
  );
}
