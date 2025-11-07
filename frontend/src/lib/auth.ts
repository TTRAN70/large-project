// frontend/src/lib/auth.ts
export type User = { username: string; bio?: string };

const KEY = "gb_user";

function notify() {
  window.dispatchEvent(new Event("auth:change"));
}

export const auth = {
  get user(): User | null {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
    catch { return null; }
  },
  login(user: User) {
    localStorage.setItem(KEY, JSON.stringify(user));
    notify();
  },
  update(partial: Partial<User>) {
    const current = this.user;
    if (!current) return;
    const next = { ...current, ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    notify();
  },
  logout() {
    localStorage.removeItem(KEY);
    notify();
  },
};
