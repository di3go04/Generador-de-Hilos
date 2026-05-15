"use client";

interface CategoryBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  onRemove?: () => void;
}

export function CategoryBadge({ name, color, size = "sm", onRemove }: CategoryBadgeProps) {
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5 gap-1"
    : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${sizeClasses} transition-all`}
      style={{
        backgroundColor: `${color}18`,
        borderColor: `${color}40`,
        color: color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          className="ml-0.5 w-3 h-3 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
          style={{ color }}
        >
          ×
        </button>
      )}
    </span>
  );
}
