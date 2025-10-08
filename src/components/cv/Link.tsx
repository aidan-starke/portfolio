import { cn } from "@/lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <a
      className={cn(
        className,
        "transition-transform hover:scale-105 hover:underline hover:decoration-blue-200"
      )}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
