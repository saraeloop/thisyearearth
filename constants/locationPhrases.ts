import type { Location } from "@/types";

export const LOCATION_PHRASES = {
  "North America": [
    "I scraped this continent flat with ice sheets 2 kilometers thick. That was 12,000 years ago. Recent.",
    "The Mississippi has been moving my sediment for 30 million years.",
    "I built Yellowstone over a hotspot that has erupted three times. It is overdue.",
    "These Great Plains were a shallow sea 75 million years ago.",
  ],
  "South America": [
    "The Amazon has been exhaling oxygen here for 55 million years. It is exhaling less now.",
    "I raised the Andes by colliding two of my plates. That argument is still ongoing.",
    "The Atacama has not had rain in 500 years in places. That was also me.",
  ],
  Europe: [
    "Ancient ground. I remember when the ice covered all of it. 20,000 years ago.",
    "The Alps are 750 million years old. The EU is 30.",
    "I drowned most of this in the North Sea 8,000 years ago. Doggerland is still down there.",
    "The Mediterranean nearly dried up completely 5 million years ago. I refilled it in 1,000 years.",
  ],
  Africa: [
    "This is where the first of you stood up and looked around. 300,000 years ago.",
    "The Sahara was green 10,000 years ago. Rivers. Lakes. Hippos.",
    "I am pulling this continent apart at the East African Rift. It will be an ocean in 10 million years.",
    "The Congo Basin has been storing carbon for 10,000 years. Still is.",
  ],
  "Middle East": [
    "I used to be a shallow sea here called Tethys. You found what lived in it.",
    "The Fertile Crescent fed the first cities. I made the soil. You made the cities.",
    "The Dead Sea is dropping one meter every year. That is new.",
  ],
  "South Asia": [
    "India crashed into me 50 million years ago and made the Himalayas. Still rising.",
    "The monsoon has been keeping this ground alive for 23 million years.",
    "The Ganges has been carrying my sediment to the sea for 40 million years.",
  ],
  "East Asia": [
    "I have been shaking this ground along the Pacific Ring of Fire for 250 million years.",
    "The Gobi was a shallow sea. Then a jungle. Then a desert. I change my mind.",
    "The Yellow River has flooded 1,593 times in recorded history. I keep count.",
  ],
  "Southeast Asia": [
    "These islands are the tops of volcanoes I built from the ocean floor.",
    "I submerged the Sundaland shelf 10,000 years ago. There are rivers down there still.",
    "The coral here is 500 years old. It is bleaching for the third time this decade.",
  ],
  Oceania: [
    "I broke Australia off from Antarctica 180 million years ago. It has been drifting north since.",
    "The Great Barrier Reef took 500,000 years to build. It has lost 50% of its coral since 1995.",
    "New Zealand sits on two of my plates. I am still deciding what to do with it.",
  ],
  "Central Asia": [
    "The Aral Sea was the fourth largest lake on Earth. Was.",
    "The Silk Road crossed my oldest mountain ranges. The mountains are indifferent.",
  ],
  "Russia / Siberia": [
    "The permafrost here has been frozen for 650,000 years. It is thawing now.",
    "Lake Baikal holds 20% of all the liquid fresh water on my surface.",
    "I stored the methane in the permafrost for 10,000 years. It is coming out now.",
  ],
  Arctic: [
    "The Arctic Ocean was a freshwater lake 65 million years ago. I have been many things.",
    "The sea ice here has existed for 3 million years. The summer ice may be gone by 2035.",
  ],
  Antarctica: [
    "Nobody lives here. That was intentional.",
    "I have been storing 70% of your fresh water here for 34 million years.",
    "The West Antarctic Ice Sheet contains enough water to raise sea levels 3.3 meters.",
  ],
  "Small islands / coastal": [
    "This ground is 2 meters above sea level. That margin is shrinking.",
    "I made these islands from coral and volcanic ash. The coral is bleaching.",
  ],
} as const;

type LocationPhraseRegion = keyof typeof LOCATION_PHRASES;

const COUNTRY_REGION_MAP: Record<string, LocationPhraseRegion> = {
  AQ: "Antarctica",
  AR: "South America",
  AU: "Oceania",
  BD: "South Asia",
  BR: "South America",
  CA: "North America",
  CN: "East Asia",
  CO: "South America",
  DE: "Europe",
  DZ: "Africa",
  EG: "Middle East",
  ES: "Europe",
  ET: "Africa",
  FR: "Europe",
  GB: "Europe",
  GL: "Arctic",
  ID: "Southeast Asia",
  IN: "South Asia",
  IR: "Middle East",
  IQ: "Middle East",
  JP: "East Asia",
  KE: "Africa",
  KR: "East Asia",
  KZ: "Central Asia",
  MX: "North America",
  NG: "Africa",
  NP: "South Asia",
  NZ: "Oceania",
  PE: "South America",
  PH: "Southeast Asia",
  PK: "South Asia",
  RU: "Russia / Siberia",
  SA: "Middle East",
  SG: "Southeast Asia",
  TH: "Southeast Asia",
  TR: "Middle East",
  TW: "East Asia",
  US: "North America",
  VN: "Southeast Asia",
  XN: "North America",
  XS: "South America",
  XE: "Europe",
  XF: "Africa",
  XA: "East Asia",
  XO: "Oceania",
};

const SMALL_ISLAND_COUNTRY_CODES = new Set([
  "AG",
  "BS",
  "BB",
  "CV",
  "FJ",
  "GD",
  "JM",
  "KI",
  "MV",
  "MH",
  "MU",
  "NR",
  "PW",
  "WS",
  "SC",
  "SB",
  "LC",
  "VC",
  "TO",
  "TV",
  "VU",
]);

function hashLocation(location: Location) {
  const seed = `${location.countryCode}:${location.city}:${location.lat.toFixed(2)}:${location.lon.toFixed(2)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function resolvePhraseRegion(location: Location): LocationPhraseRegion {
  const code = location.countryCode.toUpperCase();
  if (SMALL_ISLAND_COUNTRY_CODES.has(code)) return "Small islands / coastal";
  if (COUNTRY_REGION_MAP[code]) return COUNTRY_REGION_MAP[code];
  if (location.country in LOCATION_PHRASES) return location.country as LocationPhraseRegion;
  if (location.region in LOCATION_PHRASES) return location.region as LocationPhraseRegion;
  return "Small islands / coastal";
}

export function getLocationPhrase(location: Location) {
  const region = resolvePhraseRegion(location);
  const phrases = LOCATION_PHRASES[region];
  return phrases[hashLocation(location) % phrases.length];
}

export function getLocationPhraseParagraphs(location: Location) {
  const phrase = getLocationPhrase(location);
  if (phrase.length <= 78) return [phrase];

  const sentences = phrase.match(/[^.!?]+[.!?]+/g)?.map((sentence) => sentence.trim());
  if (!sentences || sentences.length < 2) return [phrase];

  let splitAfter = 1;
  let bestBalance = Number.POSITIVE_INFINITY;

  for (let i = 1; i < sentences.length; i += 1) {
    const left = sentences.slice(0, i).join(" ");
    const right = sentences.slice(i).join(" ");
    const balance = Math.abs(left.length - right.length);
    if (balance < bestBalance) {
      splitAfter = i;
      bestBalance = balance;
    }
  }

  return [
    sentences.slice(0, splitAfter).join(" "),
    sentences.slice(splitAfter).join(" "),
  ];
}
