import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  ...props
}) {
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-black border border-gray-300 disabled:opacity-60",
    danger: "bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400",
    success: "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400",
    outline:
      "border-2 border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-60",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
