import type { GetServerSidePropsContext } from "next";
import { type NextPage } from "next";
import Header from "../components/Header";
import { getSession } from "next-auth/react";
import { prisma } from "../server/db";

interface Props {
  email: string;
  isAdmin: boolean;
  userType: string;
  authMode: string;
}

const Home: NextPage<Props> = ({ email, isAdmin, userType, authMode }) => {
  return (
    <>
      <Header showAdmin={isAdmin} />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {/* Timer */}
        <div className="w-12/12 flex flex-col items-center justify-center gap-3">
          <h2 className="text-2xl font-bold">Welcome to the Judging System!</h2>
          <p>Email: {email}</p>
          <p>Admin: {isAdmin ? "Yes" : "No"}</p>
          <p>User Type: {userType}</p>
          <p>Auth Mode: {authMode}</p>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const email = session?.user?.email as string;
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  const settings = await prisma.settings.findFirst();
  return {
    props: {
      email: email,
      isAdmin: user?.isAdmin as boolean,
      userType: user?.type as string,
      authMode: settings?.authMode as string,
    },
  };
}

export default Home;
