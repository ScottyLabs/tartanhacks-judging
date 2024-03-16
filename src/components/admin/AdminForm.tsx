import { useState } from "react";
import AdminSettings from "./AdminSettings";
import Spinner from ".././Spinner";
import Alert from "../Alert";

type AdminFormProps = {
  onSettingsSubmitted: () => void;
};

export default function AdminForm({
  onSettingsSubmitted
} : AdminFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // when the form is submitted, the submittedSignal state is toggled
  const [submittedSignal, setSubmittedSignal] = useState<boolean | null>(null);

  return (
    <>
      {isLoading && <Spinner />}
      <div className={isLoading ? "hidden" : "flex w-96 flex-col gap-8"}>
        <AdminSettings
          setError={setError}
          setIsLoading={setIsLoading}
          submittedSignal={submittedSignal}
          onSettingsSubmitted={onSettingsSubmitted}
        />
        <button
          className="btn rounded-md bg-purple px-3 py-1 text-white"
          onClick={() => {
            setSubmittedSignal(!submittedSignal);
          }}
        >
          Save
        </button>
      </div>
      {!isLoading && error && (
        <Alert message={error} type="error"/>
      )}
    </>
  );
}
