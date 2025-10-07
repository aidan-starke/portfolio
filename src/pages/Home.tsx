import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Terminal, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to My Portfolio
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Explore my projects: a Task Manager built with C# and Clean
          Architecture, CLAI a Rust-powered CLI chat application, and my
          interactive CV.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          title="Task Manager"
          description="A comprehensive task management system built with C# and Clean Architecture, featuring CQRS, MediatR, and comprehensive testing."
          tech={["C#", "ASP.NET Core", "Clean Architecture", "CQRS", "xUnit"]}
          icon={Code2}
          link="/tasks"
        />

        <ProjectCard
          title="CLAI Chat"
          description="A command-line AI chat client built in Rust with a client-server architecture, featuring session management and Claude AI integration."
          tech={["Rust", "Axum", "SeaORM", "Tokio", "SQLite"]}
          icon={Terminal}
          link="/chat"
        />

        <ProjectCard
          title="CV"
          description="An interactive, printable CV showcasing my professional experience, education, skills, and key projects."
          tech={["React", "TypeScript", "Tailwind CSS", "Vite"]}
          icon={FileText}
          link="/cv"
          buttonText="View CV"
        />
      </div>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  description: string;
  tech: string[];
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  buttonText?: string;
}

function ProjectCard({
  title,
  description,
  tech,
  icon: Icon,
  link,
  buttonText,
}: ProjectCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader>
        <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
          <Icon className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="bg-secondary rounded-md px-2.5 py-1 text-xs font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={link}>
            {buttonText || "View Project"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
