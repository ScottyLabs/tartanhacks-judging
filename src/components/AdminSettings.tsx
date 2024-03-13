import { useState, useEffect } from "react";
import { api } from "../utils/api";
import Whitelists from "./Whitelists";

type AdminSettingsProps = {
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export default function AdminSettings({
  setError,
  setIsLoading,
}: AdminSettingsProps) {
  const {
    isFetching,
    data: settings,
    refetch,
  } = api.settings.getSettings.useQuery();

  const { isLoading, mutate: updateSettings } =
    api.settings.putSettings.useMutation({
      onSuccess: async () => {
        await refetch();
        setError(null);
      },
      onError: (error) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setError(JSON.parse(error.message)[0].message as string);
        } catch (e) {
          setError(error.message);
        }
      },
    });

  useEffect(() => {
    setIsLoading(isFetching || isLoading);
  }, [isFetching, isLoading, setIsLoading]);

  const curDateTime = new Date().toISOString();

  const settingsToDisplay = (logic: typeof settings) => {
    const curDateTime = new Date().toISOString();
    return {
      authMode: logic?.authMode ?? "LOCAL",
      authUrl: logic?.authUrl ?? undefined,
      getTeamUrl: logic?.getTeamUrl ?? undefined,
      serviceToken: logic?.serviceToken ?? undefined,
      judgingDeadline: logic?.judgingDeadline?.toISOString() ?? curDateTime,
      minVisits: logic?.minVisits ?? 0,
      sigmaInit: logic ? `${logic.sigmaInit}` : "1.0",
    };
  };

  const [newSettings, setNewSettings] = useState(settingsToDisplay(settings));

  const [whitelists, setWhitelists] = useState({
    participants: "",
    judges: "",
    admins: "",
  });

  const displayToSettings = (display: typeof newSettings) => {
    let sigmaInit = undefined;
    try {
      sigmaInit = parseFloat(display.sigmaInit);
    } catch (e) {}
    return {
      ...display,
      sigmaInit,
    };
  };
  useEffect(() => {
    if (settings) {
      setNewSettings(settingsToDisplay(settings));
    }
  }, [settings]);

  const syncFields = (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="authUrl" className="font-bold">
          Auth URL
        </label>
        <input
          type="text"
          id="authUrl"
          placeholder="e.g. https://backend.com/auth/login"
          value={newSettings?.authUrl ?? ""}
          onChange={(e) => {
            setNewSettings({ ...newSettings, authUrl: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="getTeamUrl" className="font-bold">
          Get Team URL
        </label>
        <input
          type="text"
          id="getTeamUrl"
          placeholder="e.g. https://backend.com/team"
          value={newSettings?.getTeamUrl ?? ""}
          onChange={(e) => {
            setNewSettings({ ...newSettings, getTeamUrl: e.target.value });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="serviceToken" className="font-bold">
          Service Token
        </label>
        <input
          type="text"
          id="serviceToken"
          value={newSettings?.serviceToken ?? ""}
          onChange={(e) => {
            setNewSettings({
              ...newSettings,
              serviceToken: e.target.value,
            });
          }}
        />
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="authMode" className="font-bold">
          Auth Mode
        </label>
        <select
          id="authMode"
          value={newSettings?.authMode ?? "LOCAL"}
          onChange={(e) => {
            setNewSettings({
              ...newSettings,
              authMode: e.target.value as "LOCAL" | "SYNC",
            });
          }}
        >
          <option value="LOCAL">Import user data manually</option>
          <option value="SYNC">Use existing backend</option>
        </select>
      </div>

      {newSettings?.authMode === "SYNC" && syncFields}

      <div className={newSettings?.authMode === "SYNC" ? "hidden" : ""}>
        <Whitelists whitelists={whitelists} setWhitelists={setWhitelists} />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="judgingDeadline" className="font-bold">
          Judging Deadline
        </label>
        <input
          type="datetime-local"
          id="judgingDeadline"
          value={(newSettings?.judgingDeadline ?? curDateTime).slice(0, -8)}
          onChange={(e) => {
            // datepicker stores value as YYYY-MM-DDTHH:MM, it needs to be ISO 8601
            setNewSettings({
              ...newSettings,
              judgingDeadline: `${e.target.value}:00.000Z`,
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="minVisits" className="font-bold">
          Minimum Visits
        </label>
        <input
          type="number"
          id="minVisits"
          min={0}
          value={newSettings?.minVisits ?? 0}
          onChange={(e) => {
            setNewSettings({
              ...newSettings,
              minVisits: parseInt(e.target.value),
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="sigmaInit" className="font-bold">
          Sigma Initial
        </label>
        <input
          type="number"
          step={0.1}
          min={0.1}
          id="sigmaInit"
          value={newSettings?.sigmaInit ?? 1.0}
          onChange={(e) => {
            setNewSettings({
              ...newSettings,
              sigmaInit: e.target.value,
            });
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          className="btn m-auto rounded-md bg-purple px-3 py-1 text-white"
          onClick={() => {
            updateSettings(displayToSettings(newSettings));
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
