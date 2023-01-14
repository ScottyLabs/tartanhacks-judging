import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Button from "../components/Button";
import Header from "../components/Header";
import PrizeListing from "../components/PrizeListing";

const Home: NextPage = () => {
  const { data: session } = useSession();
  console.log(session);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {/* <p className="text-lg">
          Welcome, <span className="font-semibold text-yellow">Gram!</span>
        </p> */}

        {/* Timer */}
        <div className="w-12/12 flex flex-col items-center justify-center gap-3">
          <p className="text-2xl font-bold">Judging Time Left</p>
          <p className="text-3xl font-bold text-yellow">03:58</p>
        </div>

        {/* Prizes */}
        <p className="mt-5">You are judging the following prizes</p>
        <div className="w-12/12 flex flex-col gap-5">
          <PrizeListing
            sponsorLogo="/sponsors/scottylabs.svg"
            prizeName="Scott Krulcik Grand Prize"
          />
          <PrizeListing
            sponsorLogo="/sponsors/scottylabs.svg"
            prizeName="First Penguin Award"
          />
          <PrizeListing
            sponsorLogo="/sponsors/algorand.png"
            prizeName="Best Use of Algorand"
          />
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button text="View Current Results" className="w-12/12" />
          <Button text="Start Judging" className="w-12/12" />
        </div>
      </main>
    </>
  );
};

export default Home;
