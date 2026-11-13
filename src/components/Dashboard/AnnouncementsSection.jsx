
import React from "react";
import { Bell, ArrowUpRight, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";

const AnnouncementsSection = ({
  announcements = [],
  loading = false,
}) => {
  const tickerItems = announcements.filter(
    (item) => item.notice?.trim(),
  );

  const hasAnnouncements = tickerItems.length > 0;

  return (
    <section className="group flex min-w-0 items-center overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-r from-white via-white to-teal-50/60 shadow-sm transition-shadow hover:shadow-md">

      {/* Icon & Label */}
      <div className="flex shrink-0 items-center gap-2.5 border-r border-teal-100 px-3 py-3 sm:px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-sm">
          <Megaphone size={17} />
        </div>

        <div className="hidden sm:block">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
            Announcements
          </p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500">
              Latest Updates
            </span>
          </div>
        </div>

        <div className="sm:hidden">
          <Bell size={17} className="text-teal-700" />
        </div>
      </div>

      {/* Announcement Content */}
      <div className="min-w-0 flex-1 px-3 py-3 sm:px-4">
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
            <p className="text-xs text-slate-400">
              Loading announcements...
            </p>
          </div>
        ) : !hasAnnouncements ? (
          <div className="flex items-center gap-2">
            <Bell size={15} className="shrink-0 text-slate-400" />
            <p className="text-xs text-slate-500">
              No announcements available at the moment.
            </p>
          </div>
        ) : (
          <div className="announcement-marquee">
            <div className="announcement-marquee-track">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center"
                >
                  {tickerItems.map((item) => (
                    <div
                      key={`${copy}-${item.id}`}
                      className="inline-flex shrink-0 items-center gap-2 pr-10"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />

                      <span className="text-sm font-semibold text-slate-700">
                        {item.notice}
                      </span>

                      <span className="ml-1 rounded-md bg-teal-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700">
                        Update
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View All */}
      <Link
        to="/overview/announcements"
        className="flex shrink-0 items-center gap-1.5 border-l border-teal-100 px-3 py-3 text-[11px] font-bold text-teal-700 transition hover:bg-teal-50 hover:text-teal-900 sm:px-4"
      >
        <span className="hidden sm:inline">View All</span>
        <ArrowUpRight size={15} />
      </Link>
    </section>
  );
};

export default AnnouncementsSection;
