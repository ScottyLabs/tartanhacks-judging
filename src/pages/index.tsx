import { DateTime } from "luxon";
import { type NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import PrizeList from "../components/PrizeList";
import Spinner from "../components/Spinner";
import { api } from "../utils/api";

interface Props {
  judgingDeadline: string;
}

const Home: NextPage<Props> = ({ judgingDeadline }) => {
  const JUDGING_DEADLINE = DateTime.fromISO(judgingDeadline);

  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const { data: prizeData, isFetching } =
    api.judging.getJudgingPrizes.useQuery();

  const prizes = prizeData ?? [];

  useEffect(() => {
    const intervalId = setInterval(() => {
      const diff = JUDGING_DEADLINE.diffNow();
      if (diff.milliseconds < 0) {
        setTimeLeft('Time\'s Up!')
        clearInterval(intervalId)
      } else {
        setTimeLeft(diff.toFormat("hh:mm:ss"));
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, setTimeLeft, JUDGING_DEADLINE]);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {/* Timer */}
        <div className="w-12/12 flex flex-col items-center justify-center gap-3">
          <p className="text-2xl font-bold">Judging Time Left</p>
          <p className="text-3xl font-bold text-yellow">{timeLeft}</p>
        </div>

        {/* Prizes */}
        {isFetching ? (
          <Spinner />
        ) : (
          <>
            {prizes.length > 0 ? (
              <p className="mt-5">You are judging the following prizes</p>
            ) : (
              <p className="mt-5">
                You have not been assigned to judge any prizes!
              </p>
            )}
            <PrizeList prizes={prizes} />

            {/* Action buttons */}
            <div className="mt-10 flex flex-col items-center gap-3">
              {prizes.length > 0 ? (
                <>
                  {/* <Link href="/results">
                    <Button text="View Results" className="w-12/12" />
                  </Link> */}
                  <Link href="/judging">
                    <Button text="Start Judging" className="w-12/12" />
                  </Link>
                </>
              ) : null}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export async function getStaticProps() {
  const settings = await prisma?.settings.findFirst();
  return {
    props: {
      judgingDeadline: settings?.judgingDeadline
    },
  };
}

export default Home;
