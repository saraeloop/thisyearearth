"use client";

import { useState } from "react";
import type { Tweaks } from "@/types";
import { Story } from "@/components/Story";

const DEFAULTS: Tweaks = {
  grain: 1.0,
  voice: "default",
  autoAdvance: false,
};

export default function Page() {
  const [tweaks] = useState<Tweaks>(DEFAULTS);
  return <Story tweaks={tweaks} />;
}
