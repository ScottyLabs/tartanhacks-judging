const sponsorLogoMapping = {
  "Algorand Foundation": "/sponsors/algorand.png",
  ScottyLabs: "/sponsors/scottylabs.svg",
  "Sandia National Laboratories": "/sponsors/sandia.png",
  "Design for America": "/sponsors/dfa.png",
  "Google Cloud": "/sponsors/gcp.png",
  "Wolfram Language": "/sponsors/wolfram.png",
} as const;

export type Sponsor = keyof typeof sponsorLogoMapping;

export function getSponsorLogoUrl(sponsor: Sponsor): string {
  return (
    sponsorLogoMapping[sponsor ?? "ScottyLabs"] ??
    sponsorLogoMapping["ScottyLabs"]
  );
}
