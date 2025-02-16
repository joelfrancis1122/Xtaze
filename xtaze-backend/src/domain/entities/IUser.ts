export default interface IUser {
  _id?: string;
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  password: string;
  premium?: boolean;
  role?: "user" | "artist" | "provider" | "admin";
  isActive?: boolean; 
}
