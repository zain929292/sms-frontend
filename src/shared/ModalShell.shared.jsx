/**
 * @file ModalShell.jsx
 * @module Utils/Modals/ModalShell
 * @description Reusable modal shell with backdrop, animation, and header.
 */

import { X } from "lucide-react";
import { useModalAnimation } from "./useModalAnimation.hook";

const ModalShell = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconClass = "from-[#034A52] to-teal-500",
  accentShadow = "shadow-teal-900/20",
  maxWidth = "max-w-lg",
  disabled = false,
  children,
}) => {
  const { shouldRender, isAnimating } = useModalAnimation(isOpen);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isAnimating
          ? "bg-slate-900/60 backdrop-blur-md opacity-100"
          : "bg-slate-900/0 backdrop-blur-none opacity-0"
      }`}
      onClick={disabled ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full ${maxWidth} max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&-::-webkit-scrollbar]:hidden transform transition-all duration-300 ease-out ${
          isAnimating
            ? `scale-100 translate-y-0 opacity-100 ${accentShadow}`
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-5 rounded-t-3xl">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${iconClass} text-white shadow-lg ${accentShadow}`}
            >
              {icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ModalShell;
