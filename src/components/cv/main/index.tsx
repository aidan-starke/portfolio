import { AboutMe } from "./AboutMe";
import { WorkExperience } from "./WorkExperience";
import { KeyProjects } from "./KeyProjects";
import { References } from "./References";

export function Main() {
  return (
    <div className="w-full space-y-8 rounded-b-2xl bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-8 lg:w-2/3 lg:rounded-r-2xl lg:rounded-bl-none">
      <AboutMe />
      <WorkExperience />
      <KeyProjects />
      <References />
    </div>
  );
}
