import { useState } from "react";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import AdminSettings from "../components/AdminSettings";

export default function Admin() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
            <h1 className="text-3xl font-bold">Admin</h1>
            {isLoading && <Spinner />}
            <div className={isLoading ? "hidden" : "w-96"}>
              <AdminSettings setError={setError} setIsLoading={setIsLoading} />
            </div>
        {!isLoading && error && <div className="text-red-500">{error}</div>}
      </main>
    </>
  );
}
