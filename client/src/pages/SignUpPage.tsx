import { useEffect, useRef, useState } from "react";
import { SignUp, useClerk, useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import logo from "../assets/logo.png";
import { dark } from "@clerk/themes";
import { motion } from "motion/react";
import { loginWithNativeGoogle, initNativeSocialLogin } from "../services/nativeAuth";
import { api } from "../services/api";

/**
 * SignUpPage Component
 * 
 * Manages user registration for both Web and Android (Capacitor) platforms:
 * 
 * 1. Web Flow:
 *    - Uses standard Clerk `<SignUp />` component with email/password and web Google OAuth.
 * 
 * 2. Android Native Flow (Capacitor):
 *    - Renders the EXACT same Clerk card UI for visual consistency.
 *    - Intercepts clicks on the Google button via capture-phase event listener.
 *    - Invokes Android Credential Manager natively (`@capgo/capacitor-social-login`).
 *    - Exchanges the Google ID token with backend `/api/auth/google-native`.
 *    - The backend provisions a new Clerk account (or finds the existing one) and issues a ticket.
 *    - The ticket is consumed via `signIn.create({ strategy: 'ticket' })` to activate the session directly.
 */
export function SignUpPage() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clear stale workout caches on initial load & warm up Android native social login
  useEffect(() => {
    localStorage.removeItem("ironlog_swr_cache");
    localStorage.removeItem("ironlog_prefetch_timestamp");
    if (Capacitor.isNativePlatform()) {
      initNativeSocialLogin();
    }
  }, []);

  /**
   * Performs native Google Sign-Up/Sign-In via Android Credential Manager,
   * followed by server-side user provisioning and Clerk session activation.
   */
  const handleNativeGoogleSignUp = async () => {
    if (isGoogleLoading) return;
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);

      // Trigger native Android account selection bottom-sheet
      const idToken = await loginWithNativeGoogle();
      if (!idToken) {
        setIsGoogleLoading(false);
        return;
      }

      // Exchange Google ID Token with backend for Clerk sign-in ticket
      const authRes = await api.post("/auth/google-native", { idToken });
      const token = authRes.data?.token;

      if (!token) {
        throw new Error(authRes.data?.error || "Failed to retrieve registration ticket from server");
      }

      if (!signIn) {
        throw new Error("Authentication service is initializing. Please try again.");
      }

      // Consume the Clerk ticket to activate the user session
      const res = await signIn.create({
        strategy: "ticket",
        ticket: token,
      });

      if (res.status === "complete" && res.createdSessionId) {
        await clerk.setActive({ session: res.createdSessionId });
        navigate("/");
        return;
      } else {
        throw new Error(`Sign-up status: ${res.status}`);
      }
    } catch (err: unknown) {
      console.error("Native Google sign-up failed:", err);
      const e = err as {
        code?: string;
        response?: { data?: { error?: string } };
        message?: string;
        errors?: Array<{ longMessage?: string; message?: string }>;
      };

      // Suppress error message if the user simply dismissed the account picker modal
      if (
        e?.code === "USER_CANCELLED" ||
        e?.message?.toLowerCase().includes("cancel") ||
        e?.message?.toLowerCase().includes("closed")
      ) {
        return;
      }

      const detail =
        e?.response?.data?.error ||
        e?.errors?.[0]?.longMessage ||
        e?.errors?.[0]?.message ||
        e?.message ||
        "Google sign-up failed. Please verify your connection.";

      setGoogleError(detail);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /**
   * On Native Android, intercept clicks on Clerk's social button inside the card.
   * 
   * Capturing the event prevents Clerk's default web redirect while maintaining
   * 100% visual consistency with the Clerk card UI.
   */
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const container = containerRef.current;
    if (!container) return;

    const handleIntercept = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const socialBtn = target?.closest?.(
        "button.cl-socialButtonsBlockButton, .cl-socialButtonsBlockButton, .cl-socialButtonsRoot button, .cl-socialButtons button, [data-localization-key*='socialButtonsBlockButton']"
      );

      if (socialBtn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleNativeGoogleSignUp();
      }
    };

    container.addEventListener("click", handleIntercept, true);
    return () => {
      container.removeEventListener("click", handleIntercept, true);
    };
  }, [signIn, isGoogleLoading]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-bg relative overflow-hidden px-4">
      {/* Background glowing effects */}
      <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] bg-heat/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-20%] w-[60%] h-[60%] bg-skip/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-[400px]"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <img src={logo} alt="IronLog Logo" className="w-[60px] h-[60px] object-contain mb-4" />
          <h1 className="font-display text-5xl tracking-wider text-ink mb-2">
            IRON<span className="text-heat">LOG</span>
          </h1>
          <p className="font-body text-dim text-sm uppercase tracking-[0.2em]">Forge Your Legacy</p>
        </div>

        {/* Loading Indicator during native Google auth */}
        {isGoogleLoading && (
          <div className="mb-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-raised border border-heat/30 text-ink text-xs font-body animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-heat border-t-transparent rounded-full animate-spin" />
            <span>Connecting with Google...</span>
          </div>
        )}

        {/* Error notification banner */}
        {googleError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-body">
            {googleError}
          </div>
        )}

        {/* Clerk Sign-Up Component Container */}
        <div ref={containerRef}>
          <SignUp
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#e8460a', /* heat */
                colorBackground: '#161616', /* card */
                colorInputBackground: '#1a1a1a', /* raised */
                colorInputText: '#ffffff', /* ink */
                colorText: '#ffffff',
                colorTextSecondary: '#666666', /* dim */
                borderRadius: '0.75rem',
              },
              elements: {
                card: 'border border-border/20 shadow-2xl bg-card/90 backdrop-blur-xl w-full',
                headerTitle: 'font-display text-3xl tracking-wide',
                headerSubtitle: 'font-body',
                formButtonPrimary: 'font-body font-semibold tracking-wide shadow-lg shadow-heat/20',
                socialButtonsBlockButton: 'border-border/40 hover:bg-raised transition-colors',
              }
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/"
          />
        </div>
      </motion.div>
    </div>
  );
}
