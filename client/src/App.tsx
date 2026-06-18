import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppLayout }     from "./components/layout/AppLayout";
import { HomePage }      from "./pages/HomePage";
import { SplitsPage }    from "./pages/SplitsPage";
import { SessionPage }   from "./pages/SessionPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { HistoryPage }   from "./pages/HistoryPage";
import { ProfilePage }   from "./pages/ProfilePage";
import { AICoachPage }   from "./pages/AICoachPage";

// DEV BYPASS: Auth check removed for UI preview. Re-enable before shipping.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
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