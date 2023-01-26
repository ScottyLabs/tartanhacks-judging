import { Prize } from "@prisma/client";
import { getSponsorLogo } from "../utils/prizes";
import PrizeListing from "./PrizeListing";

interface Props {
  prizes: Prize[];
}

// list multiple prizes
export default function PrizeList({ prizes }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {prizes.map((prize, i) => {
        return (
          <PrizeListing
            sponsorLogo={getSponsorLogo(prize.provider)}
            prizeName={prize.name}
            key={i}
          />
        );
      })}
    </div>
  );
}
