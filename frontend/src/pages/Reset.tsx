import { useState } from "react";

export default function Reset() {
  const [msgState, setMsgState] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit() {
    setIsLoading(true);
    setError("");

    const emailData = email.trim();

    // Basic email validation
    if (!emailData || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailData }),
      });

      if (res.ok) {
        setMsgState(true);
      } else {
        setMsgState(true);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setMsgState(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !msgState) {
      handleSubmit();
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      <div
        className="w-full max-w-sm space-y-4 rounded-2xl border border-[rgba(30,195,255,0.35)] bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur"
        aria-labelledby="login-title"
      >
        <h1 id="login-title" className="text-xl font-semibold text-white">
          Reset Password
        </h1>

        <label className="block space-y-1">
          <span className="text-sm text-gray-200">Email</span>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full rounded-lg border border-[rgba(30,195,255,0.35)] bg-[#072335] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-[rgba(30,195,255,0.45)]"
            placeholder="player1@email.com"
            disabled={isLoading || msgState}
            required
          />
        </label>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || msgState}
          className="w-full rounded-lg bg-[#1ec3ff]/80 px-4 py-2 font-medium text-slate-900 hover:bg-[#1ec3ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Submit"}
        </button>
      </div>
      <p
        className={
          (msgState ? "" : "hidden ") +
          "msg justify-bottom mt-10 flex content-end text-sm text-gray-300"
        }
      >
        If there was an account associated with the entered email address, a
        password reset email was sent.
      </p>
    </div>
  );
}
