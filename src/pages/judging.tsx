import Button from "../components/Button";
import CloseButton from "../components/CloseButton";
import Header from "../components/Header";
import PrizeListing from "../components/PrizeListing";

export default function JudgingPage(props: any) {
  // whether this is the first project being judged
  const isFirstProject = true;
  // current project
  const project = {
    name: "My Project",
    table: 69,
    team: "My team",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
  };
  const prizes = [
    {
      sponsorLogo: "/sponsors/scottylabs.svg",
      prizeName: "Scott Krulcik Grand Prize",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
    },
    {
      sponsorLogo: "/sponsors/scottylabs.svg",
      prizeName: "First Penguin Award",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
    },
    {
      sponsorLogo: "/sponsors/algorand.png",
      prizeName: "Best Use of Algorand",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus consequuntur exercitationem soluta, in autem maiores animi? Iure veniam consectetur cumque exercitationem blanditiis nihil provident voluptatibus ab, eaque quisquam amet excepturi.",
    },
  ];
  return (
    <>
      <Header />
      <main className="flex flex-col items-center gap-5 py-5 px-2 md:px-10">
        <CloseButton />

        <div className="flex max-w-xl flex-col items-center gap-10 px-6">
          <p className="w-full text-2xl font-bold sm:text-center">
            Current Project
          </p>

          {/* Project info */}
          <div className="grow rounded-md border-4 border-blue p-8 shadow-md">
            <div className="flex grow flex-row items-center justify-start pb-4">
              <p className="pr-10 text-xl">Table {project.table}:</p>
              <p className="text-xl font-bold text-yellow">{project.name}</p>
            </div>
            <div className="flex grow flex-row items-center justify-start pb-5">
              <p className="pr-10 text-xl">Team:</p>
              <p className="text-xl font-bold text-yellow">{project.team}</p>
            </div>
            <div className="overflow-hidden">
            <details className="inline-block">
              <summary className="text-xl">Project description</summary>
              <div>
                <p className="break-normal">{project.description}</p>
              </div>
            </details>
            </div>
          </div>
          {isFirstProject ? (
            <>
              <Button text="Get Next Project" className="px-20"/>

              {/* Prizes */}
              <p className="mt-5">You are judging the following prizes</p>
              <div className="flex flex-col gap-5">
                {prizes.map((prize, i) => {
                  return (
                    <PrizeListing
                      sponsorLogo={prize.sponsorLogo}
                      prizeName={prize.prizeName}
                      prizeDescription={prize.description}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </>
  );
}
