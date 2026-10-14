import React from "react";

export const ChartsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {[0, 1].map((i) => (
      <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200/80 p-6">
        <div className="h-4 w-40 rounded bg-slate-100 animate-pulse mb-4" />
        <div className="h-60 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    ))}
  </div>
);