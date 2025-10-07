import { ExternalLink } from "lucide-react";
import { BulletList } from "@/components/cv/bullet-list";
import { SectionHeading } from "./section-heading";
import { Link } from "@/components/cv/link";

export function KeyProjects() {
  return (
    <div className="group">
      <SectionHeading>KEY PROJECTS</SectionHeading>

      <div className="space-y-6">
        <Project
          title="CENNZ To ROOT Swap"
          href="https://root-swap.cennz.net/"
          timeline="Futureverse | Jan - Mar 2024"
          technologies="TypeScript, React, Next.js, SubSquid, PostgreSQL, Tailwind CSS"
          description={[
            "Lead developer for cross-blockchain token migration bridge enabling 1:1 CENNZ to ROOT token conversion",
            "Built and maintained frontend, API, and indexer",
            "Successfully processed 20,000+ transactions and counting with zero data loss",
          ]}
        />
        <Project
          title="CLAI - Command Line Artificial Interface"
          href="https://github.com/aidan-starke/clai"
          timeline="Personal Project"
          technologies="Rust, SQLite, Tokio, SeaORM, Axum, Serde, Claude API"
          description={[
            "Production-quality CLI application for conversational AI interaction with client-server architecture",
            "Built across 6 crates (~3,400 lines) featuring persistent sessions, role-playing, and RESTful API",
            "Demonstrates advanced Rust patterns: async/await with Tokio, comprehensive error handling, database ORMs",
          ]}
        />
        <Project
          title="TaskManager"
          href="https://github.com/aidan-starke/TaskManager"
          timeline="Personal Project"
          technologies="C#, .NET 9, Clean Architecture, CQRS, MediatR, Spectre.Console, xUnit"
          description={[
            "Comprehensive CLI task management application built to explore modern software architecture patterns",
            "Implements Clean Architecture with CQRS pattern, Repository, Strategy, and Result patterns",
            "Features 121 passing tests demonstrating TDD approach with comprehensive test coverage",
          ]}
        />
      </div>
    </div>
  );
}

function Project(props: {
  title: string;
  href: string;
  timeline: string;
  technologies: string;
  description: string[];
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between">
        <Link
          href={props.href}
          className="flex items-center gap-1 font-bold text-slate-800 hover:underline hover:decoration-blue-200"
        >
          {props.title} <ExternalLink size={14} />
        </Link>
        <span className="text-xs text-slate-500">{props.timeline}</span>
      </div>
      <p className="mb-2 text-sm text-slate-600">{props.technologies}</p>
      <BulletList items={props.description} size="sm" />
    </div>
  );
}
