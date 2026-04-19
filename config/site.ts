import type { Metadata } from "next";

export const SITE = {
  name: "Earth Wrapped",
  edition: "MMXXVI",
  domain: "thisyear.earth",
  url: "https://thisyear.earth",
  author: "Sara Loera",
  description:
    "A letter from the planet. Eleven cards. One year. Signed, Earth.",
} as const;

const title = `${SITE.name} · ${SITE.edition}`;
const previewImage = {
  url: "/earthwrapped.png",
  width: 1536,
  height: 1024,
  alt: `${SITE.name} · ${SITE.edition}`,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title,
  description: SITE.description,
  authors: [{ name: SITE.author, url: SITE.url }],
  creator: SITE.author,
  publisher: SITE.author,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    images: [previewImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: SITE.description,
    creator: SITE.author,
    images: [previewImage],
  },
};
