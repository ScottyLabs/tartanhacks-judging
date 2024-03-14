import { useEffect, useState } from "react";
import { api } from "../utils/api";
import Spinner from "./Spinner";

type Whitelists = {
  participants: string;
  judges: string;
  admins: string;
};

type WhitelistsProps = {
  whitelists: Whitelists;
  setWhitelists: (whitelists: Whitelists) => void;
  submittedSignal: boolean;
};

export default function Whitelists({
  whitelists,
  setWhitelists,
  submittedSignal,
}: WhitelistsProps) {
  const [error, setError] = useState<string | null>(null);

  const { isLoading, mutate: updateWhitelists } =
    api.users.putWhitelists.useMutation({
      onError: (error) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const trpcErr = JSON.parse(error.message)[0] as {
            message: string;
            path: (keyof Whitelists | number)[];
          };
          const msg = trpcErr.message;
          const field = trpcErr.path[0] as keyof Whitelists;
          const idx = trpcErr.path[1] as number;
          setError(`${msg}: ${toEmails(whitelists[field])[idx] as string}`);
        } catch (e) {
          setError(error.message);
        }
      },

      onSuccess: () => {
        setError(null);
      },
    });

  const toEmails = (str: string) => {
    return str
      .split(/\n|,/g)
      .map((email) => email.trim())
      .filter((email) => email !== "");
  };

  useEffect(() => {
    updateWhitelists({
      participants: toEmails(whitelists.participants),
      judges: toEmails(whitelists.judges),
      admins: toEmails(whitelists.admins),
    });
  }, [submittedSignal]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold">Participants</h3>
        <textarea
          className="h-32 w-full"
          value={whitelists.participants}
          placeholder="Enter participant emails separated by commas or new lines"
          onChange={(e) =>
            setWhitelists({
              ...whitelists,
              participants: e.target.value,
            })
          }
        />
      </div>
      <div>
        <h3 className="text-xl font-bold">Judges</h3>
        <textarea
          className="h-32 w-full"
          value={whitelists.judges}
          placeholder="Enter judge emails separated by commas or new lines"
          onChange={(e) =>
            setWhitelists({
              ...whitelists,
              judges: e.target.value,
            })
          }
        />
      </div>
      <div>
        <h3 className="text-xl font-bold">Admins</h3>
        <textarea
          className="h-32 w-full"
          value={whitelists.admins}
          placeholder="Enter admin emails separated by commas or new lines"
          onChange={(e) =>
            setWhitelists({
              ...whitelists,
              admins: e.target.value,
            })
          }
        />
      </div>
      {!isLoading && error && <p className="m-auto text-red-500">{error}</p>}
    </div>
  );
}
