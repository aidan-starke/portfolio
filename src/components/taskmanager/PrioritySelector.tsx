import type { TaskPriority } from "@/api/taskManagerClient";
import { TASK_PRIORITIES } from "@/lib/taskConstants";

interface PrioritySelectorProps {
  selected: TaskPriority;
  onSelect?: (priority: TaskPriority) => void;
  onHover?: (priority: TaskPriority) => void;
}

export function PrioritySelector({
  selected,
  onSelect,
  onHover,
}: PrioritySelectorProps) {
  return (
    <div className="mt-2">
      {TASK_PRIORITIES.map((priority) => (
        <div
          key={priority}
          onClick={() => onSelect?.(priority)}
          onMouseEnter={() => onHover?.(priority)}
          className={
            priority === selected
              ? "cursor-pointer bg-green-500 pl-2 text-black"
              : "cursor-pointer pl-2 text-gray-400 hover:bg-green-500 hover:text-black"
          }
        >
          {priority === selected ? ">" : " "} {priority}
        </div>
      ))}
    </div>
  );
}
