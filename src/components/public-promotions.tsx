'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Campaigns yield to navigation, form entry and open interactive dialogs. */
export function PublicPromotions({ paused, children }: { paused: boolean; children: ReactNode }): React.JSX.Element | null {
  const [engaged, setEngaged] = useState(false);
  const [interacting, setInteracting] = useState(false);

  useEffect(() => {
    const onScroll = (): void => {
      if (window.scrollY >= 160) setEngaged(true);
    };
    const checkInteraction = (): void => {
      const active = document.activeElement;
      const enteringForm = active instanceof HTMLElement && Boolean(active.closest('main form'));
      const openDialog = document.querySelector('[role="dialog"][data-state="open"], [role="listbox"]');
      setInteracting(enteringForm || Boolean(openDialog));
    };
    onScroll();
    checkInteraction();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('focusin', checkInteraction);
    document.addEventListener('focusout', checkInteraction);
    const observer = new MutationObserver(checkInteraction);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state', 'aria-expanded'] });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', checkInteraction);
      document.removeEventListener('focusout', checkInteraction);
      observer.disconnect();
    };
  }, []);

  return engaged && !paused && !interacting ? <>{children}</> : null;
}
