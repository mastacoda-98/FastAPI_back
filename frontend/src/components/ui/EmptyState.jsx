import Link from "next/link";
import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && <Icon size={56} className="text-gray-300 mb-6" />}
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-8">{description}</p>
      {actionText &&
        (actionHref ? (
          <Link href={actionHref}>
            <Button>{actionText}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionText}</Button>
        ))}
    </div>
  );
}
