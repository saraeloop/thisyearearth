export type VoiceTone = "hopeful" | "default" | "darker";

export type Tweaks = {
  grain: number;
  voice: VoiceTone;
  autoAdvance: boolean;
};
