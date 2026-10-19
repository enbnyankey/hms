import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right";
};

export default function Table<T>({
  columns,
  data,
  getRowKey,
  className = "",
  tableClassName = "",
  headerRowClassName = "",
  bodyClassName = "",
  rowClassName,
}: {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  className?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  bodyClassName?: string;
  rowClassName?: (row: T) => string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`w-full text-left text-xs ${tableClassName}`}>
        <thead>
          <tr className={`text-[10px] uppercase tracking-wide text-slate-400 ${headerRowClassName}`}>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`font-semibold ${column.headerClassName ?? ""} ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {data.map((row) => {
            const rowKey = getRowKey(row);
            return (
              <tr key={rowKey} className={rowClassName ? rowClassName(row) : ""}>
                {columns.map((column) => (
                  <td
                    key={`${rowKey}-${column.key}`}
                    className={`align-top ${column.cellClassName ?? ""} ${
                      column.align === "right" ? "text-right" : ""
                    }`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
