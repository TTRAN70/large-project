import { type Game } from "./games";
export type User = { 
  _id: string; 
  username: string;
  email: string;
  bio?: string;
  isVerified: boolean;
  following: string [];
  followers: string [];
  playlist: Game [];
 };
