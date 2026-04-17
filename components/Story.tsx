"use client";

import { DesktopStory } from "./DesktopStory";
import { MobileStory } from "./MobileStory";
import type { Tweaks } from "@/types";
import { useMediaMin } from "@/hooks/useBreakpoint";

type StoryProps = { tweaks: Tweaks };

export function Story({ tweaks }: StoryProps) {
  const isDesktop = useMediaMin(1024);
  return isDesktop ? <DesktopStory tweaks={tweaks} /> : <MobileStory tweaks={tweaks} />;
}
