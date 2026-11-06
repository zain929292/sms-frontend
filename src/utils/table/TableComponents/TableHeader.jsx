
import { memo } from "react";

const TableHeader = memo(({ title, description, actionButton }) => {
  if (!title && !description && !actionButton) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        {title && (
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
        )}

        {description && (
          <p className="text-sm text-slate-500 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {actionButton && (
        <div className="shrink-0">{actionButton}</div>
      )}
    </div>
  );
});

TableHeader.displayName = "TableHeader";

export default TableHeader;
