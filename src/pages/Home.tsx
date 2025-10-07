import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-4xl font-bold text-gray-900">
        Welcome to My Portfolio
      </h1>
      <p className="mb-8 text-lg text-gray-700">
        This portfolio showcases two projects I've built: a Task Manager in C#
        and a CLI chat application (CLAI) in Rust.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectCard
          title="Task Manager"
          description="A comprehensive task management system built with C# and Clean Architecture, featuring CQRS, MediatR, and comprehensive testing."
          tech={['C#', 'ASP.NET Core', 'Clean Architecture', 'CQRS', 'xUnit']}
          link="/tasks"
        />

        <ProjectCard
          title="CLAI Chat"
          description="A command-line AI chat client built in Rust with a client-server architecture, featuring session management and Claude AI integration."
          tech={['Rust', 'Axum', 'SeaORM', 'Tokio', 'SQLite']}
          link="/chat"
        />
      </div>
    </div>
  );
}

interface ProjectCardProps {
  title: string;
  description: string;
  tech: string[];
  link: string;
}

function ProjectCard({ title, description, tech, link }: ProjectCardProps) {
  return (
    <Link href={link}>
      <a className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <h2 className="mb-3 text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="mb-4 text-gray-600">{description}</p>
        <div className="flex flex-wrap gap-2">
          {tech.map((t) => (
            <span
              key={t}
              className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
            >
              {t}
            </span>
          ))}
        </div>
      </a>
    </Link>
  );
}
