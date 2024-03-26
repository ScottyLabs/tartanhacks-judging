import { useState } from "react";
import { api } from "../../utils/api";
import { PrizeCategory } from "@prisma/client";

type PrizeRowProps = {
  id: string;
  initName: string;
  initDescription: string;
  initGeneral: boolean;
  onUpdate: () => void;
};

export default function PrizeRow({
  id,
  initName,
  initDescription,
  initGeneral,
  onUpdate,
}: PrizeRowProps) {
  const [name, setName] = useState(initName);
  const [description, setDescription] = useState(initDescription);
  const [general, setGeneral] = useState(initGeneral);

  const { mutate: updatePrize } = api.prizes.updatePrize.useMutation({
    onSuccess: () => {
      onUpdate();
    },
  });

  // category passed in to prevent submitting stale data
  const submit = (isGeneral: boolean) => {
    updatePrize({
      id,
      name,
      description,
      category: isGeneral ? PrizeCategory.GENERAL : PrizeCategory.SPECIAL,
    });
  };

  return (
    <tr key={id} className="h-full border-b-2">
      <td className="my-4 flex justify-start px-4">
        <input
          className="w-96"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            // update the prize name
            submit(general);
          }}
        />
      </td>
      <td className="my-4 px-4">
        <textarea
          className="my-4 w-96"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            // update the prize description
            submit(general);
          }}
        />
      </td>
      <td className="flex h-full items-center justify-center px-4">
        <input
          type="checkbox"
          checked={general}
          onChange={(e) => {
            // update the prize category
            // can't use the state directly as it's async
            const generalNew = !general;

            setGeneral(e.target.checked);
            submit(generalNew);
          }}
        />
      </td>
    </tr>
  );
}
