import { Sidebar } from "@/components/cv/sidebar";
import { Main } from "@/components/cv/main";

export default function CV() {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col shadow-2xl transition-all duration-500 hover:scale-[1.02] sm:rounded-2xl lg:flex-row print:shadow-none print:hover:scale-100">
      <Sidebar />
      <Main />
    </div>
  );
}
