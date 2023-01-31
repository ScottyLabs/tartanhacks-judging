export type Sponsor = "algorand" | "scottylabs";

const sponsorLogoMapping = {
  algorand: "/sponsors/algorand.png",
  scottylabs: "/sponsors/scottylabs.svg",
} as const;

export function getSponsorLogoUrl(sponsor: Sponsor): string {
  return sponsorLogoMapping[sponsor];
}
