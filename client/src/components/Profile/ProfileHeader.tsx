interface ProfileHeaderProps {
  userName: string | null;
  memberSince: string | null;
  totalSessions: number | null;
  currentStreak: number | null;
  profilePicUrl?: string | null;
}

export function ProfileHeader({
  userName,
  memberSince,
  totalSessions,
  currentStreak,
  profilePicUrl,
}: ProfileHeaderProps) {
  return (
    <header className="flex flex-col items-center px-5 pt-5 pb-5">
      {/* Avatar */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full bg-raised border-2 border-border flex items-center justify-center cursor-pointer overflow-hidden">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display text-[32px] text-heat tracking-[1px]">
              {userName ? userName[0].toUpperCase() : "U"}
            </span>
          )}
        </div>
        {/* Streak badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-heat rounded-full px-2.5 py-[3px] flex items-center gap-1 whitespace-nowrap border-2 border-bg">
          <span className="text-[10px]">🔥</span>
          <span className="text-[11px] font-semibold text-white">
            {currentStreak ?? 0} day streak
          </span>
        </div>
      </div>

      {/* Name */}
      <h1 className="mt-3.5 text-[22px] font-display tracking-[1.5px] text-white">
        {userName ?? "User"}
      </h1>

      {/* Subtitle */}
      <p className="text-xs text-heat mt-1">
        {memberSince
          ? `Member since ${memberSince} · ${totalSessions ?? 0} sessions`
          : "Welcome to IronLog"}
      </p>
      <p className="text-xs text-ghost italic mt-[3px]">
        Track your lifts. Own your progress.
      </p>
    </header>
  );
}
