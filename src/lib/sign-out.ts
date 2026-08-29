"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { useToast } from "@/components/Toast";
import { useLocale } from "@/lib/i18n/context";

/**
 * Shared sign-out action: clears the Firebase session, redirects to /login, and
 * toasts. No-op-safe when Firebase isn't configured (mock mode) — the redirect
 * still happens so the caller can leave a protected route.
 */
export function useSignOut() {
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useLocale();

  return async function handleSignOut(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {
        // Session already gone — redirect regardless.
      }
    }
    showToast(t("toast.signedOut"));
    router.push("/login");
  };
}
