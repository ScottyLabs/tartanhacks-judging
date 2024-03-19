import Header from "../../components/Header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../@/components/ui/tabs";
import AdminForm from "../../components/admin/AdminForm";
import UserTable from "../../components/UserTable";
import { useState } from "react";
import { api } from "../../utils/api";
import { AuthMode } from "@prisma/client";
import PrizeTab from "../../components/admin/PrizeTab";

export default function Admin() {
  // localModeOnly: true means the tab is only available in local mode
  const tabs = [
    { key: "settings", name: "Settings", localModeOnly: false },
    { key: "users", name: "Users", localModeOnly: true },
    { key: "prizes", name: "Prizes", localModeOnly: true },
  ] as const;

  const tabKeys = tabs.map((tab) => tab.key);

  const [selectedTab, setSelectedTab] =
    useState<(typeof tabKeys)[number]>("settings");

  const {
    data: settings,
  } = api.settings.getSettings.useQuery();

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Tabs defaultValue="settings">
          <TabsList className="flex flex-row gap-8 pb-8">
            {tabs
              .filter(
                (tab) =>
                  settings?.authMode === AuthMode.LOCAL || !tab.localModeOnly
              )
              .map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className={`m-0 rounded-md ${
                    selectedTab === tab.key ? "bg-purple text-white" : ""
                  }`}
                  onClick={() => setSelectedTab(tab.key)}
                >
                  {tab.name}
                </TabsTrigger>
              ))}
          </TabsList>
          <TabsContent value="settings">
            <AdminForm />
          </TabsContent>
          <TabsContent value="users">
            <UserTable />
          </TabsContent>
          <TabsContent value="prizes">
            <PrizeTab />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
