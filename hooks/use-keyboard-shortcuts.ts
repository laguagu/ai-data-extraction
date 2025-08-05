"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onExtract?: () => void;
  onReset?: () => void;
  onToggleTheme?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onExtract,
  onReset,
  onToggleTheme,
  disabled = false,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to extract
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && onExtract) {
        e.preventDefault();
        onExtract();
      }

      // Cmd/Ctrl + R to reset
      if ((e.metaKey || e.ctrlKey) && e.key === "r" && onReset) {
        e.preventDefault();
        onReset();
      }

      // Cmd/Ctrl + D to toggle theme
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && onToggleTheme) {
        e.preventDefault();
        onToggleTheme();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onExtract, onReset, onToggleTheme, disabled]);
}
