import type { JudgePrizeAssignment, Project, User } from "@prisma/client";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import Button from "../Button";
import Spinner from "../Spinner";

interface Props {
  email: string;
}

export default function ProjectDetailsForm({ email }: Props) {
  const {
    isFetching,
    data: project,
    refetch,
  } = api.projects.getUserProject.useQuery();

  const [teamName, setTeamName] = useState(project?.teamName);
  const [projectName, setProjectName] = useState(project?.name);
  const [description, setDescription] = useState(project?.description);
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [otherResources, setOtherResources] = useState(project?.otherResources);
  const [teamMembers, setTeamMembers] = useState(
    project?.teamMembers.map((member) => member.email) ?? []
  );

  useEffect(() => {
    if (project) {
      setTeamName(project.teamName);
      setProjectName(project.name);
      setDescription(project.description);
      setGithubUrl(project.githubUrl ?? "");
      setOtherResources(project.otherResources);
      setTeamMembers(project.teamMembers.map((member) => member.email));
    } else {
      setTeamMembers([email]);
    }
  }, [project, email]);
  const { isLoading, mutate: saveProject } =
    api.projects.saveProject.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  return isFetching || isLoading ? (
    <Spinner />
  ) : (
    <>
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="teamName" className="font-bold">
          Team Name*
        </label>
        <input
          type="text"
          id="teamName"
          placeholder="Enter team name"
          value={teamName}
          required
          onChange={(e) => setTeamName(e.target.value)}
          className="border-grey w-full rounded-md border-2 p-2"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="teamMembers" className="font-bold">
          Team Member Emails*
        </label>
        <input
          type="text"
          id="teamMembers"
          placeholder="Enter team member emails (comma separated)"
          value={teamMembers.join(",")}
          required
          onChange={(e) => setTeamMembers(e.target.value.trim().split(","))}
          className="border-grey w-full rounded-md border-2 p-2"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="projectName" className="font-bold">
          Project Name*
        </label>
        <input
          type="text"
          id="projectName"
          placeholder="Enter project name"
          value={projectName}
          required
          onChange={(e) => setProjectName(e.target.value)}
          className="border-grey w-full rounded-md border-2 p-2"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="githubUrl" className="font-bold">
          GitHub Link
        </label>
        <input
          type="text"
          id="githubUrl"
          placeholder="Enter GitHub link"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          className="border-grey w-full rounded-md border-2 p-2"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="description" className="font-bold">
          Description*
        </label>
        <textarea
          id="description"
          placeholder="Enter project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-grey w-full rounded-md border-2 p-2"
        ></textarea>
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="otherResources" className="font-bold">
          Other Resources
        </label>
        <textarea
          id="otherResources"
          placeholder="Links to other resources associated with your project."
          value={otherResources as string}
          onChange={(e) => setOtherResources(e.target.value)}
          className="border-grey w-full rounded-md border-2 p-2"
        ></textarea>
      </div>
      <Button
        text="Save"
        className="m-4 w-full font-bold"
        onClick={() => {
          saveProject({
            name: projectName ?? "",
            githubUrl: githubUrl,
            teamName: teamName ?? "",
            description: description ?? "",
            otherResources: otherResources ?? "",
            teamMembers: teamMembers,
          });
        }}
      />
    </>
  );
}
