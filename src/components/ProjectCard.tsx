import type { Project } from "@prisma/client";
import clsx from "clsx";

interface Props {
  project: Project;
  isFetching: boolean;
}

export default function ProjectCard({
  project,
  isFetching,
}: Props): JSX.Element {
  return (
    <div
      className={clsx(
        "grow rounded-md border-4 border-blue p-8 shadow-md",
        isFetching ? "animate-pulse" : null
      )}
    >
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
        <p className="text-xl font-bold text-yellow">{project.location}</p>
      </div>
      <div className="overflow-hidden">
        <p className="pr-10 text-xl font-bold">Description:</p>
        <div>
          <p className="text-md break-normal">{project.description}</p>
        </div>
      </div>
    </div>
  );
}
