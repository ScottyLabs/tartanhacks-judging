export function getSponsorLogo(sponsor: string | null) {
  switch (sponsor) {
    case 'algorand':
      return "/sponsors/algorand.png";
    default:
      return "/sponsors/scottylabs.svg"
  }
}