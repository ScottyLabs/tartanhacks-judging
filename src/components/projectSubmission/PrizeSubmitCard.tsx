import type { ReactElement } from "react";
import Button from "../Button";
import { api } from "../../utils/api";

interface Props {
  prizeName: string;
  prizeDescription: string;
  projectId: string;
}

/**
 * A prize card displayed on the landing page
 */
export default function PrizeCard({
  prizeName,
  projectId,
  prizeDescription,
}: Props): ReactElement {
  return (
    <div className="w-1/2 p-2">
      <div className="rounded-2xl bg-white py-3 px-5 text-black drop-shadow">
        <div className="xl mb-2 flex flex-row gap-3 text-xl font-bold">
          <h1>{prizeName}</h1>
        </div>
        <p className="mb-2 break-normal">{prizeDescription}</p>
        <Button
          text="Submit for Prize"
          className="m-0 w-full bg-green-300 text-gray-600 drop-shadow-none"
        />
      </div>
    </div>
  );
}
