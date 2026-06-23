export type UserPayload = {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
};
