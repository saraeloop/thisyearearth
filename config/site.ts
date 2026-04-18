import type { Metadata } from "next";

export const SITE = {
  name: "Earth Wrapped",
  edition: "MMXXVI",
  domain: "thisyear.earth",
  description:
    "A letter from the planet. Eleven cards. One year. Signed, Earth.",
} as const;

export const metadata: Metadata = {
  title: `${SITE.name} · ${SITE.edition}`,
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} · ${SITE.edition}`,
    description: SITE.description,
    type: "website",
  },
};
