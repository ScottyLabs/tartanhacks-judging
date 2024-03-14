import Header from "../components/Header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../@/components/ui/tabs";
import AdminForm from "../components/AdminForm";
import UserTable from "../components/UserTable";
import { useState } from "react";

export default function Admin() {
  const tabs = ["settings", "users"] as const;
  const [selectedTab, setSelectedTab] =
    useState<(typeof tabs)[number]>("settings");

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Tabs defaultValue="settings" className="w-96">
          <TabsList className="flex flex-row gap-8 pb-8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={`m-0 rounded-md ${
                  selectedTab === tab ? "bg-purple text-white" : ""
                }`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="settings">
            <AdminForm />
          </TabsContent>
          <TabsContent value="users">
            <UserTable />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
