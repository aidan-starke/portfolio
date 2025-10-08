import type { PropsWithChildren } from "react";

interface SectionHeadingProps extends PropsWithChildren {}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="relative mb-4 -ml-8 cursor-default border-b-2 border-slate-800 pb-2 pl-8 text-2xl font-bold text-slate-800">
      {children}
      {/* Animated underline on hover */}
      <div className="absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 transform bg-gradient-to-r from-blue-500 to-purple-600 transition-transform duration-300 group-hover:scale-x-100" />
    </h2>
  );
}
