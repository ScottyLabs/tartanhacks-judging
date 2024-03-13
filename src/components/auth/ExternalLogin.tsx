import { useRouter } from "next/router";
import Spinner from "../Spinner";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function ExternaLogin() {
  const router = useRouter();
  const signInError = router.query.error as string;
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(signInError);

  function getErrorMessage(error: string) {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password";
      case "jwt malformed":
        return "Invalid magic link. Please request a new one.";
      default:
        return error;
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
      setIsLoading(false);
      setError(res?.error as string);
      console.log(res);
    }
  }

  return (
    <main className="flex flex-grow flex-col items-center justify-center gap-5 py-5 px-2 md:px-10">
      <div className="text-3xl">{isLoading ? "Verifying...." : "Welcome"}</div>
      {isLoading ? (
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
          <button
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
        </div>
      )}
    </main>
  );
}
