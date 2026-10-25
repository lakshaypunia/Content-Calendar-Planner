import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-3 " +
  "hover:border-ink-3/50 focus:border-accent focus:ring-4 focus:ring-accent/15 focus:outline-none " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(control, "h-10", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(control, "min-h-20 resize-none py-2.5 leading-relaxed", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-10 cursor-pointer appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" />
    </div>
  ),
);
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[11px] font-semibold tracking-[0.08em] text-ink-2 uppercase">
          {label}
        </label>
        {hint && <span className="text-[11px] text-ink-3">{hint}</span>}
      </div>
      {children}
      {error && (
        <p role="alert" className="animate-fade-up text-[12px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
