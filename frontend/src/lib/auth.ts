// frontend/src/lib/auth.ts
export type AuthToken = { token: string , expiry: Date};

const KEY ="user_token";

function notify() {
  window.dispatchEvent(new Event("auth:change"));
}

export const auth = {
  get token(): AuthToken | null {
    try { 
      const rawToken = localStorage.getItem(KEY);
      if(rawToken){
        const token : AuthToken = JSON.parse(rawToken);
        return token;
      }
      else  
        throw -1;}
    catch { return null; }
  },
  login(tok: string) {
    let expiration : Date = new Date();
    expiration.setDate(expiration.getDate() + 1);
    const token : AuthToken = {token : tok, expiry: expiration} 
    localStorage.setItem(KEY, JSON.stringify(token));
    notify();
  },
  check_if_expired() {
    //todo
  },
  logout() {
    localStorage.removeItem(KEY);
    notify();
  },
};