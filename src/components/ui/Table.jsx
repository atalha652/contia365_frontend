import { forwardRef } from "react";
import { clsx } from "clsx";

const Table = forwardRef(({ className, ...props }, ref) => (
  <div
    className="w-full overflow-x-auto custom-scrollbar"
    style={{ maxWidth: "100%" }}
  >
    <table
      ref={ref}
      className={clsx("w-full", className)}
      style={{ minWidth: "800px" }}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={clsx(className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={clsx("bg-transparent", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableRow = forwardRef(
  ({ className, isLast = false, isHeader = false, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        isHeader
          ? "bg-bg-50 border border-bd-50"
          : "hover:bg-bg-60 transition-colors bg-transparent",
        className
      )}
      style={isHeader ? { borderRadius: "12px" } : {}}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

const TableHead = forwardRef(
  ({ className, isFirst = false, isLast = false, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        "text-left px-6 py-3 text-sm font-medium text-fg-40",
        isFirst && "rounded-l-xl",
        isLast && "rounded-r-xl",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";
const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={clsx("px-6 py-4 whitespace-nowrap", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
