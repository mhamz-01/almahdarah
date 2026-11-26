"use client";

import { useEffect } from "react";

/**
 * Dialogs render in a portal on <body>, outside the page's [data-ds="v2"] wrapper. Marking the
 * body too keeps the v2 colours and fonts inside modals (quote reader, join-community, …).
 */
export function DsBody({ fonts, portal }: { fonts: string; portal?: string }) {
  useEffect(() => {
    const body = document.body;
    const classes = fonts.split(" ").filter(Boolean);
    body.setAttribute("data-ds", "v2");
    if (portal) body.setAttribute("data-portal", portal);
    body.classList.add(...classes);
    return () => {
      body.removeAttribute("data-ds");
      if (portal) body.removeAttribute("data-portal");
      body.classList.remove(...classes);
    };
  }, [fonts, portal]);

  return null;
}
