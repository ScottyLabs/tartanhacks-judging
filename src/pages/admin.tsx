import { useState } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import AdminSettings from "../components/AdminSettings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../@/components/ui/tabs";
import AdminForm from "../components/AdminForm";

export default function Admin() {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <Tabs defaultValue="settings" className="w-96">
          <TabsList className="pb-8">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="settings">
            <AdminForm />
          </TabsContent>
          <TabsContent value="users"></TabsContent>
        </Tabs>
      </main>
    </>
  );
}
