import type { GetServerSidePropsContext, NextPage } from "next";
import Header from "../components/Header";
import { getSession } from "next-auth/react";
import ProjectDetailsForm from "../components/projectSubmission/ProjectDetailsForm";
interface Props {
  email: string;
}
const SubmitProject: NextPage<Props> = ({ email }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <div className=" flex w-8/12 flex-col items-center justify-center gap-3">
          <h2 className="m-2 text-2xl font-bold">Submit your project</h2>
          <ProjectDetailsForm email={email} />
        </div>
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
