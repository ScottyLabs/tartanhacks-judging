import { useState } from "react";
import { api } from "../utils/api";
import Spinner from "./Spinner";

export default function UserTable() {
  const { isFetching, data: users, refetch } = api.users.getUsers.useQuery();

  const { isLoading: isLoadingDelete, mutate: deleteUser } =
    api.users.deleteByEmail.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const [search, setSearch] = useState<string>("");

  if (isFetching || isLoadingDelete) {
    return <Spinner />;
  }

  if (users && users.length === 0) {
    return <p>No users found</p>;
  }

  return (
    <div className="flex w-96 flex-col gap-8">
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-md border-2 border-purple p-2"
      />
      <div className="flex flex-col gap-5">
        {users
          ?.filter((user) => {
            return (
              user.email.toLowerCase().includes(search.toLowerCase()) ||
              user.type.toLowerCase().includes(search.toLowerCase()) ||
              (user.isAdmin ? "admin" : "").includes(search.toLowerCase())
            );
          })
          .map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between border-b-4 pb-4"
            >
              <p>{`${user.email} (${user.type.toLowerCase()}${
                user.isAdmin ? ", admin" : ""
              })`}</p>
              <button
                className="h-12 rounded-md bg-red-500 px-3 py-1 text-white"
                onClick={() => {
                  deleteUser({ email: user.email });
                }}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
