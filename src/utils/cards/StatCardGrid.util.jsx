/**
 * @file StatCardGrid.jsx
 * @module Utils/Cards/StatCardGrid
 * @description Responsive grid wrapper for StatCard. Accepts array of card configs.
 */

import { memo } from "react";
import StatCard from "./StatCard";

const COL_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const StatCardGrid = memo(
  ({ cards = [], columns = 4, loading = false, className = "" }) => {
    const gridClass = COL_CLASS[columns] || COL_CLASS[4];

    return (
      <div className={`grid ${gridClass} gap-4 ${className}`}>
        {cards.map((card, idx) => (
          <StatCard key={card.key ?? idx} loading={loading} {...card} />
        ))}
      </div>
    );
  },
);

StatCardGrid.displayName = "StatCardGrid";

export default StatCardGrid;
