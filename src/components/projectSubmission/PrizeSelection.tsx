import { api } from "../../utils/api";
import Spinner from "../Spinner";
import PrizeSubmitCard from "./PrizeSubmitCard";

export default function ProjectDetailsForm() {
  const {
    isFetching,
    data: prizes,
    refetch,
  } = api.projects.getPrizesWithSubmissionStatus.useQuery();

  const { isFetching: isFetchingProject, data: project } =
    api.projects.getUserProject.useQuery();

  return isFetching || isFetchingProject ? (
    <Spinner />
  ) : (
    <div className="flex w-full flex-wrap items-center">
      {project ? (
        prizes?.map((prize) => (
          <PrizeSubmitCard
            key={prize.id}
            projectId={project.id}
            prizeName={prize.name}
            prizeDescription={prize.description}
          />
        ))
      ) : (
        <div
          className="w-full rounded-lg bg-red-100 py-2 text-center text-base text-red-700"
          role="alert"
        >
          You need to save your project details before submitting for prizes!
        </div>
      )}
    </div>
  );
}
