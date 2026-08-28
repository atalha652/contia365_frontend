import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../ui";

const pageWindow = (page, totalPages, span = 5) => {
  if (totalPages <= span) {
    return Array.from({ length: Math.max(totalPages, 0) }, (_, i) => i + 1);
  }
  const half = Math.floor(span / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + span - 1);
  start = Math.max(1, end - span + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const AdminPagination = ({
  page = 1,
  totalPages = 0,
  total = 0,
  pageSize = 10,
  onPageChange,
}) => {
  if (total <= 0) return null;
  const pages = pageWindow(page, Math.max(totalPages, 1));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-end gap-3 mt-6 pt-4">
      <p className="text-xs text-fg-60">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages.map((n) => (
          <Button
            key={n}
            type="button"
            variant={n === page ? "primary" : "secondary"}
            size="sm"
            className="min-w-8"
            onClick={() => onPageChange(n)}
          >
            {n}
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdminPagination;
