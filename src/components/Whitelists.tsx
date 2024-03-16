import { useEffect, useState } from "react";
import { api } from "../utils/api";
import Spinner from "./Spinner";
import Alert from "./Alert";

type WhitelistsProps = {
  submittedSignal: boolean | null;
};

export default function Whitelist({
  submittedSignal,
}: WhitelistsProps) {
  const [error, setError] = useState<string | null>(null);
  const [whitelist, setWhitelist] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const { isLoading, mutate: updateWhitelist } =
    api.users.putParticipantWhitelist.useMutation({
      onError: (error) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const trpcErr = JSON.parse(error.message)[0] as {
            message: string;
            path: number[];
          };
          const msg = trpcErr.message;
          const idx = trpcErr.path[0] as number;
          setError(`${msg}: ${toEmails(whitelist)[idx] as string}`);
        } catch (e) {
          setError(error.message);
        } finally{
          setSuccess(false);
        }
      },

      onSuccess: () => {
        setError(null);
        setSuccess(true);
        setWhitelist("");
      },
    });

  const toEmails = (str: string) => {
    return str
      .split(/\n|,/g)
      .map((email) => email.trim())
      .filter((email) => email !== "");
  };

  useEffect(() => {
    if (submittedSignal === null) return;
    updateWhitelist(toEmails(whitelist));
  }, [submittedSignal]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="font-bold">Participants</h3>
        <textarea
          className="h-32 w-full"
          value={whitelist}
          placeholder="Enter participant emails separated by commas or new lines"
          onChange={(e) =>
            setWhitelist(e.target.value)
          }
        />
      </div>
      {!isLoading && error && <Alert type="error" message={error}/>}
      {!isLoading && success && (
        <Alert type="success" message="Participants added successfully" lifeTimeMs={5000}/>
      )}
    </div>
  );
}
