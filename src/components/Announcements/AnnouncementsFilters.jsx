
import { Bell } from "lucide-react";
import FilterBar from "../../utils/filter/FilterBar.util";

const AnnouncementsFilters = ({
  searchTerm,
  isDropdownOpen,
  setIsDropdownOpen,
  filteredAnnouncements,
  selectedAnnouncementId,
  onSearchChange,
  onClearSearch,
  onSelectAnnouncement,
  onClearAll,
}) => {
  const filterConfig = {
    picker: {
      label: "Quick Announcement Lookup",
      searchTerm,
      onSearchChange,
      onClearSearch,
      placeholder: "Search by notice, audience or status...",
      isOpen: isDropdownOpen,
      setIsOpen: setIsDropdownOpen,
      items: filteredAnnouncements,
      onSelectItem: onSelectAnnouncement,
      emptyMessage: "No matching announcements found.",
      itemRenderer: (announcement) => (
        <>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Bell size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {announcement.notice}
              </p>

              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {announcement.audience || "All"} ·{" "}
                {announcement.status || "Unknown"}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs text-slate-400">
            ID: {announcement.id}
          </span>
        </>
      ),
    },

    hasFilters:
      Boolean(searchTerm) || Boolean(selectedAnnouncementId),

    onClearAll,
  };

  return <FilterBar {...filterConfig} />;
};

export default AnnouncementsFilters;
