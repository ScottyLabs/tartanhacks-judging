import { type GetServerSideProps, type NextPage } from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { AuthMode } from "@prisma/client";
import { prisma } from "../../server/db";
import Spinner from "../../components/Spinner";
interface Props {
  csrfToken?: string;
  isUsingLocalAuth: boolean;
}

const Login: NextPage<Props> = ({ csrfToken, isUsingLocalAuth }) => {
  const router = useRouter();
  const signInError = router.query.error as string;

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(signInError);

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
    if (isUsingLocalAuth && magicToken) {
      setIsLoading(true);
      signIn("localAuthWithMagicToken", { magicToken, redirect: false })
        .then((res) => {
          if (res?.ok) {
            void router.push("/");
          } else {
            setError(res?.error as string);
            void clearQueryParams();
            console.log(res);
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
      case "CredentialsSignin":
        return "Invalid email or password";
      case "jwt malformed":
        return "Invalid magic link. Please request a new one.";
      default:
        return "An error occurred. Please contact tech@scottylabs.org";
    }
  }

  async function handleExternalLogin(email: string, password: string) {
    setIsLoading(true);
    const res = await signIn("externalAuthWithCredentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      void router.push("/");
    } else {
      setError(res?.error as string);
      console.log(res);
    }
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      <main className="flex flex-grow flex-col items-center justify-center gap-5 py-5 px-2 md:px-10">
        <div className="text-3xl">
          {isLoading ? "Verifying...." : "Welcome"}
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <form className="w-80">
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
            {!isUsingLocalAuth && (
              <div className="mb-6">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out placeholder:text-purple/25 focus:border-purple focus:bg-white focus:text-purple focus:outline-none"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-purple px-3 py-2 text-white drop-shadow-2xl transition-transform hover:translate-y-[-3px]"
              onClick={() => void handleExternalLogin(email, password)}
              disabled={isLoading}
            >
              LOG IN
            </button>
            {error && (
              <div
                className="mt-6 w-full rounded-lg bg-red-100 py-2 text-center text-base text-red-700"
                role="alert"
              >
                {getErrorMessage(error)}
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const settings = await prisma?.settings.findFirst();

  if (!settings) {
    throw new Error("Settings not found");
  }

  const isUsingLocalAuth = settings.authMode === AuthMode.LOCAL;

  return {
    props: {
      csrfToken: await getCsrfToken(context),
      isUsingLocalAuth: isUsingLocalAuth,
    },
  };
};

export default Login;
