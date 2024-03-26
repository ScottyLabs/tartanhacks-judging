import { useState } from "react";
import { api } from "../utils/api";
import Spinner from "./Spinner";
import { UserType } from "@prisma/client";
import Alert from "./Alert";

export default function UserTable() {
  const { isFetching, data: users, refetch } = api.users.getUsers.useQuery();

  const { isLoading: isLoadingDelete, mutate: deleteUser } =
    api.users.deleteByEmail.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const { isLoading: isLoadingPromoteAdmin, mutate: promoteToAdmin } =
    api.users.promoteToAdmin.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const { isLoading: isLoadingPromoteJudge, mutate: promoteToJudge } =
    api.users.promoteToJudge.useMutation({
      onSuccess: async () => {
        await refetch();
      },
    });

  const [search, setSearch] = useState<string>("");

  if (
    isFetching ||
    isLoadingDelete ||
    isLoadingPromoteAdmin ||
    isLoadingPromoteJudge
  ) {
    return <Spinner />;
  }

  if (users && users.length === 0) {
    return <Alert message="No users found. Users can be added on the Settings page" type="info" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <input
        type="text"
        placeholder="Search by email or role"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-md border-2 border-purple p-2"
      />
      <table className="m-auto">
        <tbody>
          {users
            ?.filter((user) => {
              return (
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.type.toLowerCase().includes(search.toLowerCase()) ||
                (user.isAdmin ? "admin" : "").includes(search.toLowerCase())
              );
            })
            .map((user) => (
              <tr key={user.email} className="border-b-2">
                <td className="overflow-wrap max-w-xs break-words py-2 px-4">
                  {user.email}
                </td>
                <td className="px-4">
                  {user.isAdmin
                    ? `${user.type.toLowerCase()}, admin`
                    : user.type.toLowerCase()}
                </td>
                <td className="px-4">
                  <button
                    className="my-2 rounded-md bg-red-500 p-2 text-white"
                    onClick={() => {
                      deleteUser(user.email);
                    }}
                  >
                    Delete
                  </button>
                </td>
                <td className="px-4">
                  {!user.isAdmin && (
                    <button
                      className="bg-purple my-2 rounded-md p-2 text-white"
                      onClick={() => {
                        promoteToAdmin(user.email);
                      }}
                    >
                      Make admin
                    </button>
                  )}
                </td>
                <td className="px-4">
                  {user.type !== UserType.JUDGE && (
                    <button
                      className="bg-blue my-2 rounded-md p-2 text-white"
                      onClick={() => {
                        promoteToJudge(user.email);
                      }}
                    >
                      Make judge
                    </button>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
