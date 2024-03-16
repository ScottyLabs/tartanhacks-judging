import { PrizeCategory } from "@prisma/client";
import PrizeRow from "./PrizeRow";

type PrizeTableProps = {
  prizes: {
    id: string;
    name: string;
    description: string;
    category: PrizeCategory;
  }[];
  onUpdate: () => void;
};

export default function PrizeTable({ prizes, onUpdate }: PrizeTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Is General</th>
        </tr>
      </thead>
      <tbody>
        {prizes.map((prize) => (
          <PrizeRow
            key={prize.id}
            id={prize.id}
            initName={prize.name}
            initDescription={prize.description}
            initGeneral={prize.category === PrizeCategory.GENERAL}
            onUpdate={onUpdate}
          />
        ))}
      </tbody>
    </table>
  );
}
