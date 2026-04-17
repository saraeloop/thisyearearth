import { CARD_IDS } from "@/constants/cards";
import type { VoiceTone } from "./tweaks";

export type CardId = (typeof CARD_IDS)[number];

export type CardData = {
  stat: string;
  label: string;
  quote: string;
};

export type CardCommonProps = {
  active: number;
  onNext: () => void;
  onShare: () => void;
  grainLevel: number;
  voiceTone: VoiceTone;
};
