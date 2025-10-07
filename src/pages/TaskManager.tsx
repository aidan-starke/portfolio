import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/api/taskManagerClient";
import { Terminal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskManager() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState<string[]>([
    "TaskManager CLI v1.0.0",
    "Type 'help' for available commands",
    "",
  ]);

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
    retry: false,
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: { title: string; priority: string }) =>
      taskApi.createTask({
        title: data.title,
        priority: data.priority as "Low" | "Medium" | "High" | "Critical",
        tags: [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("Task created successfully");
    },
    onError: (error) => {
      addOutput(`Error: ${error.message}`);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("Task deleted successfully");
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("Task completed");
    },
  });

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, text]);
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    addOutput(`$ ${command}`);

    const [cmd, ...args] = command.trim().split(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        addOutput("Available commands:");
        addOutput("  list                    - List all tasks");
        addOutput("  add <title> [priority]  - Add a new task (priority: low|medium|high|critical)");
        addOutput("  complete <index>        - Mark task as complete");
        addOutput("  delete <index>          - Delete a task");
        addOutput("  clear                   - Clear terminal output");
        addOutput("  help                    - Show this help message");
        break;

      case "list":
        const { data: freshTasks } = await refetch();
        const taskList = freshTasks || [];
        if (taskList.length === 0) {
          addOutput("No tasks found");
        } else {
          addOutput(`Found ${taskList.length} task(s):\n`);
          taskList.forEach((task, idx) => {
            const status = task.isCompleted ? "[✓]" : "[ ]";
            const priority = `[${task.priority.toUpperCase()}]`;
            addOutput(`${idx + 1}. ${status} ${priority} ${task.title}`);
          });
        }
        break;

      case "add":
        if (args.length === 0) {
          addOutput("Error: Task title required");
          addOutput("Usage: add <title> [priority]");
        } else {
          const priority = args[args.length - 1];
          const validPriorities = ["low", "medium", "high", "critical"];
          let taskPriority = "Medium";
          let title = args.join(" ");

          if (validPriorities.includes(priority.toLowerCase())) {
            taskPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
            title = args.slice(0, -1).join(" ");
          }

          createTaskMutation.mutate({ title, priority: taskPriority });
        }
        break;

      case "complete":
        const completeIdx = parseInt(args[0]) - 1;
        if (isNaN(completeIdx) || completeIdx < 0 || completeIdx >= tasks.length) {
          addOutput("Error: Invalid task index");
        } else {
          completeTaskMutation.mutate(tasks[completeIdx].id);
        }
        break;

      case "delete":
        const deleteIdx = parseInt(args[0]) - 1;
        if (isNaN(deleteIdx) || deleteIdx < 0 || deleteIdx >= tasks.length) {
          addOutput("Error: Invalid task index");
        } else {
          deleteTaskMutation.mutate(tasks[deleteIdx].id);
        }
        break;

      case "clear":
        setOutput([]);
        break;

      default:
        addOutput(`Command not found: ${cmd}`);
        addOutput("Type 'help' for available commands");
    }

    addOutput("");
    setCommand("");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <Terminal className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">TaskManager CLI</h1>
      </div>

      {/* Terminal Window */}
      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-gray-800 bg-gray-900 px-4 py-2">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-4 text-sm text-gray-400">
            taskmanager@localhost:~
          </span>
        </div>

        {/* Terminal Output */}
        <div className="h-[500px] overflow-y-auto p-4 font-mono text-sm">
          {isLoading && (
            <div className="text-green-400">Loading tasks...</div>
          )}
          {error && (
            <div className="text-red-400">
              Error: {error instanceof Error ? error.message : "Failed to fetch tasks"}
            </div>
          )}
          {output.map((line, idx) => (
            <div
              key={idx}
              className={
                line.startsWith("$")
                  ? "text-blue-400"
                  : line.startsWith("Error")
                    ? "text-red-400"
                    : line.includes("[✓]")
                      ? "text-green-400"
                      : "text-gray-300"
              }
            >
              {line}
            </div>
          ))}

          {/* Command Input */}
          <form onSubmit={handleCommand} className="mt-2 flex items-center">
            <ChevronRight className="mr-2 h-4 w-4 text-green-400" />
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="flex-1 bg-transparent font-mono text-green-400 outline-none placeholder:text-gray-600"
              placeholder="Enter command..."
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCommand("list");
            handleCommand({ preventDefault: () => {} } as any);
          }}
          className="font-mono"
        >
          list
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommand("add ")}
          className="font-mono"
        >
          add task
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCommand("help");
            handleCommand({ preventDefault: () => {} } as any);
          }}
          className="font-mono"
        >
          help
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCommand("clear");
            handleCommand({ preventDefault: () => {} } as any);
          }}
          className="font-mono"
        >
          clear
        </Button>
      </div>
    </div>
  );
}
