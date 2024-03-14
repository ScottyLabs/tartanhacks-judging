import { useState } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import AdminSettings from "../components/AdminSettings";

export default function Admin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedSignal, setSubmittedSignal] = useState(false);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        {isLoading && <Spinner />}
        <div className={isLoading ? "hidden" : "w-96"}>
          <AdminSettings
            setError={setError}
            setIsLoading={setIsLoading}
            submittedSignal={submittedSignal}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="btn m-auto rounded-md bg-purple px-3 py-1 text-white"
            onClick={() => {
              setSubmittedSignal(!submittedSignal);
            }}
          >
            Save
          </button>
        </div>
        {!isLoading && error && <p className="text-red-500">{error}</p>}
      </main>
    </>
  );
}
