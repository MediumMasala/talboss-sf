"use client";

import { site } from "@/content/site";
import { Hands } from "../Hands";
import { useSelectProgress } from "./SelectProgress";

/** THE BOSS and YOU, reaching closer with every step of the application. */
export function SelectHands() {
  const { reach } = useSelectProgress();
  return <Hands reach={reach} tags={site.select.tags} />;
}
