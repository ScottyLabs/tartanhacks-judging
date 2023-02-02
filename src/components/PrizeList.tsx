import type { Prize } from "@prisma/client";
import { getSponsorLogoUrl, type Sponsor } from "../utils/sponsors";
import PrizeCard from "./PrizeCard";

interface Props {
  prizes: Prize[];
}

// list multiple prizes
export default function PrizeList({ prizes }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {prizes.map((prize) => {
        return (
          <PrizeCard
            sponsorLogo={getSponsorLogoUrl(prize.provider as Sponsor)}
            prizeName={prize.name}
            key={prize.name}
          />
        );
      })}
    </div>
  );
}
