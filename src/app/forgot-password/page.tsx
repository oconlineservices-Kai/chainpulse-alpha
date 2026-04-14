"use client";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Forgot Password</h1>
        {submitted ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">✅ Reset link sent to your email!</p>
            <a href="/login" className="text-blue-400 hover:underline">Back to Login</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
              required
            />
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
              Send Reset Link
            </button>
            <p className="text-center text-gray-400">
              <a href="/login" className="text-blue-400 hover:underline">Back to Login</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
