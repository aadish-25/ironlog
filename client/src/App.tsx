import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/clerk-react";
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

import { usePrefetchOnLogin } from "./hooks/usePrefetch";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
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

export default function App() {
  usePrefetchOnLogin();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AxiosInterceptor />
      <Routes>
        {/* Public Routes */}
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