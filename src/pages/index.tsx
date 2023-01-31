import { DateTime } from "luxon";
import { type NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Header from "../components/Header";
import PrizeListing from "../components/PrizeListing";
import { api } from "../utils/api";
import { getSponsorLogo } from "../utils/prizes";

const JUDGING_DEADLINE = DateTime.fromISO("2023-02-04T08:00:00.000");

const Home: NextPage = () => {
  const [timeLeft, setTimeLeft] = useState("00:00:00");

  const { data: prizeData } = api.judging.getJudgingPrizes.useQuery();

  const prizes = prizeData ?? [];

  useEffect(() => {
    const intervalId = setInterval(() => {
      const diff = JUDGING_DEADLINE.diffNow();
      setTimeLeft(diff.toFormat("hh:mm:ss"));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, setTimeLeft]);

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
        {prizes.length > 0 ? (
          <p className="mt-5">You are judging the following prizes</p>
        ) : (
          <p className="mt-5">
            You have not been assigned to judge any prizes!
          </p>
        )}
        <div className="w-12/12 flex flex-col gap-5">
          {prizes.map((prize) => {
            const sponsorLogo = getSponsorLogo(prize.provider);

            return (
              <PrizeListing
                key={prize.name}
                sponsorLogo={sponsorLogo}
                prizeName={prize.name}
              />
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <Button text="View Current Results" className="w-12/12" />
          {prizes.length > 0 ? (
            <Link href="/judging">
              <Button text="Start Judging" className="w-12/12" />
            </Link>
          ) : null}
        </div>
      </main>
    </>
  );
};

export default Home;
