export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IUpdateProfile {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  profileImage?: string;
}
