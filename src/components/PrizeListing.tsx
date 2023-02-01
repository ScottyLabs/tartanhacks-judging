import clsx from "clsx";
import Image from "next/image";
import type { ReactElement } from "react";

export interface PrizeListingProps {
  className?: string;
  prizeName: string;
  sponsorLogo: string;
  prizeDescription?: string;
  children?: ReactElement;
}

/**
 * A prize listing displayed on the landing page
 */
export default function PrizeListing({
  className,
  prizeName,
  sponsorLogo,
  prizeDescription,
  children,
}: PrizeListingProps): ReactElement {
  return (
    <div
      className={clsx(
        className,
        "w-12/12 rounded-2xl bg-white py-3 px-5 drop-shadow"
      )}
    >
      <div className="flex flex-row items-center justify-center gap-3">
        <Image src={sponsorLogo} height={32} width={32} alt={sponsorLogo} />
        <p>{prizeName}</p>
      </div>
      {prizeDescription && (
        <details className="pt-2">
          <summary className="text-md">Description</summary>
          <div className="pt-2">
            <p className="break-normal">{prizeDescription}</p>
          </div>
        </details>
      )}
      {children}
    </div>
  );
}
