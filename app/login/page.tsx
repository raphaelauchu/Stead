"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import InfinityMark from "@/components/InfinityMark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <InfinityMark className="w-16 text-accent" />
      <h1 className="mt-6 font-display text-3xl text-ink">STEAD</h1>

      {sent ? (
        <p className="mt-6 max-w-xs text-center text-sm text-inkdim">
          Regarde ta boîte courriel — on t&apos;a envoyé un lien pour te
          connecter.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex w-full max-w-xs flex-col gap-3"
        >
          <input
            type="email"
            required
            placeholder="ton@courriel.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg"
          >
            Envoie-moi un lien
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </main>
  );
}
