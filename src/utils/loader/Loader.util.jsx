import { memo } from "react";

const Loader = ({
  size = 24,
  color = "var(--primary)",
  style,
  className = "",
}) => (
  <div
    role="status"
    aria-label="Loading"
    className={`flex items-center justify-center w-full h-full ${className}`}
    style={style}
  >
    <div
      className="animate-spin rounded-full border-2 border-white/20"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderLeftColor: color,
      }}
    />
  </div>
);

export default memo(Loader);
