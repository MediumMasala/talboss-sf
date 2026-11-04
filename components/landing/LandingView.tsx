"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export function LandingView() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    track("landing_view", { utm_source: p.get("utm_source"), utm_campaign: p.get("utm_campaign") });
  }, []);
  return null;
}
