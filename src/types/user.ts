import type { UserType } from "@prisma/client";

export interface HelixUser {
  userType: UserType;
  isAdmin: boolean;
}
