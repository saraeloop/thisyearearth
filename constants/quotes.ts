import type { CardId, VoiceTone } from "@/types";

type QuoteSet = Record<VoiceTone, string>;

export const VOICE_QUOTES: Partial<Record<CardId, QuoteSet>> = {
  temp: {
    hopeful: "A tenth of a degree. Small to you. Not to me.",
    default: "A tenth of a degree is never small.",
    darker: "I'm running a fever. I don't usually.",
  },
  co2: {
    hopeful: "I've been keeping count. You can help me count down.",
    default: "I've been keeping count since before you had numbers.",
    darker: "I've been keeping count. The count keeps climbing.",
  },
  ice: {
    hopeful: "I used to hold so much more. I can again, if you let me.",
    default: "I used to hold so much more.",
    darker: "I used to hold so much more. It's running now. Into you.",
  },
  forest: {
    hopeful: "They grew back before. With time. With help, maybe sooner.",
    default: "They were here before your grandparents' grandparents.",
    darker:
      "They were here before your grandparents' grandparents. Now they are smoke.",
  },
  species: {
    hopeful: "I knew each one. I'm hoping I won't have to unknow them.",
    default: "I knew each one. Now I'm learning to unknow them.",
    darker: "I knew each one. I'm learning to unknow them.",
  },
  plastic: {
    hopeful: "It outlives us all. But you invented it. You can uninvent some of it.",
    default: "It outlives us all. Even me, for a little while.",
    darker: "It outlives us all. Your bones will be gone. Your straws will be here.",
  },
  renewables: {
    hopeful: "You're trying. I see it. Keep going.",
    default: "You're trying. I see it. Keep going.",
    darker: "You're trying. It's not enough yet. But I see it.",
  },
  final: {
    hopeful: "Another year recorded. See you next year.\nMake it count with me.",
    default: "Another year recorded. See you next year.\nMake it count.",
    darker: "Another year recorded.\nThere may not be endless others.",
  },
};
