import clsx from "clsx";
import Link from "next/link";
import Button from "../components/Button";
import Header from "../components/Header";
import PrizeList from "../components/PrizeList";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";
import VotingList from "../components/VotingList";
import { api } from "../utils/api";

// TODO: need to selectively hide vote cards if a project was not submitted for that prize
export default function JudgingPage() {
  // whether this is the first project being judged
  const {
    isLoading,
    isFetching: isFetchingQuery,
    data: judge,
    refetch,
  } = api.judging.getCurrent.useQuery();
  const { mutate: computeNext, isLoading: isLoadingMutation } =
    api.judging.computeNext.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const isFetching = isFetchingQuery || isLoadingMutation;
  const prizeAssignments = judge?.prizeAssignments ?? [];

  // If no leading project for all prize assignments, then this is the first project being viewed
  const isFirstProject = prizeAssignments.reduce(
    (acc, assignment) => acc && assignment.leadingProjectId == null,
    true
  );

  const project = judge?.nextProject;
  const projectPrizes = new Set(
    project?.judgingInstances?.map((instance) => instance.prizeId) ?? []
  );
  const relevantPrizeAssignments = prizeAssignments.filter(
    (assignment) =>
      projectPrizes.has(assignment.prizeId) &&
      assignment.leadingProjectId != null
  );

  const relevantPrizes = prizeAssignments
    .filter((assignment) => projectPrizes.has(assignment.prizeId))
    .map((assignment) => assignment.prize);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {project ? (
              <div className="flex max-w-xl flex-col items-center gap-10 px-6">
                <p className="w-full text-2xl font-bold sm:text-center">
                  Current Project
                </p>

                {/* Project info */}
                <ProjectCard project={project} isFetching={isFetching} />
                {isFirstProject ? (
                  <>
                    <Button
                      text="Get Next Project"
                      className="px-20"
                      onClick={() => {
                        void computeNext();
                      }}
                      disabled={isFetching}
                    />

                    {/* Prizes */}
                    <p className="mt-5">
                      This project was submitted for the following prizes
                    </p>
                    <PrizeList prizes={relevantPrizes} />
                  </>
                ) : (
                  <VotingList
                    prizeAssignments={relevantPrizeAssignments}
                    project={project}
                    isFetching={isFetching}
                    onVoteFinish={() => {
                      void computeNext();
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex max-w-xl flex-col items-center gap-10 px-6">
                <p className="w-full text-2xl font-bold sm:text-center">
                  No projects left to judge!
                </p>
                <Link href="/">
                  <Button text="Main Menu" className="px-20" />
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
