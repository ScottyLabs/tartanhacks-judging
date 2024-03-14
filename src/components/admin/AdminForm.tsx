import { useState } from "react";
import AdminSettings from "./AdminSettings";
import Spinner from ".././Spinner";

export default function AdminForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [submittedSignal, setSubmittedSignal] = useState(false);

  return (
    <>
      {isLoading && <Spinner />}
      <div className={isLoading ? "hidden" : "flex w-96 flex-col gap-8"}>
        <AdminSettings
          setError={setError}
          setIsLoading={setIsLoading}
          submittedSignal={submittedSignal}
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
        <p className="mt-8 w-full text-center text-red-500">{error}</p>
      )}
    </>
  );
}
