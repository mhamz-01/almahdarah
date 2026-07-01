"use client";

import { useEffect, useState } from "react";

/**
 * Signals when the first client-side render after hydration has committed.
 * Needed to defer theme-dependent UI (e.g. next-themes' resolvedTheme) until
 * after hydration, since the server always renders the pre-theme state.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time SSR/CSR bridge flag, not derived state
    setHasMounted(true);
  }, []);

  return hasMounted;
}
