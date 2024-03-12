import { type NextPage } from "next";
import Header from "../components/Header";
import { prisma } from "../server/db";

interface Props {
  judgingDeadline: string;
}

const Home: NextPage<Props> = () => {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {/* Timer */}
        <div className="w-12/12 flex flex-col items-center justify-center gap-3">
          <p className="text-2xl font-bold">Welcome to the Judging System!</p>
        </div>
      </main>
    </>
  );
};

export async function getServerSideProps() {
  return {
    props: {
      judgingDeadline: "",
    },
  };
}

export default Home;
