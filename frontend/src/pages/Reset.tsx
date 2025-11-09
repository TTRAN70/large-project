import { useState } from "react";

export default function Reset() {
  const [msgState, setMsgState] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailData = String(formData.get("email") || "").trim();

    const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({email: emailData})
    });

    if(res.status){
        setMsgState(!msgState);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[rgba(30,195,255,0.35)] bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur"
        aria-labelledby="login-title"
>
        <h1 id="login-title" className="text-xl font-semibold text-white">Reset Password</h1>

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Email</span>
          <input
            name="username"
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="player1@email.com"
            required
          />
        </label>

        <button type="submit" className="w-full rounded-lg bg-[#1ec3ff]/80 px-4 py-2 font-medium text-slate-900 hover:bg-[#1ec3ff]">
          Submit
        </button>
      </form>
      <p className={(msgState == true ? "hidden " : "") + "msg flex mt-10 justify-bottom content-end text-sm text-gray-300"}>
        If there was an account associated with the entered email address, a password reset email was sent. 
      </p>
    </div>
  );
}
