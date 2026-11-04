"use client";
import { useEffect, useRef } from "react";

const TYPING_ELEMENT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

/** Single-key shortcuts (e.g. "c", "/", "j"). Ignored while typing in a field or holding Ctrl/Cmd/Alt. */
export function useHotkeys(handlersByKey: Record<string, (event: KeyboardEvent) => void>) {
  const handlersByKeyRef = useRef(handlersByKey);
  handlersByKeyRef.current = handlersByKey;
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const focusedElement = event.target as HTMLElement | null;
      if (focusedElement && (focusedElement.isContentEditable || TYPING_ELEMENT_TAGS.includes(focusedElement.tagName))) return;
      const handleHotkey = handlersByKeyRef.current[event.key];
      if (!handleHotkey) return;
      event.preventDefault();
      handleHotkey(event);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
