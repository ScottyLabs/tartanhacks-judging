import { type NextPage } from "next";
import { useState } from "react";
import Header from "../components/Header";
import ResultTable from "../components/ResultTable";
import { api } from "../utils/api";

const Results: NextPage = () => {
  const { data: prizesResult } = api.prizes.getPrizes.useQuery();
  const prizes = prizesResult ?? [];

  const [prizeSelection, setPrizeSelection] = useState(0);

  const { data: topProjectsResult } = api.judging.getTopProjects.useQuery({
    prizeId: prizes[prizeSelection]?.id,
  });
  const judgments = topProjectsResult ?? [];

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <div className="flex justify-center">
          <div className="mb-3 xl:w-96">
            <select
              className="focus:border-blue-600 form-select
      m-0
      block
      w-full
      appearance-none
      rounded
      border
      border-solid
      border-gray-300 bg-white bg-clip-padding
      bg-no-repeat px-3 py-1.5
      text-base
      font-normal
      text-gray-700
      transition
      ease-in-out focus:bg-white focus:text-gray-700 focus:outline-none"
              aria-label="Default select example"
              onChange={(e) => {
                setPrizeSelection(parseInt(e.target.value));
              }}
            >
              {prizes.map((prize, i) => (
                <option selected={i === prizeSelection} key={i} value={i}>
                  {prize.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ResultTable projects={judgments} />
      </main>
    </>
  );
};

export default Results;
