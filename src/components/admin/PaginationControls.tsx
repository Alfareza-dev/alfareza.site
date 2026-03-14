import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

export function PaginationControls({ currentPage, totalPages, basePath, extraParams = {} }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams({ ...extraParams, page: String(page) });
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between pt-6">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/5 bg-white/[0.02] text-muted-foreground cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" /> Previous
          </span>
        )}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-white/5 bg-white/[0.02] text-muted-foreground cursor-not-allowed">
            Next <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
