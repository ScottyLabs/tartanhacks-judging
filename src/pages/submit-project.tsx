import type { GetServerSidePropsContext, NextPage } from "next";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import { getSession } from "next-auth/react";
interface Props {
  email: string;
}
const SubmitProject: NextPage<Props> = ({ email }) => {
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
  const [prizes, setPrizes] = useState(project?.prizes);

  const { isLoading, mutate: saveProject } =
    api.projects.saveProject.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  useEffect(() => {
    if (project) {
      setTeamName(project.teamName);
      setProjectName(project.name);
      setDescription(project.description);
      setGithubUrl(project.githubUrl ?? "");
      setOtherResources(project.otherResources);
      setTeamMembers(project.teamMembers.map((member) => member.email));
      setPrizes(project.prizes);
    } else {
      setTeamMembers([email]);
    }
  }, [project, email]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {isFetching || isLoading ? (
          <Spinner />
        ) : (
          <div className="flex w-96 flex-col items-center justify-center gap-3">
            <h2 className="m-2 text-2xl font-bold">Submit your project</h2>
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
                onChange={(e) =>
                  setTeamMembers(e.target.value.trim().split(","))
                }
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
              text="Save Project Details"
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
          </div>
        )}
      </main>
    </div>
  );
};
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const email = session?.user?.email as string;
  return {
    props: {
      email: email,
    },
  };
}

export default SubmitProject;
