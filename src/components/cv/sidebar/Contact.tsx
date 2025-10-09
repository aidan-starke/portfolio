import { Mail, Phone, Linkedin, Github, MapPin, Globe } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { Link } from "@/components/cv/Link";

export function Contact() {
  return (
    <div className="group">
      <SectionHeading>CONTACT</SectionHeading>
      <div className="space-y-3 text-sm">
        <ContactItem
          icon={<Phone size={16} className="flex-shrink-0 text-blue-400" />}
          text="+64 21 081 28978"
          href="tel:+6421081289"
        />
        <ContactItem
          icon={<Mail size={16} className="flex-shrink-0 text-blue-400" />}
          text="aidan@starkedev.net"
          href="mailto:aidan@starkedev.net"
        />
        <ContactItem
          icon={<Globe size={16} className="flex-shrink-0 text-blue-400" />}
          text="aidan.starkedev.net"
          href="https://aidan.starkedev.net"
        />
        <ContactItem
          icon={<Linkedin size={16} className="flex-shrink-0 text-blue-400" />}
          text="aidan-starke"
          href="https://linkedin.com/in/aidan-starke"
        />
        <ContactItem
          icon={<Github size={16} className="flex-shrink-0 text-blue-400" />}
          text="aidan-starke"
          href="https://github.com/aidan-starke"
        />
        <ContactItem
          icon={<MapPin size={16} className="flex-shrink-0 text-blue-400" />}
          text="Feilding, New Zealand"
        />
      </div>
    </div>
  );
}

function ContactItem(props: {
  icon: React.ReactNode;
  text: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {props.icon}
      {props.href ? (
        <Link className="break-all text-white" href={props.href}>
          {props.text}
        </Link>
      ) : (
        <span className="break-all">{props.text}</span>
      )}
    </div>
  );
}
