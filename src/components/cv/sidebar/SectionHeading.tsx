export function SectionHeading({ children }: React.PropsWithChildren) {
  return (
    <h3 className="relative -mr-8 mb-4 border-b border-white pb-2 text-lg font-bold">
      {children}
      <div className="absolute right-0 bottom-0 h-0.5 w-0 origin-right bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-500 group-hover:w-full" />
    </h3>
  );
}
