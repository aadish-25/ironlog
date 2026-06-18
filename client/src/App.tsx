import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import { HomePage }      from "./pages/HomePage";
import { SplitsPage }    from "./pages/SplitsPage";
import { SessionPage }   from "./pages/SessionPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { HistoryPage }   from "./pages/HistoryPage";
import { ProfilePage }   from "./pages/ProfilePage";
import { AICoachPage }   from "./pages/AICoachPage";

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    // TODO: replace with your AuthPage once built
    return <div className="text-ink font-body p-8">Sign in required.</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<HomePage />} />
        <Route path="/splits"     element={<SplitsPage />} />
        <Route path="/session"    element={<SessionPage />} />
        <Route path="/exercises"  element={<ExercisesPage />} />
        <Route path="/history"    element={<HistoryPage />} />
        <Route path="/profile"    element={<ProfilePage />} />
        <Route path="/coach"      element={<AICoachPage />} />
        <Route path="*"           element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}