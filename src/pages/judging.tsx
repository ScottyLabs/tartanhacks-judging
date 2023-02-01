import Button from "../components/Button";
import Header from "../components/Header";
import PrizeList from "../components/PrizeList";
import VotingList from "../components/VotingList";
import { api } from "../utils/api";

// TODO: need to selectively hide vote cards if a project was not submitted for that prize

export default function JudgingPage() {
  // whether this is the first project being judged
  const { isLoading, data: judge } = api.judging.getCurrent.useQuery();

  const prizeAssignments = judge?.prizeAssignments ?? [];

  // If no leading project for all prize assignments, then this is the first project being viewed
  const isFirstProject = prizeAssignments.reduce(
    (acc, assignment) => acc && assignment.leadingProjectId != null,
    true
  );

  const project = judge?.nextProject;
  const prizes = prizeAssignments.map((assignment) => assignment.prize);

  console.log("Project", project);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div
              className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4"
              role="status"
            ></div>
          </div>
        ) : (
          <>
            {project ? (
              <div className="flex max-w-xl flex-col items-center gap-10 px-6">
                <p className="w-full text-2xl font-bold sm:text-center">
                  Current Project
                </p>

                {/* Project info */}
                <div className="grow rounded-md border-4 border-blue p-8 shadow-md">
                  <div className="flex grow flex-row items-center justify-start pb-4">
                    <p className="pr-10 text-xl font-bold">Project:</p>
                    <p className="text-xl font-bold text-yellow">
                      {project.name}
                    </p>
                  </div>
                  <div className="flex grow flex-row items-center justify-start pb-5">
                    <p className="pr-10 text-xl font-bold">Team:</p>
                    <p className="text-xl font-bold text-yellow">
                      {project.team}
                    </p>
                  </div>
                  <div className="flex grow flex-row items-center justify-start pb-4">
                    <p className="pr-10 text-xl font-bold">Location:</p>
                    <p className="text-xl font-bold text-yellow">
                      {project.location}
                    </p>
                  </div>
                  <div className="overflow-hidden">
                    <p className="pr-10 text-xl font-bold">Description:</p>
                    <div>
                      <p className="text-md break-normal">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
                {isFirstProject ? (
                  <>
                    <Button text="Get Next Project" className="px-20" />

                    {/* Prizes */}
                    <p className="mt-5">You are judging the following prizes</p>
                    <PrizeList prizes={prizes} />
                  </>
                ) : (
                  <VotingList
                    prizeAssignments={prizeAssignments}
                    project={project}
                  />
                )}
              </div>
            ) : (
              <div className="flex max-w-xl flex-col items-center gap-10 px-6">
                <p className="w-full text-2xl font-bold sm:text-center">
                  No project assigned
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
