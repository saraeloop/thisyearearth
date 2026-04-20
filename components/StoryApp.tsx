"use client";

import { useState } from "react";
import type { Tweaks } from "@/types";
import { Story } from "@/components/Story";
import { DynamicWalletProvider } from "@/components/wallet/DynamicWalletProvider";

const DEFAULTS: Tweaks = {
  grain: 1.0,
  voice: "default",
  autoAdvance: false,
};

export function StoryApp() {
  const [tweaks] = useState<Tweaks>(DEFAULTS);

  return (
    <DynamicWalletProvider>
      <Story tweaks={tweaks} />
    </DynamicWalletProvider>
  );
}
