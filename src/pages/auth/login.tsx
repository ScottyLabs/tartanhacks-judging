import { type GetServerSideProps, type NextPage } from "next";
import Header from "../../components/Header";
import { AuthMode } from "@prisma/client";
import { prisma } from "../../server/db";
import LocalLogin from "../../components/auth/LocalLogin";
import ExternaLogin from "../../components/auth/ExternalLogin";
import { useRouter } from "next/router";

interface Props {
  isUsingLocalAuth: boolean;
}

const Login: NextPage<Props> = ({ isUsingLocalAuth }) => {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col">
      <Header hideAuth />
      {isUsingLocalAuth ? <LocalLogin router={router} /> : <ExternaLogin />}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const settings = await prisma?.settings.findFirst();

  if (!settings) {
    throw new Error("Settings not found");
  }

  const isUsingLocalAuth = settings?.authMode !== AuthMode.SYNC;

  return {
    props: {
      isUsingLocalAuth: isUsingLocalAuth,
    },
  };
};

export default Login;
