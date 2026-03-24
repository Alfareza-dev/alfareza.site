import Image from "next/image";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "No transmissions found",
  description = "Currently engineering chaos.",
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Faded mountain silhouette background */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden">
        <div className="relative w-full h-[60%] opacity-[0.04]">
          <Image
            src="/mountain-bg.webp"
            alt=""
            fill
            className="object-cover object-bottom"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text lockup */}
      <div className="relative z-10 space-y-3">
        <h3 className="text-xl font-semibold text-zinc-400 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center mt-6 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
