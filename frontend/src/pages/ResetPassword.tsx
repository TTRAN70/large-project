import { useState } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020c14] text-[#ff9b9b]">
        Invalid reset link.
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const body = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(body.error || body.message || "Invalid or expired link.");
      }

      setMessage("Password reset successful! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
    <div className="w-full max-w-md rounded-2xl border border-[#1ec3ff]/25 bg-[rgba(5,22,33,0.98)] p-8 shadow-2xl">
      <h1 className="text-2xl font-semibold text-white">Set new password</h1>
      <p className="mt-2 text-sm text-[#9fdcff]">
        Choose a new password for your account.
      </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#9fdcff]" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1ec3ff]/30 bg-[#020c14] px-3 py-2 text-sm text-white outline-none focus:border-[#1ec3ff] focus:ring-1 focus:ring-[#1ec3ff]"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-[#1ec3ff] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#53d4ff] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
