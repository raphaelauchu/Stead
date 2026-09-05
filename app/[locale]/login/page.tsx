"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import InfinityMark from "@/components/InfinityMark";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const GOAL_KEYS = ["corps", "esprit", "coeur", "ame"] as const;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const tGoals = useTranslations("goals");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [goal, setGoal] = useState("");

  function translateError(message: string) {
    if (message.includes("Invalid login credentials"))
      return t("errors.invalidCredentials");
    if (message.includes("User already registered"))
      return t("errors.userExists");
    if (message.includes("Password should be at least"))
      return t("errors.passwordTooShort");
    return message;
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setError("");
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(translateError(error.message));
    } else {
      router.refresh();
      router.push("/");
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!goal) {
      setError(t("goalRequired"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });

    if (error) {
      setError(translateError(error.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        goal,
      });
    }

    setLoading(false);

    if (!data.session) {
      setError(t("confirmEmail"));
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-2 flex w-full max-w-sm justify-end">
        <LanguageSwitcher />
      </div>
      <InfinityMark className="w-14 text-accent" />
      <h1 className="mt-4 font-display text-3xl text-ink">STEAD</h1>

      <div className="mt-8 flex w-full max-w-sm rounded-lg border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "signin" ? "bg-accent text-bg" : "text-inkdim"
          }`}
        >
          {t("signIn")}
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            mode === "signup" ? "bg-accent text-bg" : "text-inkdim"
          }`}
        >
          {t("signUp")}
        </button>
      </div>

      {mode === "signin" ? (
        <form
          onSubmit={handleSignIn}
          className="mt-6 flex w-full max-w-sm flex-col gap-3"
        >
          <input
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {loading ? t("signInLoading") : t("signIn")}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      ) : (
        <form
          onSubmit={handleSignUp}
          className="mt-6 flex w-full max-w-sm flex-col gap-3"
        >
          <div className="flex gap-3">
            <input
              type="text"
              required
              placeholder={t("firstNamePlaceholder")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-1/2 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              required
              placeholder={t("lastNamePlaceholder")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-1/2 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
            />
          </div>
          <input
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder={t("passwordPlaceholderMin")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-inkdim focus:outline-none focus:border-accent"
          />

          <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-inkdim">
            {t("goalQuestion")}
          </div>
          <div className="flex flex-col gap-2">
            {GOAL_KEYS.map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                  goal === key
                    ? "border-accent text-ink"
                    : "border-line text-inkdim"
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  value={key}
                  checked={goal === key}
                  onChange={() => setGoal(key)}
                  className="accent-accent"
                />
                {tGoals(key)}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {loading ? t("signUpLoading") : t("signUpButton")}
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      )}
    </main>
  );
}
