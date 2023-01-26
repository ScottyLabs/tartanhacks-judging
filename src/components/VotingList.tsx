import { Prize, Project } from "@prisma/client";
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
  const votedColor = "#87db69";

  const numPrizes = prizes.length;

  const startVotes: Votes[] = new Array(numPrizes).fill(Votes.None);
  const [votes, setVotes] = useState(startVotes);
  const [numVotes, setNumVotes] = useState(0);

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
      <p className="mt-5 text-center">Which project is better? Click project name to select.</p>
      <div className="flex flex-col content-center gap-5">
        {prizes.map((prize, i) => {
          return (
            <PrizeListing
              sponsorLogo={getSponsorLogo(prize.provider)}
              prizeName={prize.name}
              key={i}
            >
              <div>
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-xl font-bold select-none" style={{
                    color: votes[i] === Votes.This ? votedColor : inactiveColor
                  }} onClick={() => {
                    const curVote = votes[i]
                    if (curVote === Votes.None) {
                      setNumVotes(numVotes + 1);
                    } else if (curVote === Votes.This) {
                      setNumVotes(numVotes - 1);
                    }
                    setVotes(votes.map((vote, j) => {
                      // if already selected, reset, otherwise switch vote to this
                      return j === i ?
                      curVote === Votes.This ? Votes.None : Votes.This :
                      vote
                    }))
                  }}>
                    {project.name}
                  </p>
                  <p className="text-lg font-bold">vs</p>
                  <p className="text-xl font-bold select-none" style={{
                    color: votes[i] === Votes.Other ? votedColor : inactiveColor
                  }} onClick={() => {
                    const curVote = votes[i]
                    if (curVote === Votes.None) {
                      setNumVotes(numVotes + 1);
                    } else if (curVote === Votes.Other) {
                      setNumVotes(numVotes - 1);
                    }
                    setVotes(votes.map((vote, j) => {
                      // if already selected, reset, otherwise switch vote to other
                      return j === i ?
                      curVote === Votes.Other ? Votes.None : Votes.Other :
                      vote
                    }))
                  }}>
                    {compareProjects[i]?.name}
                  </p>
                  <details className="pt-2 text-center">
                    <summary className="text-md">Project description</summary>
                    <div className="pt-2 text-left">
                      <p className="break-normal">
                        {compareProjects[i]?.description}
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </PrizeListing>
          );
        })}
      </div>
    </>
  );
}
