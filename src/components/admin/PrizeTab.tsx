import { useState } from "react";
import { api } from "../../utils/api";
import Spinner from "../Spinner";
import PrizeTable from "./PrizeTable";

export default function PrizeTab() {
  // upload fields for default and non-default prizes
  const [newPrizes, setNewPrizes] = useState({
    generalPrizes: "",
    specialPrizes: "",
  });

  const {
    isFetching: isFetchingPrizes,
    data: prizes,
    refetch,
  } = api.prizes.getPrizes.useQuery();

  const { isLoading: isLoadingUpdate, mutate: updatePrizes } =
    api.prizes.putPrizes.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  if (isLoadingUpdate) {
    return <Spinner />;
  }

  return (
    <div className="m-auto flex w-full min-w-[60rem] flex-col gap-5 pb-8">
      <div>
        <h3 className="font-bold">General prizes</h3>
        <textarea
          className="h-32 w-full"
          value={newPrizes.generalPrizes}
          placeholder="Enter general prize names separated by new lines. General prizes are assigned to all judges by default."
          onChange={(e) =>
            setNewPrizes({
              ...newPrizes,
              generalPrizes: e.target.value,
            })
          }
        />
      </div>
      <div>
        <h3 className="font-bold">Special prizes</h3>
        <textarea
          className="h-32 w-full"
          value={newPrizes.specialPrizes}
          placeholder="Enter special prize names separated by new lines. Special prizes are not assigned to judges by default."
          onChange={(e) =>
            setNewPrizes({
              ...newPrizes,
              specialPrizes: e.target.value,
            })
          }
        />
      </div>
      <div>
        <button
          className="w-full rounded-md bg-purple px-3 py-1 text-white"
          onClick={() => {
            updatePrizes({
              generalPrizes: newPrizes.generalPrizes
                .split("\n")
                .filter(Boolean),
              specialPrizes: newPrizes.specialPrizes
                .split("\n")
                .filter(Boolean),
            });
            setNewPrizes({
              generalPrizes: "",
              specialPrizes: "",
            });
          }}
        >
          Submit
        </button>
      </div>
      {isFetchingPrizes ? (
        <Spinner />
      ) : (
        prizes && <PrizeTable prizes={prizes} onUpdate={refetch} />
      )}
    </div>
  );
}
