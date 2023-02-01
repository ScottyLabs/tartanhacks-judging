import type { JudgePrizeAssignment, Prize, Project } from "@prisma/client";
import { useState } from "react";
import { api } from "../utils/api";
import Button from "./Button";
import Modal from "./Modal";
import VotingCard from "./VotingCard";

type PopulatedJudgePrizeAssignment = JudgePrizeAssignment & {
  prize: Prize;
  leadingProject: Project | null;
};

interface VotingListProps {
  prizeAssignments: PopulatedJudgePrizeAssignment[];
  project: Project;
  isFetching: boolean;
  onVoteFinish: () => void;
}

export enum Vote {
  NONE = "NONE",
  // vote for this project
  THIS = "THIS",
  // vote for compared project
  OTHER = "OTHER",
}

// list multiple prizes with voting options
export default function VotingList({
  prizeAssignments,
  project,
  isFetching: isDataFetching,
  onVoteFinish,
}: VotingListProps) {
  const numPrizes = prizeAssignments.length;
  const startVotes: Vote[] = new Array(numPrizes).fill(Vote.NONE) as Vote[];
  const [votes, setVotes] = useState(startVotes);
  const [numVotes, setNumVotes] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const { mutate: compareMany, isLoading: isMutationLoading } =
    api.judging.compareMany.useMutation({
      onSuccess: () => {
        onVoteFinish();
        setNumVotes(0);
        setVotes(startVotes);
      },
    });

  const isFetching = isDataFetching || isMutationLoading;

  const updateVotes = (i: number, newVote: Vote) => {
    const curVote = votes[i];
    if (curVote === Vote.NONE && newVote !== Vote.NONE) {
      setNumVotes(numVotes + 1);
    } else if (newVote === Vote.NONE && curVote !== Vote.NONE) {
      setNumVotes(numVotes - 1);
    }
    setVotes(
      votes.map((vote, j) => {
        return j === i ? newVote : vote;
      })
    );
  };

  /**
   * Submit the currently selected votes
   */
  function submitVotes() {
    // Stage inputs to compare
    const compareInputs = [];
    for (const [i, vote] of votes.entries()) {
      const assignment = prizeAssignments[i];
      if (assignment == null) {
        console.error("More votes than prize assignments!");
        return;
      }

      if (assignment.leadingProjectId == null) {
        console.error("Cannot vote without a previous best!");
        return;
      }

      const winnerId =
        vote == Vote.THIS ? project.id : assignment.leadingProjectId;
      const loserId =
        vote == Vote.THIS ? assignment.leadingProjectId : project.id;
      compareInputs.push({ prizeId: assignment?.prizeId, winnerId, loserId });
    }

    compareMany(compareInputs);
  }

  async function skipProject() {
    // TODO: call skip trpc endpoint once it's implemented
  }

  return (
    <>
      {/** Submit or skip button: skips if voted for no prizes, submits if for all prizes */}
      {numVotes > 0 ? (
        <Button
          text={"Submit votes"}
          className="h-14 w-60 text-xl disabled:bg-slate-400"
          disabled={numVotes < numPrizes || isFetching}
          onClick={() => {
            submitVotes();
          }}
        />
      ) : (
        <Button
          text={"Skip"}
          className="h-14 w-60 text-xl disabled:bg-slate-400"
          disabled={isFetching}
          onClick={() => {
            if (numVotes === 0) {
              // show skip modal
              setShowModal(true);
            }
          }}
        />
      )}
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
                void skipProject();
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
        {prizeAssignments.map((prizeAssignment, i) => {
          return (
            <VotingCard
              prize={prizeAssignment.prize}
              votes={votes}
              updateVotes={updateVotes}
              index={i}
              project={project}
              prevProject={prizeAssignment.leadingProject}
              key={i}
            />
          );
        })}
      </div>
    </>
  );
}
