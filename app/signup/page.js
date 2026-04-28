"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignupForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Signup failed.");
      }

      setSuccess("Account created. You can log in now.");
      setTimeout(() => {
        router.push(`/login?next=${encodeURIComponent(next)}`);
      }, 600);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mo-login-form">
      <div className="segmented" role="tablist" aria-label="Auth tabs">
        <button
          type="button"
          className="segmented-item"
          role="tab"
          aria-selected="false"
          onClick={() => router.push(`/login?next=${encodeURIComponent(next)}`)}
        >
          Login
        </button>
        <button
          type="button"
          className="segmented-item active"
          role="tab"
          aria-selected="true"
        >
          Sign Up
        </button>
      </div>

      <div className="input-row">
        <input
          aria-label="Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="input-row">
        <input
          aria-label="Email Address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-row">
        <input
          aria-label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="input-row">
        <input
          aria-label="Confirm Password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      ) : null}

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? "Creating…" : "Create account"}
      </button>

      <div className="helper">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Login</Link>
      </div>
    </form>
  );
}

export default function SignupPage() {
  return (
    <main className="login-view">
      <section className="mo-login-card">
        <div className="mo-login-icon" aria-hidden>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 12c2.5 0 4.5-1.7 4.5-3.8S14.5 4.5 12 4.5 7.5 6.2 7.5 8.2 9.5 12 12 12Z" />
            <path d="M4.5 20a9.2 9.2 0 0 1 15 0" />
          </svg>
        </div>

        <h1>Create your account</h1>
        <p className="mo-login-subtitle">Sign up to get started</p>

        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </section>
    </main>
  );
}

