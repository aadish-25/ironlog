import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { JourneyStrip } from "../components/Profile/JourneyStrip";
import { MonthlyStats } from "../components/Profile/MonthlyStats";
import { SettingsList } from "../components/Profile/SettingsList";
import type { StatCard, SettingsItem } from "../components/Profile/types";
import { useProfile } from "../hooks/useProfile";

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { signOut } = useClerk();
  const { user, stats, daysSinceJoined, memberSince, loading } = useProfile();

  // ─── USER IDENTITY ──────────────────────────────────────────────────────────
  const userName = user?.name || "Lifter";
  const totalSessions = stats?.totalSessions ?? 0;
  const currentStreak = stats?.currentStreak ?? 0;

  // ─── MONTHLY STATS ──────────────────────────────────────────────────────────
  const monthlyStats: StatCard[] = [
    { icon: "→→", label: "Sessions", value: String(stats?.monthlySessions ?? 0) },
    { icon: "📅", label: "This week", value: String(stats?.weeklySessions ?? 0) },
    { icon: "🔥", label: "Best streak", value: String(stats?.bestStreak ?? 0) },
  ];

  // ─── SETTINGS ───────────────────────────────────────────────────────────────
  const accountItems: SettingsItem[] = [
    { icon: "✏️", label: "Edit profile" },
    { icon: "⚙️", label: "Units & goals" },
    { icon: "🔒", label: "Privacy & data" },
  ];

  const preferenceItems: SettingsItem[] = [
    { icon: "❓", label: "Help & support" },
    { icon: "ℹ️", label: "About" },
  ];

  const notificationsEnabled = false; // TBD

  const handleToggleNotifications = () => {};

  const handleLogout = () => {
    signOut();
  };

  if (loading && !stats) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <span className="text-white text-opacity-50 text-xs tracking-widest uppercase animate-pulse">Loading profile...</span>
      </div>
    );
  }

  return (
    <section
      className="min-h-screen bg-bg text-white font-body"
      aria-label="User profile"
    >
      <div className="overflow-y-auto pb-[120px]">
        {/* ── Identity hero ── */}
        <ProfileHeader
          userName={userName}
          memberSince={memberSince}
          totalSessions={totalSessions}
          currentStreak={currentStreak}
        />

        <div className="px-5 flex flex-col gap-3">
          {/* ── Journey strip ── */}
          <JourneyStrip
            memberSince={memberSince}
            daysSinceJoined={daysSinceJoined}
          />

          {/* ── Monthly stats ── */}
          <MonthlyStats stats={monthlyStats} />

          {/* ── Account settings ── */}
          <SettingsList title="Account" items={accountItems} />

          {/* ── Preferences ── */}
          <SettingsList
            title="Preferences"
            items={preferenceItems}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
          />

          {/* ── Log out ── */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-[#141414] border border-border rounded-xl text-[#e05252] text-sm cursor-pointer font-body flex items-center justify-center gap-2 hover:bg-raised transition-colors"
            aria-label="Log out"
          >
            <LogOut size={16} className="text-[#e05252]" />
            Log out
          </button>

          <p className="text-center text-[11px] text-ghost/30 py-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </section>
  );
}

/*
─────────────────────────────────────────
ANSWERS (read only after you've thought through the TODOs above)
─────────────────────────────────────────
userName               → Clerk's useUser().user.firstName or GET /api/users/me → users.name
memberSince            → GET /api/users/me → users.created_at, format with toLocaleDateString
totalSessions          → GET /api/sessions → count all non-skipped sessions for the user
currentStreak          → GET /api/users/me or a dedicated /api/users/me/streak endpoint that counts consecutive session days
daysSinceJoined        → client-side: Math.floor((Date.now() - new Date(users.created_at).getTime()) / 86400000)
monthlyStats           → GET /api/sessions?month=YYYY-MM, aggregate: COUNT sessions, filter for current week, MAX consecutive days
notificationsEnabled   → GET /api/users/me → users.notifications_enabled (boolean column) or local storage
handleToggleNotifications → PATCH /api/users/me { notifications_enabled: !current }
handleLogout           → Clerk's useClerk().signOut() — no backend call needed
─────────────────────────────────────────
*/
