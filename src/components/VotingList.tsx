import type { Prize, Project } from "@prisma/client";
import { useState } from "react";
import { getSponsorLogo } from "../utils/prizes";
import Button from "./Button";
import PrizeListing from "./PrizeListing";

interface Props {
  prizes: Prize[];
  project: Project;
  compareProjects: Project[];
}

enum Votes {
  None,
  // vote for this project
  This,
  // vote for compared project
  Other,
}

// list multiple prizes with voting options
export default function VotingList({
  prizes,
  project,
  compareProjects,
}: Props) {
  // Default project selection color
  const inactiveColor = "#000000";
  const votedColor = "#2e8540";

  const numPrizes = prizes.length;

  const startVotes: Votes[] = new Array(numPrizes).fill(Votes.None) as Votes[];
  const [votes, setVotes] = useState(startVotes);
  const [numVotes, setNumVotes] = useState(0);

  const updateVotes = (i: number, newVote: Votes) => {
    const curVote = votes[i];
    if (curVote === Votes.None && newVote !== Votes.None) {
      setNumVotes(numVotes + 1);
    } else if (newVote === Votes.None && curVote !== Votes.None) {
      setNumVotes(numVotes - 1);
    }
    setVotes(
      votes.map((vote, j) => {
        return j === i ? newVote : vote;
      })
    );
  };

  return (
    <>
      {/** Submit or skip button: skips if voted for no prizes, submits if for all prizes */}
      <Button
        text={numVotes > 0 ? "Submit votes" : "Skip"}
        className="h-14 w-60 text-xl disabled:bg-slate-400"
        disabled={numVotes > 0 && numVotes < numPrizes}
        onClick={() => {
          // TODO submit votes
        }}
      />
      <p className="mt-5 text-center text-xl font-bold">Which project is better?</p>
      <div className="flex flex-col gap-5">
        {prizes.map((prize, i) => {
          return (
            <PrizeListing
              sponsorLogo={getSponsorLogo(prize.provider)}
              prizeName={prize.name}
              key={i}
            >
              <div className="mt-3 flex flex-col gap-3">
                <label className="flex flex-row gap-2">
                  <input
                    type="radio"
                    value={Votes.This}
                    name={`prize${i}`}
                    onChange={() => {
                      updateVotes(i, Votes.This);
                    }}
                    checked={votes[i] === Votes.This}
                    className="text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <p
                    className="select-none text-xl font-bold"
                    style={{
                      color:
                        votes[i] === Votes.This ? votedColor : inactiveColor,
                    }}
                  >
                    {project.name}
                  </p>
                </label>
                <label className="flex flex-row gap-2">
                  <input
                    type="radio"
                    value={Votes.Other}
                    name={`prize${i}`}
                    onChange={() => {
                      updateVotes(i, Votes.Other);
                    }}
                    checked={votes[i] === Votes.Other}
                    className="text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />

                  <p
                    className="select-none text-xl font-bold"
                    style={{
                      color:
                        votes[i] === Votes.Other ? votedColor : inactiveColor,
                    }}
                  >
                    {compareProjects[i]?.name}
                  </p>
                </label>
                <button
                  className="text-lg underline w-fit"
                  onClick={() => {
                    updateVotes(i, Votes.None);
                  }}
                >
                  Clear
                </button>
                <details className="pt-2 text-center">
                  <summary className="text-md">
                    {compareProjects[i]?.name} description
                  </summary>
                  <div className="pt-2 text-left">
                    <p className="break-normal">
                      {compareProjects[i]?.description}
                    </p>
                  </div>
                </details>
              </div>
            </PrizeListing>
          );
        })}
      </div>
    </>
  );
}
