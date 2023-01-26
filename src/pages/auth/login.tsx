import { type GetServerSideProps, type NextPage } from "next";
import { getCsrfToken, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "../../components/Header";

interface Props {
  csrfToken?: string;
  url?: string;
}

const Login: NextPage<Props> = ({ csrfToken, url }) => {
  const router = useRouter();
  const signInError = router.query.error;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  console.log(url);

  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      <main className="flex flex-grow flex-col items-center justify-center gap-5 py-5 px-2 md:px-10">
        <div className="text-3xl">Welcome</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void signIn("credentials", {
              username,
              password,
              callbackUrl: window.location.origin,
            });
          }}
          className="w-80"
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <div className="mb-6">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out placeholder:text-purple/25 focus:border-purple focus:bg-white focus:text-purple focus:outline-none"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {signInError === "CredentialsSignin" && (
            <div
              className="mt-6 w-full rounded-lg bg-red-100 py-2 text-center text-base text-red-700"
              role="alert"
            >
              Incorrect email or password.
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
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      url: process.env.NEXTAUTH_URL,
    },
  };
};

export default Login;
