/**
 * @file Toast.util.js
 * @module Utils/Toast
 * @description Consistent, premium-styled toast helpers built on react-hot-toast.
 */

import toast from "react-hot-toast";

const buildMessage = (title, subtitle) => (
  <div className="flex flex-col">
    <span className="font-bold text-sm">{title}</span>
    {subtitle && (
      <span className="text-xs font-medium opacity-90 mt-0.5">{subtitle}</span>
    )}
  </div>
);

const WARNING_CLASS =
  "!bg-gradient-to-r !from-[#b45309] !to-[#d97706] !text-white !border !border-white/10";
const INFO_CLASS =
  "!bg-gradient-to-r !from-[#0369a1] !to-[#0ea5e9] !text-white !border !border-white/10";

export const Toast = {
  success: (title, subtitle) => toast.success(buildMessage(title, subtitle)),
  error: (title, subtitle) => toast.error(buildMessage(title, subtitle)),

  warning: (title, subtitle) =>
    toast(buildMessage(title, subtitle), {
      icon: "⚡",
      className: WARNING_CLASS,
      duration: 4500,
    }),

  info: (title, subtitle) =>
    toast(buildMessage(title, subtitle), {
      icon: "ℹ️",
      className: INFO_CLASS,
      duration: 3200,
    }),

  loading: (title) => toast.loading(title),
  dismiss: (id) => toast.dismiss(id),
};

export default Toast;
