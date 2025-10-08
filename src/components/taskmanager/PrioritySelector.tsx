import type { TaskPriority } from "@/api/taskManagerClient";
import { TASK_PRIORITIES } from "@/lib/taskConstants";

interface PrioritySelectorProps {
  selected: TaskPriority;
}

export function PrioritySelector({ selected }: PrioritySelectorProps) {
  return (
    <div className="mt-2">
      {TASK_PRIORITIES.map((priority) => (
        <div
          key={priority}
          className={
            priority === selected
              ? "bg-green-500 pl-2 text-black"
              : "pl-2 text-gray-400"
          }
        >
          {priority === selected ? ">" : " "} {priority}
        </div>
      ))}
    </div>
  );
}
