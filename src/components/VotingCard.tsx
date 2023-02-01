import type { Prize, Project } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import type { ReactElement } from "react";
import { getSponsorLogoUrl, type Sponsor } from "../utils/sponsors";

export interface VotingCardProps {
  className?: string;
  prize: Prize;
  votes: Votes[];
  updateVotes: (index: number, newVote: Votes) => void;
  index: number;
  project: Project;
  prevProject: Project;
}

enum Votes {
  None,
  // vote for this project
  This,
  // vote for compared project
  Other,
}

/**
 * A voting card used in judging
 */
export default function VotingCard({
  className,
  prize,
  votes,
  updateVotes,
  index,
  project,
  prevProject,
}: VotingCardProps): ReactElement {
  const sponsorLogo = getSponsorLogoUrl(prize.provider as Sponsor);

  return (
    <div
      className={clsx(
        className,
        "w-12/12 rounded-2xl bg-white py-3 px-5 drop-shadow"
      )}
    >
      <div className="flex flex-row items-center justify-center gap-3">
        <Image src={sponsorLogo} height={32} width={32} alt={sponsorLogo} />
        <p>{prize.name}</p>
      </div>
      {prize.description && (
        <details className="pt-2">
          <summary className="text-md">Description</summary>
          <div className="pt-2">
            <p className="break-normal">{prize.description}</p>
          </div>
        </details>
      )}
      <div className="mt-3 flex flex-col gap-3">
        <label className="flex flex-row gap-2">
          <input
            type="radio"
            value={Votes.This}
            name={`prize${index}`}
            onChange={() => {
              updateVotes(index, Votes.This);
            }}
            checked={votes[index] === Votes.This}
            className="text-blue-600 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
          />
          <p
            className={`select-none text-xl font-bold ${
              votes[index] === Votes.This ? "text-voted" : "text-inactive"
            }`}
          >
            {project.name}
          </p>
        </label>
        <label className="flex flex-row gap-2">
          <input
            type="radio"
            value={Votes.Other}
            name={`prize${index}`}
            onChange={() => {
              updateVotes(index, Votes.Other);
            }}
            checked={votes[index] === Votes.Other}
            className="text-blue-600 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
          />

          <p
            className={`select-none text-xl font-bold ${
              votes[index] === Votes.Other ? "text-voted" : "text-inactive"
            }`}
          >
            {prevProject.name}
          </p>
        </label>
        <button
          className="w-fit text-lg underline"
          onClick={() => {
            updateVotes(index, Votes.None);
          }}
        >
          Clear
        </button>
        <details className="pt-2 text-center">
          <summary className="text-md">{prevProject.name} description</summary>
          <div className="pt-2 text-left">
            <p className="break-normal">{prevProject.description}</p>
          </div>
        </details>
      </div>
    </div>
  );
}
