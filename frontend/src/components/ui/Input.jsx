import { cn } from "@/lib/utils";

export function Input({ className, label, error, hint, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black",
          "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
          "transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed",
          error && "border-red-500 ring-2 ring-red-200",
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="text-xs text-gray-600">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
