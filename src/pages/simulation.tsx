import { type NextPage } from "next";
import Button from "../components/Button";
import Header from "../components/Header";
import Spinner from "../components/Spinner";
import { api } from "../utils/api";

const Results: NextPage = () => {
  const { mutate: prepareSimulation, isLoading: isPreparing } =
    api.simulation.prepareSimulation.useMutation();
  const { mutate: startSimulation, isLoading: isSimulating } =
    api.simulation.startSimulation.useMutation();

  const isLoading = isPreparing || isSimulating;

  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <Button
          text="Prepare simulation"
          className="w-12/12"
          onClick={() => {
            void prepareSimulation();
          }}
          disabled={isLoading}
        />
        <Button
          text="Start simulation"
          className="w-12/12"
          onClick={() => {
            void startSimulation();
          }}
          disabled={isLoading}
        />
        {isLoading ? <Spinner /> : null}
      </main>
    </>
  );
};

export default Results;
