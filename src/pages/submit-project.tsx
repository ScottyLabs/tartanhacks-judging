import type { NextPage } from "next";
import { api } from "../utils/api";
import { useState } from "react";
import Header from "../components/Header";
import type { Project } from "../";

const SubmitProject: NextPage = () => {
  const {
    isFetching,
    data: savedProject,
    refetch,
  } = api.projects.getUserProject.useQuery();

  const [teamName, setTeamName] = useState(savedProject?.teamName);
  const [projectName, setProjectName] = useState(savedProject?.name);
  const [description, setDescription] = useState(savedProject?.description);
  const [githubUrl, setGithubUrl] = useState(savedProject?.githubUrl);
  const [otherResources, setOtherResources] = useState(
    savedProject?.otherResources
  );
  const [teamMembers, setTeamMembers] = useState(savedProject?.teamMembers);

  const { isLoading, mutate: saveProject } =
    api.projects.saveProject.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <div className="w-12/12 flex flex-col items-center justify-center gap-3">
          <h2 className="text-2xl font-bold">Submit your project</h2>
          <input
            type="text"
            placeholder="Search by email or role"
            value={project?.teamName}
            onChange={(e) =>
              setProject({ ...project, teamName: e.target.value })
            }
            className="rounded-md border-2 border-purple p-2"
          />
        </div>
      </main>
    </div>
  );
};

export default SubmitProject;
