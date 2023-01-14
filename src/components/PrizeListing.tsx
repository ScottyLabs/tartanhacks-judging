import clsx from "clsx";
import Image from "next/image";
import type { ReactElement } from "react";

export interface PrizeListingProps {
  className?: string;
  prizeName: string;
  sponsorLogo: string;
}

/**
 * A prize listing displayed on the landing page
 */
export default function PrizeListing({
  className,
  prizeName,
  sponsorLogo,
}: PrizeListingProps): ReactElement {
  return (
    <div
      className={clsx(
        className,
        "w-12/12 flex flex-row items-center gap-3 rounded-2xl bg-white py-3 px-5 drop-shadow"
      )}
    >
      <Image src={sponsorLogo} height={32} width={32} alt="Company logo" />
      <p>{prizeName}</p>
    </div>
  );
}
