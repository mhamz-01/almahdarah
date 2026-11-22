"use client";

import { useEffect } from "react";

/**
 * Dialogs render in a portal on <body>, outside the page's [data-ds="v2"] wrapper. Marking the
 * body too keeps the v2 colours and fonts inside modals (quote reader, join-community, …).
 */
export function DsBody({ fonts }: { fonts: string }) {
  useEffect(() => {
    const body = document.body;
    const classes = fonts.split(" ").filter(Boolean);
    body.setAttribute("data-ds", "v2");
    body.classList.add(...classes);
    return () => {
      body.removeAttribute("data-ds");
      body.classList.remove(...classes);
    };
  }, [fonts]);

  return null;
}
