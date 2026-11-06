
import { memo } from "react";
import TableActionMenu from "./TableActionMenu";

const TableRow = memo(({
  row,
  columns,
  actions,
  hasActions,
  isExpanded,
  expandable,
  renderExpandedRow,
  rowClickable,
  onRowClick,
  colCount,
}) => {
  return (
    <>
      <tr
        onClick={() => rowClickable && onRowClick?.(row)}
        className={`transition-colors duration-150 ${
          isExpanded ? "bg-slate-50/80" : ""
        } ${
          rowClickable
            ? "cursor-pointer hover:bg-slate-50/80"
            : "hover:bg-slate-50/50"
        }`}
      >
        {columns.map((col, colIndex) => (
          <td
            key={col.key || colIndex}
            className={`px-4 sm:px-5 py-4 text-sm text-slate-700 align-middle ${
              col.align === "center"
                ? "text-center"
                : col.align === "right"
                  ? "text-right"
                  : "text-left"
            } ${col.cellClassName || ""}`}
          >
            {col.render
              ? col.render(row)
              : (row[col.key] ?? "-")}
          </td>
        ))}

        {hasActions && (
          <td
            className="px-4 sm:px-5 py-4 text-sm text-right align-middle"
            onClick={(e) => e.stopPropagation()}
          >
            <TableActionMenu
              actions={actions}
              row={row}
            />
          </td>
        )}
      </tr>

      {expandable && isExpanded && renderExpandedRow && (
        <tr>
          <td colSpan={colCount} className="p-0">
            {renderExpandedRow(row)}
          </td>
        </tr>
      )}
    </>
  );
});

TableRow.displayName = "TableRow";

export default TableRow;
