'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

/** Estado de abertura do mega menu e da categoria em destaque no painel. */
export function useCategoryMenuState() {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return {
    open,
    activeSlug,
    triggerRef,
    panelId,
    toggle: useCallback(() => setOpen((value) => !value), []),
    close: useCallback(() => setOpen(false), []),
    setActiveSlug,
  };
}
