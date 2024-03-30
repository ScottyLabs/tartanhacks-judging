import type { GetServerSidePropsContext, NextPage } from "next";
import Header from "../components/Header";
import { getSession } from "next-auth/react";
import ProjectDetailsForm from "../components/projectSubmission/ProjectDetailsForm";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../@/components/ui/tabs";
import { useState } from "react";
interface Props {
  email: string;
}

enum SelectedTab {
  PROJECT_DETAILS = "project-details",
  PRIZE_SELECTION = "prize-selection",
}
const SubmitProject: NextPage<Props> = ({ email }) => {
  const [selectedTab, setSelectedTab] = useState(SelectedTab.PROJECT_DETAILS);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <div className=" flex w-8/12 flex-col items-center justify-center gap-3">
          <Tabs defaultValue={SelectedTab.PROJECT_DETAILS} className="w-full">
            <TabsList className="mb-8 flex w-full flex-row bg-gray-200 p-1">
              <TabsTrigger
                key={SelectedTab.PROJECT_DETAILS}
                value={SelectedTab.PROJECT_DETAILS}
                className=`m-0 w-full rounded-md font-semibold ${selectedTab == SelectedTab.PROJECT_DETAILS ? "bg-white text-gray-800":"text-gray-500"}`
                onClick={() => setSelectedTab(SelectedTab.PROJECT_DETAILS)}
              >
                Project Details
              </TabsTrigger>
              <TabsTrigger
                key={SelectedTab.PROJECT_DETAILS}
                value={SelectedTab.PROJECT_DETAILS}
                className="bg-gray m-0 w-full  rounded-md  font-semibold text-gray-500"
                onClick={() => setSelectedTab(SelectedTab.PRIZE_SELECTION)}
              >
                Prize Selection
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value={selectedTab}
              className=" flex w-full flex-col items-center justify-center gap-3"
            >
              <ProjectDetailsForm email={email} />
            </TabsContent>
          </Tabs>
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
