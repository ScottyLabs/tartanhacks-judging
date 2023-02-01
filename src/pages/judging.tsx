import type { Prize, Project } from "@prisma/client";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import CloseButton from "../components/CloseButton";
import Header from "../components/Header";
import PrizeList from "../components/PrizeList";
import VotingList from "../components/VotingList";

// TODO: need to selectively disable vote cards if a project was not submitted for that prize

export default function JudgingPage() {
  // whether this is the first project being judged
  const [isFirstProject, setIsFirstProject] = useState(true);
  // current project
  const [project, setProject] = useState<Project | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  // projects to compare with
  const [compareProjects, setCompareProjects] = useState<Project[]>([]);

  useEffect(() => {
    // TODO replace placeholders
    setIsFirstProject(false);

    setProject({
      id: "1",
      helixId: "1",
      name: "My Project",
      location: "Table 69",
      team: "My team",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
    });

    setPrizes([
      {
        id: "1",
        helixId: "1",
        eligibility: null,
        provider: "ScottyLabs",
        name: "Scott Krulcik Grand Prize",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
      {
        id: "2",
        helixId: "2",
        eligibility: null,
        provider: "ScottyLabs",
        name: "First Penguin Award",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
      {
        id: "3",
        helixId: "3",
        eligibility: null,
        provider: "Algorand",
        name: "Best Use of Algorand",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
    ]);

    setCompareProjects([
      {
        id: "2",
        helixId: "2",
        name: "Other project 1",
        location: "Table 420",
        team: "Other team 1",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
      {
        id: "3",
        helixId: "3",
        name: "Very long name project with a very long name.",
        location: "Table 42069",
        team: "Other team 2",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
      {
        id: "4",
        helixId: "4",
        name: "Other project 3",
        location: "Table 69420",
        team: "Other team 3",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
      },
    ]);
  }, []);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <CloseButton />
        {project && (
          <div className="flex max-w-xl flex-col items-center gap-10 px-6">
            <p className="w-full text-2xl font-bold sm:text-center">
              Current Project
            </p>

            {/* Project info */}
            <div className="grow rounded-md border-4 border-blue p-8 shadow-md">
              <div className="flex grow flex-row items-center justify-start pb-4">
                <p className="pr-10 text-xl font-bold">Project:</p>
                <p className="text-xl font-bold text-yellow">{project.name}</p>
              </div>
              <div className="flex grow flex-row items-center justify-start pb-5">
                <p className="pr-10 text-xl font-bold">Team:</p>
                <p className="text-xl font-bold text-yellow">{project.team}</p>
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
                  <p className="text-md break-normal">{project.description}</p>
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
                prizes={prizes}
                project={project}
                compareProjects={compareProjects}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
