"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/lib/user-profile";
import { useLocale } from "@/lib/i18n/context";
import { Icon } from "@/components/Icon";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const { user, status } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → land on the right area for the role.
  useEffect(() => {
    if (status === "ready" && user && !profileLoading) {
      router.replace(profile.role === "director" ? "/dashboard" : "/");
    }
  }, [status, user, profileLoading, profile.role, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!auth || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("login.fallbackError");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-surface px-4">
        <div className="absolute end-4 top-4">
          <LanguageToggle />
        </div>
        <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
          <Icon name="cloud_off" size={40} className="mx-auto text-on-surface-variant" />
          <h1 className="mt-4 text-headline-md">{t("login.notConfiguredTitle")}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t("login.notConfiguredBody", { code: ".env.local" })}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-label-lg text-on-primary"
          >
            {t("login.backToApp")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="absolute end-4 top-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-8">
        <div className="flex items-center gap-2">
          <Icon name="directions_bus" className="text-primary" />
          <h1 className="text-headline-md">{t("login.heading")}</h1>
        </div>
        <p className="mt-1 text-body-md text-on-surface-variant">{t("login.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-label-lg text-on-surface">
              {t("login.email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-14 w-full rounded-full bg-surface-container-high px-4 text-body-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-label-lg text-on-surface">
              {t("login.password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-14 w-full rounded-full bg-surface-container-high px-4 text-body-lg text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:bg-surface-container-highest focus:ring-2 focus:ring-primary"
              placeholder={t("login.passwordPlaceholder")}
            />
          </div>

          {error && (
            <p role="alert" className="text-body-md text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-label-lg text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <Icon name="progress_activity" className="animate-spin" />
            ) : (
              <Icon name="login" />
            )}
            {t("login.signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
