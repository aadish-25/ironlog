import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
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

export default function App() {
  return (
    <BrowserRouter>
      <AxiosInterceptor />
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          element={
            <>
              <SignedIn>
                <AppLayout />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        >
          <Route path="/"           element={<HomePage />} />
          <Route path="/splits"     element={<SplitsPage />} />
          <Route path="/session"    element={<SessionPage />} />
          <Route path="/exercises"  element={<ExercisesPage />} />
          <Route path="/history"    element={<HistoryPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/coach"      element={<AICoachPage />} />
          <Route path="*"           element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}