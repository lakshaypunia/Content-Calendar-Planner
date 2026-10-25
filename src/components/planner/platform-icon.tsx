import type { Platform } from "@/lib/validation";
import { cn } from "@/lib/utils";

/** Brand colours, used for chips and calendar dots. */
export const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  facebook: "#1877f2",
  x: "var(--ink)",
  youtube: "#ff0033",
};

const PATHS: Record<Platform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </>
  ),
  linkedin: (
    <path
      fill="currentColor"
      d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.55 4.77 5.86v5.59h-4v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62v5.03h-4v-11Z"
    />
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.68c0-.85.24-1.43 1.46-1.43h1.56V4.62a20.9 20.9 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.16H7.92v2.94h2.54V21h3.04Z"
    />
  ),
  x: (
    <path
      fill="currentColor"
      d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z"
    />
  ),
  youtube: (
    <path
      fill="currentColor"
      d="M21.58 7.19a2.5 2.5 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81ZM10 15V9l5.2 3-5.2 3Z"
    />
  ),
};

export function PlatformIcon({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-4 shrink-0", className)}>
      {PATHS[platform]}
    </svg>
  );
}
