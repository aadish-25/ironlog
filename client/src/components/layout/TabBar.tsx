import { NavLink } from "react-router-dom";
import { Home, Calendar, Dumbbell, Sparkles, User } from "lucide-react";

export function TabBar() {
  const links = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/splits", icon: Calendar, label: "Splits" },
    { to: "/exercises", icon: Dumbbell, label: "Exercises" },
    { to: "/coach", icon: Sparkles, label: "AI Coach" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-[82px] bg-bg/95 backdrop-blur-md border-t border-border flex items-start pt-[14px] px-6 justify-between z-50">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 cursor-pointer transition-colors duration-200 ${
                isActive ? "text-heat" : "text-ghost hover:text-dim"
              }`
            }
          >
            <Icon size={20} className="stroke-[2.2px]" />
            <span className="text-[9px] font-semibold uppercase tracking-[1px]">
              {link.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
