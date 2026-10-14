import React from "react";

export const ErrorBanner = ({ onRetry }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
    <span>Some dashboard data couldn't be loaded.</span>
    <button type="button" onClick={onRetry} className="font-semibold underline">
      Retry
    </button>
  </div>
);