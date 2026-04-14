"use client";
import { useState } from "react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Reset Password</h1>
        {submitted ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">✅ Password reset successfully!</p>
            <a href="/login" className="text-blue-400 hover:underline">Go to Login</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
              required
              minLength={8}
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
