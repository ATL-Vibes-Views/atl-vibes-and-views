"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

function SignupPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setSuccess(true);
    }
  }

  async function handleGoogleSignup() {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) setError(authError.message);
  }

  return (
    <div className="bg-[#f8f5f0] min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white shadow-sm p-8 md:p-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="font-display text-2xl font-bold text-black">
              ATL Vibes &amp; Views
            </h2>
          </Link>
          <h1 className="font-display text-3xl font-bold text-black mt-4">
            Create Your Account
          </h1>
        </div>

        {success ? (
          <div className="text-center py-6">
            <p className="text-green-600 text-sm font-medium mb-4">
              Check your email to confirm your account.
            </p>
            <Link
              href="/login"
              className="text-[#c1121f] text-sm font-semibold hover:text-black transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            {/* Google Sign-Up */}
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 text-sm font-medium text-gray-dark hover:bg-gray-50 transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-mid uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#e6c46d] transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#e6c46d] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-dark uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 text-sm outline-none focus:border-[#e6c46d] transition-colors"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#c1121f] text-white text-xs font-semibold uppercase tracking-[0.1em] hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Sign Up"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-mid mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#c1121f] font-semibold hover:text-black transition-colors"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="bg-[#f8f5f0] min-h-[60vh] flex items-center justify-center">Loading…</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
