import Link from "next/link";
import { useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import Modal from "../components/Modal";
import PrizeList from "../components/PrizeList";
import ProjectCard from "../components/ProjectCard";
import Spinner from "../components/Spinner";
import VotingList from "../components/VotingList";
import { api } from "../utils/api";

export default function JudgingPage() {
  const {
    isLoading,
    isFetching: isFetchingQuery,
    data: judge,
    refetch,
  } = api.judging.getCurrent.useQuery();
  const { mutate: computeNext, isLoading: isNextLoading } =
    api.judging.computeNext.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const {mutate: skipProject, isLoading: isSkipLoading} = api.judging.skipProject.useMutation({
    onSuccess: async () => {
      await refetch()
    }
  })

  const isFetching = isFetchingQuery || isNextLoading || isSkipLoading;
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

  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {project ? (
              <div className="flex max-w-xl flex-col items-center gap-10">
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
                        setShowModal(true);
                      }}
                      disabled={isFetching}
                    />

                    {/* Prizes */}
                    <p className="mt-5">
                      This project was submitted for the following prizes
                    </p>
                    <PrizeList prizes={relevantPrizes} />
                    {/** Modal to potentially skip the project */}
                    <Modal
                      showModal={showModal}
                      setShowModal={setShowModal}
                      title="Were you able to take a look at the project?"
                    >
                      <div>
                        {/*body*/}
                        <div className="relative flex-auto p-6">
                          <p className="my-4 text-lg leading-relaxed text-slate-500">
                            If you were unable to find the team at the designated location, you should skip this project.
                          </p>
                        </div>

                        {/*footer*/}
                        <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6">
                          <button
                            className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              skipProject({ projectId: project.id })
                            }}
                          >
                            Skip
                          </button>
                          <button
                            className="mr-1 mb-1 rounded bg-emerald-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-emerald-600"
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              void computeNext();
                            }}
                          >
                            Yes, I have seen the project
                          </button>
                        </div>
                      </div>
                    </Modal>
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
              <div className="flex max-w-xl flex-col items-center gap-10">
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
