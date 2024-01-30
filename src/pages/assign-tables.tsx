"use client";

import { useSearchParams } from "next/navigation";
import { api } from "../utils/api";
import { useEffect, useState } from "react";
import { Project } from "@prisma/client";

export default function AssignTables() {
  const [assignments, setAssignments] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { mutate: assignTables } = api.judging.assignTables.useMutation({
    onSuccess: (data) => {
      setError(null);
      setAssignments(data);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    const numTables = Number(searchParams.get("numTables"));
    if (numTables === 0) {
      return;
    }
    void assignTables({ numTables });
  }, [searchParams]);

  return (
    <>
      {error && <p>{error}</p>}
      <div className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        {assignments
          .sort((a, b) => {
            const aTable = Number(a.location.split(" ")[1]);
            const bTable = Number(b.location.split(" ")[1]);
            return aTable - bTable;
          })
          .map((assignment) => (
            <p className="w-full text-2xl font-bold" key={assignment.id}>
              {assignment.name}: {assignment.location}
            </p>
          ))}
      </div>
    </>
  );
}
