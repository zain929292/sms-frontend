import React, { memo } from "react";
import { Calendar, HeartPulse } from "lucide-react";
import { RecentCard } from "./RecentCard";
import { ROUTES } from "../../constants/dashboard/constants";

export const RecentActivitySection = memo(
  ({
    showAppointments,
    showAdmissions,
    isDoctor,
    recentAppointments,
    recentAdmissions,
    loaded,
  }) => {
    if (!showAppointments && !showAdmissions) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {showAppointments && (
          <RecentCard
            title={isDoctor ? "My Recent Appointments" : "Recent Appointments"}
            Icon={Calendar}
            iconClass="text-blue-600"
            linkClass="text-blue-600 hover:text-blue-700"
            to={ROUTES.appointments}
            rows={recentAppointments}
            emptyText="No recent appointments found."
            avatarClass="bg-blue-500/10 text-blue-600"
            loading={!loaded.appointments}
          />
        )}
        {showAdmissions && (
          <RecentCard
            title={isDoctor ? "My Recent Admissions" : "Recent Admissions"}
            Icon={HeartPulse}
            iconClass="text-teal-600"
            linkClass="text-teal-600 hover:text-teal-700"
            to={ROUTES.admissions}
            rows={recentAdmissions}
            emptyText="No recent admissions found."
            avatarClass="bg-teal-500/10 text-teal-600"
            loading={!loaded.admissions}
          />
        )}
      </div>
    );
  }
);

RecentActivitySection.displayName = "RecentActivitySection";