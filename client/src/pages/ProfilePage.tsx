import { useState } from "react";
import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { ProfileHeader } from "../components/Profile/ProfileHeader";
import { JourneyStrip } from "../components/Profile/JourneyStrip";
import { MonthlyStats } from "../components/Profile/MonthlyStats";
import { SettingsList } from "../components/Profile/SettingsList";
import { EditProfileView } from "../components/Profile/EditProfileView";
import { StaticProfileView } from "../components/Profile/StaticProfileView";
import type { StatCard, SettingsItem } from "../components/Profile/types";
import { useProfile } from "../hooks/useProfile";
import { api } from "../services/api";

// ─── Component ────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { signOut } = useClerk();
  const { user, stats, daysSinceJoined, memberSince, loading } = useProfile();
  const [activeTab, setActiveTab] = useState<"edit" | "privacy" | "help" | "about" | null>(null);
  
  // State for notifications toggle to allow optimistic UI updates
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notifications_enabled ?? false);

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
    { icon: "✏️", label: "Edit profile", onClick: () => setActiveTab("edit") },
    { icon: "🔒", label: "Privacy & data", onClick: () => setActiveTab("privacy") },
  ];

  const preferenceItems: SettingsItem[] = [
    { icon: "❓", label: "Help & support", onClick: () => setActiveTab("help") },
    { icon: "ℹ️", label: "About", onClick: () => setActiveTab("about") },
  ];

  const handleToggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue); // Optimistic
    try {
      await api.patch("/users/me", { notifications_enabled: newValue });
    } catch (e) {
      console.error("Failed to toggle notifications", e);
      setNotificationsEnabled(!newValue); // Revert on failure
    }
  };

  const handleLogout = () => {
    signOut();
  };

  const handleSaveName = async (newName: string) => {
    await api.patch("/users/me", { name: newName });
    window.location.reload();
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
          profilePicUrl={user?.profile_picture_url}
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

      {/* ── Overlays ── */}
      {activeTab === "edit" && (
        <EditProfileView
          currentName={userName}
          currentProfilePic={user?.profile_picture_url || null}
          onBack={() => setActiveTab(null)}
          onSave={handleSaveName}
        />
      )}
      {activeTab === "privacy" && (
        <StaticProfileView title="Privacy & Data" onBack={() => setActiveTab(null)}>
          <p className="mb-4">
            Your workout data is stored securely on our servers. We do not sell your personal data to third parties.
          </p>
          <p>
            To request a complete export of your data or to delete your account permanently, please contact support.
          </p>
        </StaticProfileView>
      )}
      {activeTab === "help" && (
        <StaticProfileView title="Help & Support" onBack={() => setActiveTab(null)}>
          <p className="mb-4">
            If you need help using IronLog or have encountered a bug, we're here to help.
          </p>
          <p>
            Email us at <a href="mailto:support@ironlog.app" className="text-heat underline font-display">support@ironlog.app</a>.
          </p>
        </StaticProfileView>
      )}
      {activeTab === "about" && (
        <StaticProfileView title="About IronLog" onBack={() => setActiveTab(null)}>
          <p className="mb-4">
            IronLog is a progressive overload tracker built for serious lifters. It is designed to get out of your way and let you focus on the iron.
          </p>
          <p className="mb-4 text-xs font-display tracking-widest text-ghost">
            VERSION 1.0.0
          </p>
          <p className="text-xs text-ghost">
            Built by Aadish.
          </p>
        </StaticProfileView>
      )}
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
