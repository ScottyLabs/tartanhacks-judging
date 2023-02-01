const sponsorLogoMapping = {
  Algorand: "/sponsors/algorand.png",
  ScottyLabs: "/sponsors/scottylabs.svg",
} as const;

export type Sponsor = keyof typeof sponsorLogoMapping;

export function getSponsorLogoUrl(sponsor: Sponsor): string {
  return sponsorLogoMapping[sponsor ?? "ScottyLabs"];
}
