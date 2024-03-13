type Whitelists = {
  participants: string;
  judges: string;
  admins: string;
}

type WhitelistsProps = {
  whitelists: Whitelists;
  setWhitelists: (whitelists: Whitelists) => void;
};

export default function Whitelists({
  whitelists,
  setWhitelists,
}: WhitelistsProps) {

  return (
    <>
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold">Participants</h3>
          <textarea
            className="w-full h-32"
            value={whitelists.participants}
            onChange={(e) =>
              setWhitelists({
                ...whitelists,
                participants: e.target.value,
              })
            }
          />
        </div>
        <div>
          <h3 className="text-xl font-bold">Judges</h3>
          <textarea
            className="w-full h-32"
            value={whitelists.judges}
            onChange={(e) =>
              setWhitelists({
                ...whitelists,
                judges: e.target.value,
              })
            }
          />
        </div>
        <div>
          <h3 className="text-xl font-bold">Admins</h3>
          <textarea
            className="w-full h-32"
            value={whitelists.admins}
            onChange={(e) =>
              setWhitelists({
                ...whitelists,
                admins: e.target.value,
              })
            }
          />
        </div>
      </div>
    </>
  );
}