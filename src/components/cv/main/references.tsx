import { Link } from "@/components/cv/link";
import { SectionHeading } from "./section-heading";
import { Mail, Phone } from "lucide-react";

export function References() {
  return (
    <div className="group">
      <SectionHeading>REFERENCES</SectionHeading>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reference
          name="Jason Tulp"
          title="Blockchain Technology Specialist"
          company="Futureverse"
          phone="+64 21 676 111"
          email="jason@tulp.dev"
        />
        <Reference
          name="James Carolan"
          title="Head of Experience Platform"
          company="Futureverse"
          email="james.carolan87@gmail.com"
        />
        <Reference
          name="Tracy Jordan"
          title="Technical Project Manager"
          company="Futureverse"
          phone="+64 21 722 743"
          email="tracydeanjordan@gmail.com"
          testimonial="I had the pleasure of having Aidan on various projects I managed while at Futureverse. Aidan worked on many applications (included a token exchange, bridge, liquidity pool mechanism, and a rewards system) that leveraged on chain data. He used React.js, TypeScript, and PostgreSQL/Prisma to build indexers, databases, and front ends. Aidan would be an asset to any team because he is a jack of all trades, is willing to pick up and learn anything, and generously jumps in and helps get any work across the finish line. Plus, he's enjoyable to work with."
        />
        <Reference
          name="Philip Roigard"
          title="Team Lead"
          company="Futureverse"
          phone="+64 21 568 108"
        />
      </div>
    </div>
  );
}

function Reference(props: {
  name: string;
  title: string;
  company: string;
  phone?: string;
  email?: string;
  testimonial?: string;
}) {
  return (
    <div>
      <h3 className="font-bold text-slate-800">{props.name}</h3>
      <p className="text-sm text-slate-600">{props.title}</p>
      <p className="text-sm text-slate-600">{props.company}</p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        {props.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-600" />
            <Link
              href={`tel:${props.phone.replace(/\s/g, "")}`}
              className="text-slate-700"
            >
              {props.phone}
            </Link>
          </div>
        )}
        {props.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-600" />
            <Link href={`mailto:${props.email}`} className="text-slate-700">
              {props.email}
            </Link>
          </div>
        )}
      </div>
      {props.testimonial && (
        <p className="mt-3 border-l-2 border-slate-300 pl-3 text-sm text-slate-600 italic">
          "{props.testimonial}"
        </p>
      )}
    </div>
  );
}
