import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink shadow-[0_1px_0_rgb(255_255_255/0.25)_inset,0_6px_16px_-6px_var(--accent)] hover:brightness-110 active:brightness-95",
  secondary:
    "bg-surface text-ink border border-line-strong shadow-sm hover:bg-surface-2 hover:border-ink-3/40",
  ghost: "text-ink-2 hover:bg-ink/5 hover:text-ink",
  danger: "bg-danger text-white hover:brightness-110 active:brightness-95",
  ink: "bg-ink text-canvas hover:bg-ink/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-xl",
  icon: "h-8 w-8 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-all duration-150 select-none",
        "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
