import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Code2, ListTodo, MessageSquare } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const links = [
    { path: "/", label: "Home", icon: Code2 },
    { path: "/tasks", label: "Task Manager", icon: ListTodo },
    { path: "/chat", label: "CLAI Chat", icon: MessageSquare },
  ];

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Code2 className="h-6 w-6" />
            <span className="text-xl font-bold">Portfolio</span>
          </Link>
          <div className="flex items-center gap-2">
            {links.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={location === path ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={path}>
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
