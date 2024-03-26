import { TabsTrigger } from "@radix-ui/react-tabs";

type AdminTabProps = {
  value: string;
  selectedTab: string;
  setSelectedTab: (value: string) => void;
};
export default function AdminTab({
  value,
  selectedTab,
  setSelectedTab,
}: AdminTabProps) {
  return (
    <TabsTrigger
      value={value}
      className={`m-0 rounded-md ${
        selectedTab === value ? "bg-purple text-white" : ""
      }`}
      onClick={() => setSelectedTab(value)}
    >
      {value}
    </TabsTrigger>
  );
}
