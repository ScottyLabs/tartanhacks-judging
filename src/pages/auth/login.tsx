import { type GetServerSideProps, type NextPage } from "next";
import Header from "../../components/Header";
import { AuthMode } from "@prisma/client";
import { prisma } from "../../server/db";
import LocalLogin from "../../components/auth/LocalLogin";
import ExternaLogin from "../../components/auth/ExternalLogin";
import { useRouter } from "next/router";

interface Props {
  isUsingExternalAuth: boolean;
}

const Login: NextPage<Props> = ({ isUsingExternalAuth }) => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      {isUsingExternalAuth ? (
        <ExternaLogin router={router} />
      ) : (
        <LocalLogin router={router} />
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const settings = await prisma?.settings.findFirst();

  if (!settings) {
    throw new Error("Settings not found");
  }

  const isUsingExternalAuth = settings?.authMode == AuthMode.SYNC;
  console.log(settings?.authMode);
  return {
    props: {
      isUsingExternalAuth: isUsingExternalAuth,
    },
  };
};

export default Login;
