import { useEffect, useState } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import { api } from "../utils/api";

export default function Admin() {
  const {
    isFetching,
    data: settings,
    refetch,
  } = api.settings.getSettings.useQuery();

  const [error, setError] = useState<string | null>(null);

  const { isLoading, mutate: updateSettings } =
    api.settings.putSettings.useMutation({
      onSuccess: async () => {
        await refetch();
        setError(null);
      },
      onError: (error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setError(JSON.parse(error.message)[0].message as string);
      }
    });
  
  const curDateTime = new Date().toISOString()

  const [newSettings, setNewSettings] = useState({
    ...settings,
    id: undefined,
    judgingDeadline: settings?.judgingDeadline?.toISOString() ?? curDateTime,
  });

  useEffect(() => {
    console.log(settings);
    if (settings) {
      setNewSettings({
        ...settings,
        id: undefined,
        judgingDeadline: settings?.judgingDeadline?.toISOString() ?? curDateTime,
      });
    }
  }, [settings, curDateTime]);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {isLoading || isFetching ? (
          <Spinner />
        ) : (
          <>
            <h1 className="text-3xl font-bold">Admin</h1>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="authMode" className="font-bold">Auth Mode</label>
                <select
                  id="authMode"
                  value={newSettings?.authMode ?? "LOCAL"}
                  onChange={(e) => {
                    setNewSettings({ ...newSettings, authMode: e.target.value as "LOCAL" | "SYNC" });
                  }}
                >
                  <option value="LOCAL">Import user data manually</option>
                  <option value="SYNC">Use existing backend</option>
                </select>
              </div>
              {newSettings?.authMode === "SYNC" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="authUrl" className="font-bold">Auth URL</label>
                    <input
                      type="text"
                      id="authUrl"
                      placeholder="e.g. https://backend.com"
                      value={newSettings?.authUrl ?? ""}
                      onChange={(e) => {
                        setNewSettings({ ...newSettings, authUrl: e.target.value });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="getTeamUrl" className="font-bold">Get Team URL</label>
                    <input
                      type="text"
                      id="getTeamUrl"
                      placeholder="e.g. /auth/login"
                      value={newSettings?.getTeamUrl ?? ""}
                      onChange={(e) => {
                        setNewSettings({ ...newSettings, getTeamUrl: e.target.value });
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="serviceToken" className="font-bold">Service Token</label>
                    <input
                      type="text"
                      id="serviceToken"
                      value={newSettings?.serviceToken ?? ""}
                      onChange={(e) => {
                        setNewSettings({ ...newSettings, serviceToken: e.target.value });
                      }}
                    />
                  </div>
                </>
              )}
              <div className="flex flex-col gap-2">
                <label htmlFor="judgingDeadline" className="font-bold">Judging Deadline</label>
                <input
                  type="datetime-local"
                  id="judgingDeadline"
                  value={(newSettings?.judgingDeadline ?? curDateTime).slice(0, -8)}
                  onChange={(e) => {
                    // datepicker stores value as YYYY-MM-DDTHH:MM, it needs to be ISO 8601
                    setNewSettings({ ...newSettings, judgingDeadline: `${e.target.value}:00:000Z` });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="minVisits" className="font-bold">Minimum Visits</label>
                <input
                  type="number"
                  id="minVisits"
                  value={newSettings?.minVisits ?? 0}
                  onChange={(e) => {
                    setNewSettings({ ...newSettings, minVisits: parseInt(e.target.value) });
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="sigmaInit" className="font-bold">Sigma Initial</label>
                <input
                  type="number"
                  id="sigmaInit"
                  value={newSettings?.sigmaInit ?? 1.0}
                  onChange={(e) => {
                    setNewSettings({ ...newSettings, sigmaInit: parseFloat(e.target.value) });
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-purple text-white px-3 py-1 rounded-md m-auto btn"
                  onClick={() => {
                    updateSettings({
                      authMode: newSettings?.authMode,
                      authUrl: newSettings?.authUrl ?? undefined,
                      getTeamUrl: newSettings?.getTeamUrl ?? undefined,
                      serviceToken: newSettings?.serviceToken ?? undefined,
                      judgingDeadline: newSettings?.judgingDeadline,
                      minVisits: newSettings?.minVisits,
                      sigmaInit: newSettings?.sigmaInit,
                    });
                  }}
                >
                  Save
                </button>
                </div>
                {
                  error && (
                    <div className="text-red-500">
                      {error}
                    </div>
                  )
                }
            </div>
          </>
        )}
      </main>
    </>
  );
}
