import type { NextPage } from "next";

const SubmitProject: NextPage = () => {
  const [teamName, setTeamName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [otherResources, setOtherResources] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  return <></>;
};

export default SubmitProject;
