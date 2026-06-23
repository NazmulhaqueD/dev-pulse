export type UserPayload = {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
};
export type IUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at?: string;
  updated_at?: string;
};
