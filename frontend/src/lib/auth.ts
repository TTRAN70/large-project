// frontend/src/lib/auth.ts
export type AuthToken = { token: string; expiry: Date };
import { jwtDecode } from "jwt-decode";
const KEY = "user_token";
const USERNAME = "";

type User = {
  id: string,
  username: string,
  email: string,
}

function notify() {
  window.dispatchEvent(new Event("auth:change"));
}

export const auth = {
  get token(): AuthToken | null {
    try {
      const rawToken = localStorage.getItem(KEY);
      if (rawToken) {
        const token: AuthToken = JSON.parse(rawToken);
        return token;
      } else throw -1;
    } catch {
      return null;
    }
  },
  get username(): string {
    try {
      const username = localStorage.getItem(USERNAME);
      if (username) {
        return username;
      } else return "";
    } catch {
      return "";
    }
  },
  get id(): string {
    try {
      const tok = auth.token;
      if (tok) {
        const decodedTok : User = jwtDecode(tok.token) as User;
        return decodedTok.id;
      } else return "";
    } catch {
      return "";
    }
  },
  setUsername(username: string) {
    localStorage.setItem(USERNAME, username);
  },
  login(tok: string, username: string) {
    const expiration: Date = new Date();
    expiration.setDate(expiration.getDate() + 1);
    const token: AuthToken = { token: tok, expiry: expiration };
    localStorage.setItem(KEY, JSON.stringify(token));
    localStorage.setItem(USERNAME, username);
    notify();
  },
  check_if_expired() {
    //todo
  },
  logout() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USERNAME);
    notify();
  },
};
