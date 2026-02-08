"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot(breakpoint: number) {
  return () => window.innerWidth < breakpoint;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile(breakpoint = 1280): boolean {
  return useSyncExternalStore(subscribe, getSnapshot(breakpoint), getServerSnapshot);
}
