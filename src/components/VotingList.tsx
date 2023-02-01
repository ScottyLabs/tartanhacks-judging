import type { Prize, Project } from "@prisma/client";
import { useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import VotingCard from "./VotingCard";

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
  const numPrizes = prizes.length;

  const startVotes: Votes[] = new Array(numPrizes).fill(Votes.None) as Votes[];
  const [votes, setVotes] = useState(startVotes);
  const [numVotes, setNumVotes] = useState(0);
  const [showModal, setShowModal] = useState(false);

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
          if (numVotes === 0) {
            // show skip modal
            setShowModal(true);
          }
        }}
      />
      {/** Show skip modal */}
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title="Are you sure you want to skip?"
      >
        <div>
          {/*body*/}
          <div className="relative flex-auto p-6">
            <p className="my-4 text-lg leading-relaxed text-slate-500">
              You should skip the project only if the team is not present at the
              designated location.
            </p>
          </div>

          {/*footer*/}
          <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6">
            <button
              className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
              type="button"
              onClick={() => setShowModal(false)}
            >
              No, don&apos;t skip
            </button>
            <button
              className="mr-1 mb-1 rounded bg-emerald-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-emerald-600"
              type="button"
              onClick={() => {
                setShowModal(false);
                // TODO go to next project
              }}
            >
              Yes, I am sure
            </button>
          </div>
        </div>
      </Modal>
      <p className="mt-5 text-center text-xl font-bold">
        Which project is better?
      </p>
      <div className="flex flex-col gap-5">
        {prizes.map((prize, i) => {
          return (
            <VotingCard
              prize={prize}
              votes={votes}
              updateVotes={updateVotes}
              index={i}
              project={project}
              prevProject={compareProjects[i] as Project}
              key={prize.name}
            />
          );
        })}
      </div>
    </>
  );
}
