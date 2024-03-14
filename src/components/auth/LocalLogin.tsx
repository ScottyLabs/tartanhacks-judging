import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import Spinner from "../Spinner";

export default function LocalLogin() {
  const router = useRouter();
  const signInError = router.query.error as string;

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const [error, setError] = useState(signInError);
  const [magicLinkSentSuccessfully, setMagicLinkSentSuccessfully] =
    useState(false);

  const { magicToken } = router.query;

  async function clearQueryParams() {
    await router.replace(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true }
    );
  }
  useEffect(() => {
    if (magicToken) {
      setIsLoading(true);
      signIn("localAuthWithMagicToken", { magicToken, redirect: false })
        .then((res) => {
          if (res?.ok) {
            router.push("/").then(() => {
              console.log("logged in");
            }).catch((err) => {
              console.error(err);
            });
          } else {
            setError(res?.error as string);
            void clearQueryParams();
            console.log(res);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          setError(err as string);
          console.log(err);
        });
    }
  }, [magicToken]);

  function getErrorMessage(error: string) {
    switch (error) {
      case "jwt expired":
        return "This magic link has expired. Please enter your e-mail to request a new one.";
      case "jwt malformed":
        return "Invalid magic link. Please request a new one.";
      default:
        return error;
    }
  }

  const { mutate: sendMagicLink, isLoading: isMagicLinkLoading } =
    api.auth.sendMagicLink.useMutation({
      onSuccess: ({ success, message }) => {
        console.log(success, message);
        if (success) {
          setMagicLinkSentSuccessfully(true);
        } else {
          setError(message);
        }
      },
      onError: (err) => {
        console.log(err);
        setError(err.message);
      },
    });
  return (
    <main className="flex flex-grow flex-col items-center justify-center gap-5 py-5 px-2 md:px-10">
      <div className="text-3xl">
        {isLoading || isMagicLinkLoading ? "Verifying...." : "Welcome"}
      </div>
      {isLoading || isMagicLinkLoading ? (
        <Spinner />
      ) : (
        <div className="w-80">
          <div className="mb-6">
            <input
              type="text"
              id="username"
              name="username"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out placeholder:text-purple/25 focus:border-purple focus:bg-white focus:text-purple focus:outline-none"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            className="w-full rounded-lg bg-purple px-3 py-2 text-white drop-shadow-2xl transition-transform hover:translate-y-[-3px]"
            onClick={() => sendMagicLink({ email })}
            disabled={
              isLoading || isMagicLinkLoading || magicLinkSentSuccessfully
            }
          >
            LOG IN
          </button>
          {error && !magicLinkSentSuccessfully && (
            <div
              className="mt-6 w-full rounded-lg bg-red-100 py-2 text-center text-base text-red-700"
              role="alert"
            >
              {getErrorMessage(error)}
            </div>
          )}
          {magicLinkSentSuccessfully && (
            <div
              className="mt-6 w-full rounded-lg bg-green-100 py-2 text-center text-base text-green-700"
              role="alert"
            >
              Check your email for a link to log in
            </div>
          )}
        </div>
      )}
    </main>
  );
}
