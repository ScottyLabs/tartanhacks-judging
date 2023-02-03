import { type Project, type JudgingInstance } from "@prisma/client";
import { useState } from "react";

interface Props {
  projects: Array<JudgingInstance & { project: Project }>;
}

export default function ResultTable({ projects }: Props): JSX.Element {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="flex max-w-full flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="border-b bg-white">
                <tr>
                  <th
                    scope="col"
                    className="text-md px-6 py-4 text-left font-medium text-gray-900"
                  >
                    #
                  </th>
                  <th
                    scope="col"
                    className="text-md w-64 px-6 py-4 text-left font-medium text-gray-900"
                  >
                    Project Name{" "}
                    {showAll && (
                      <span
                        className="cursor-pointer text-sky-500 transition ease-in-out hover:text-sky-600"
                        onClick={() => setShowAll(false)}
                      >
                        [collapse]
                      </span>
                    )}
                  </th>
                  <th
                    scope="col"
                    className="text-md px-6 py-4 text-left font-medium text-gray-900"
                  >
                    Mean
                  </th>
                  <th
                    scope="col"
                    className="text-md px-6 py-4 text-left font-medium text-gray-900"
                  >
                    Variance
                  </th>
                  <th
                    scope="col"
                    className="text-md px-6 py-4 text-left font-medium text-gray-900"
                  >
                    Times Judged
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  if (showAll || index < 10) {
                    return (
                      <tr
                        className="border-b bg-white"
                        key={`result-project-${project.project.name}`}
                      >
                        <td className="text-md whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="text-md whitespace-nowrap px-6 py-4 font-light text-gray-900">
                          {project.project.name}
                        </td>
                        <td className="text-md whitespace-nowrap px-6 py-4 font-light text-gray-900">
                          {project.mu.toFixed(3)}
                        </td>
                        <td className="text-md whitespace-nowrap px-6 py-4 font-light text-gray-900">
                          {project.sigma2.toFixed(3)}
                        </td>
                        <td className="text-md whitespace-nowrap px-6 py-4 font-light text-gray-900">
                          {project.timesJudged}
                        </td>
                      </tr>
                    );
                  } else {
                    return null;
                  }
                })}
                {!showAll && projects.length > 10 && (
                  <tr className="border-b bg-white">
                    <td
                      colSpan={5}
                      onClick={() => setShowAll(true)}
                      className="text-md cursor-pointer whitespace-nowrap px-6 py-4 font-medium text-sky-600 transition duration-300 ease-in-out hover:bg-gray-100"
                    >
                      Show {projects.length - 10} more entries...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
