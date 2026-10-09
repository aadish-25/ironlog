import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { AxiosInterceptor } from "./components/Auth/AxiosInterceptor";

import { AppLayout }     from "./components/layout/AppLayout";
import { HomePage }      from "./pages/HomePage";
import { SplitsPage }    from "./pages/SplitsPage";
import { SessionPage }   from "./pages/SessionPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { HistoryPage }   from "./pages/HistoryPage";
import { ProfilePage }   from "./pages/ProfilePage";
import { AICoachPage }   from "./pages/AICoachPage";
import { SignInPage }    from "./pages/SignInPage";
import { SignUpPage }    from "./pages/SignUpPage";
import { ExerciseDetailPage } from "./pages/ExerciseDetailPage";
import { SplitDetailPage } from "./pages/SplitDetailPage";
import { SplitDayDetailPage } from "./pages/SplitDayDetailPage";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  const isHandshakeInProgress = 
    location.search.includes("__clerk_handshake") || 
    location.search.includes("__clerk_ticket") ||
    location.search.includes("sso-callback");

  if (!isLoaded || isHandshakeInProgress) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-[30px] h-[30px] bg-heat rounded-lg flex items-center justify-center font-display text-[13px] text-white tracking-[0.5px] animate-pulse">
            IL
          </div>
          <span className="text-ghost text-xs tracking-[2px] uppercase animate-pulse">
            IRONLOG
          </span>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Handles Android Hardware and Gesture Back Button:
 * - If on root/home page, exits the app.
 * - Otherwise navigates back through React Router history.
 */
function NativeBackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    CapApp.addListener("backButton", () => {
      if (location.pathname === "/" || location.pathname === "/home") {
        CapApp.exitApp();
      } else {
        navigate(-1);
      }
    }).then((sub) => {
      removeListener = () => sub.remove();
    });

    return () => {
      if (removeListener) removeListener();
    };
  }, [location.pathname, navigate]);

  return null;
}

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: "#000000" }).catch(() => {});
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <NativeBackButtonHandler />
      <AxiosInterceptor />
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in/sso-callback" element={<AuthenticateWithRedirectCallback signInForceRedirectUrl="/" />} />
        <Route path="/sign-up/sso-callback" element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl="/" />} />
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback signInForceRedirectUrl="/" />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <AuthGate>
              <AppLayout />
            </AuthGate>
          }
        >
          <Route path="/"           element={<HomePage />} />
          <Route path="/splits"     element={<SplitsPage />} />
          <Route path="/splits/:id" element={<SplitDetailPage />} />
          <Route path="/splits/:splitId/day/:dayId" element={<SplitDayDetailPage />} />
          <Route path="/session"    element={<SessionPage />} />
          <Route path="/session/:id" element={<SessionPage />} />
          <Route path="/exercises"  element={<ExercisesPage />} />
          <Route path="/exercises/:id" element={<ExerciseDetailPage />} />
          <Route path="/history"    element={<HistoryPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/coach"      element={<AICoachPage />} />
          <Route path="*"           element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}