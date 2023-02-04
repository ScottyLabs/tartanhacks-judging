export interface HelixUser {
  admin: boolean;
  judge: boolean;
  company?: {
    name: string;
  };
  status: string;
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  token: string;
}
