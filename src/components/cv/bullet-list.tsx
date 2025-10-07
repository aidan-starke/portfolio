import { cn } from "@/lib/utils";

export function BulletList(props: { items: string[]; size?: "sm" | "md" }) {
  const bulletClass =
    props.size === "sm" ? "text-slate-600" : "text-slate-800 font-bold";

  return (
    <ul
      className={cn(
        "text-sm text-slate-700",
        props.size === "sm" ? "space-y-1" : "space-y-2"
      )}
    >
      {props.items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className={bulletClass}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}
