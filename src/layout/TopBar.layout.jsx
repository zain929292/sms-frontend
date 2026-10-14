import React, { memo, useCallback, useState } from "react";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";
import UserProfileModal from "../utils/modals/user-modal/User.modal.util.jsx";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Topbar = ({
  onToggleSidebar,
  userName: fallbackName = "Sana Mahmood",
  userRole: fallbackRole = "Hospital Administrator",
  onSignOut,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const user = useSelector((state) => state.auth?.user);

  const name = user?.name || fallbackName;
  const role = user?.role || fallbackRole;

  const toggleProfile = useCallback(
    () => setIsProfileOpen((prev) => !prev),
    [],
  );
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  return (
    <header
      className="sticky top-0 z-30 w-full px-6 py-5 flex items-center justify-between gap-4 border-b select-none"
      style={{
        backgroundColor: "var(--white)",
        borderColor: "var(--gray)",
      }}
    >
      {/* Mobile Toggle */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={toggleProfile}
            className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ backgroundColor: "#0B1221", color: "var(--white)" }}
            >
              {getInitials(name)}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span
                className="text-sm font-bold truncate leading-tight"
                style={{ color: "var(--dark)" }}
              >
                {name}
              </span>
              <span className="text-xs text-slate-400 truncate mt-0.5">
                {role}
              </span>
            </div>
          </button>

          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={closeProfile}
            userName={name}
            userRole={role}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  );
};

export default memo(Topbar);
