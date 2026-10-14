import React from "react";

export const WelcomeBanner = ({
  greeting,
  userName ,
  roleKey,
  today ,
  showPendingTasks = true,
  pendingCount = 5,
  isTeacher = false,
  ROLE_MESSAGE,
}) => (
  <div className="bg-gradient-to-r from-[#034A52] to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-teal-900/20">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {userName}! 👋
        </h1>
        <p className="text-teal-100 mt-2">
          {ROLE_MESSAGE[roleKey] || "Here's what's happening at your school today."}
        </p>
        <p className="text-teal-200 text-sm mt-1">{today}</p>
      </div>

      {showPendingTasks && (
        <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/10 min-w-[140px]">
          <p className="text-4xl font-bold">{pendingCount}</p>
          <p className="text-xs text-teal-100 uppercase tracking-wider mt-1">
            {isTeacher ? "Pending Assignments" : "Pending Tasks"}
          </p>
        </div>
      )}
    </div>
  </div>
);

export default WelcomeBanner;