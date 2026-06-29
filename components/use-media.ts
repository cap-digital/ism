"use client";

import { useEffect, useState } from "react";

/** Returns true when the viewport is below the given breakpoint (px). */
export function useIsMobile(breakpoint = 640): boolean {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return mobile;
}
