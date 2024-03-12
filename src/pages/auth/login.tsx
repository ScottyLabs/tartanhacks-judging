import { type GetServerSideProps, type NextPage } from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { AuthMode } from "@prisma/client";
import { prisma } from "../../server/db";
interface Props {
  csrfToken?: string;
  isUsingLocalAuth: boolean;
}

const Login: NextPage<Props> = ({ csrfToken, isUsingLocalAuth }) => {
  const router = useRouter();
  const signInError = router.query.error;

  const [isLoading, setIsLoading] = useState(false);
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
      console.log(magicToken);
      signIn("localAuthWithMagicToken", { magicToken, redirect: false })
        .then((res) => {
          if (res?.ok) {
            void router.push("/");
          } else if (res?.status === 401) {
            setError("Invalid magic link");
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      <main className="flex flex-grow flex-col items-center justify-center gap-5 py-5 px-2 md:px-10">
        <div className="text-3xl">Welcome</div>
        <form
          method="post"
          action="/api/auth/callback/credentials"
          className="w-80"
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <div className="mb-6">
            <input
              type="text"
              id="username"
              name="username"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out placeholder:text-purple/25 focus:border-purple focus:bg-white focus:text-purple focus:outline-none"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              id="password"
              name="password"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out placeholder:text-purple/25 focus:border-purple focus:bg-white focus:text-purple focus:outline-none"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-purple px-3 py-2 text-white drop-shadow-2xl transition-transform hover:translate-y-[-3px]"
          >
            LOGIN
          </button>
          {error && (
            <div
              className="mt-6 w-full rounded-lg bg-red-100 py-2 text-center text-base text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
        </form>
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
