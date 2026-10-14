
import { memo } from "react";
import { Search } from "lucide-react";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search patients, doctors, invoices, MR numbers...",
  className = "",
  containerStyle = {},
}) => {
  return (
    <div
      className={`relative flex items-center w-full max-w-xl ${className}`}
      style={containerStyle}
    >
      <Search
        size={18}
        className="absolute left-4 pointer-events-none text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2.5 text-sm transition-all duration-200 outline-none focus:ring-2 rounded-[var(--radius-lg)] border border-[var(--gray)] bg-[var(--white)] text-[var(--dark)]"
        style={{ fontFamily: "var(--font-family)" }}
      />
    </div>
  );
};

export default memo(SearchBar);
