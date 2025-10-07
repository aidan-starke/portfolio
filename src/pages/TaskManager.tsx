import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, type TaskPriority } from "@/api/taskManagerClient";
import { Terminal, ChevronRight } from "lucide-react";

type PromptState =
  | { type: "menu" }
  | { type: "create-title" }
  | { type: "create-description" }
  | { type: "create-priority" }
  | { type: "create-tags" }
  | { type: "view-id" }
  | { type: "complete-index" }
  | { type: "delete-index" };

export default function TaskManager() {
  const [output, setOutput] = useState<string[]>([
    "TaskManager CLI v1.0.0",
    "",
    "What would you like to do?",
  ]);
  const [promptState, setPromptState] = useState<PromptState>({ type: "menu" });
  const [input, setInput] = useState("");
  const [menuIndex, setMenuIndex] = useState(0);

  // Create task form data
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "Medium" as TaskPriority,
    tags: "",
  });

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
  });

  const taskIndexMap = useMemo(() => {
    const map: Record<number, string> = {};
    tasks.forEach((task, idx) => {
      map[idx + 1] = task.id;
    });
    return map;
  }, [tasks]);

  const createTaskMutation = useMutation({
    mutationFn: () =>
      taskApi.createTask({
        title: taskForm.title,
        priority: taskForm.priority,
        description: taskForm.description || undefined,
        tags: taskForm.tags
          ? taskForm.tags.split(",").map((t) => t.trim())
          : [],
      }),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("");
      addOutput(`[green]✓[/] Task created with ID: ${id}`);
      addOutput("");
      resetToMenu();
    },
    onError: (error) => {
      addOutput("");
      addOutput(`[red]✗[/] Error: ${error.message}`);
      addOutput("");
      resetToMenu();
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.completeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("");
      addOutput("[green]✓[/] Task marked as completed.");
      addOutput("");
      resetToMenu();
    },
    onError: (error) => {
      addOutput("");
      addOutput(`[red]✗[/] Error: ${error.message}`);
      addOutput("");
      resetToMenu();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("");
      addOutput("[green]✓[/] Task deleted successfully.");
      addOutput("");
      resetToMenu();
    },
    onError: (error) => {
      addOutput("");
      addOutput(`[red]✗[/] Error: ${error.message}`);
      addOutput("");
      resetToMenu();
    },
  });

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [promptState]);

  const addOutput = (text: string) => {
    setOutput((prev) => [...prev, text]);
  };

  const resetToMenu = () => {
    setPromptState({ type: "menu" });
    setMenuIndex(0);
    setInput("");
    setTaskForm({
      title: "",
      description: "",
      priority: "Medium",
      tags: "",
    });
    addOutput("What would you like to do?");
  };

  const menuOptions = [
    "Create Task",
    "List All Tasks",
    "View Task by ID",
    "Complete Task",
    "Delete Task",
    "Filter Tasks",
    "Clear",
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (promptState.type === "menu") {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMenuIndex((prev) => (prev + 1) % menuOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setMenuIndex(
          (prev) => (prev - 1 + menuOptions.length) % menuOptions.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleMenuSelect(menuOptions[menuIndex]);
      }
    } else if (promptState.type === "create-priority") {
      const priorities: TaskPriority[] = ["Low", "Medium", "High", "Critical"];
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const currentIdx = priorities.indexOf(taskForm.priority);
        const newIdx =
          e.key === "ArrowDown"
            ? (currentIdx + 1) % priorities.length
            : (currentIdx - 1 + priorities.length) % priorities.length;
        setTaskForm({ ...taskForm, priority: priorities[newIdx] });
      } else if (e.key === "Enter") {
        e.preventDefault();
        addOutput(taskForm.priority);
        addOutput("");
        addOutput("Add tags? (comma-separated, press Enter to skip):");
        setPromptState({ type: "create-tags" });
      }
    }
  };

  // Add global keyboard handler
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (promptState.type === "menu") {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setMenuIndex((prev) => (prev + 1) % menuOptions.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setMenuIndex(
            (prev) => (prev - 1 + menuOptions.length) % menuOptions.length
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleMenuSelect(menuOptions[menuIndex]);
        }
      } else if (promptState.type === "create-priority") {
        const priorities: TaskPriority[] = [
          "Low",
          "Medium",
          "High",
          "Critical",
        ];
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const currentIdx = priorities.indexOf(taskForm.priority);
          const newIdx =
            e.key === "ArrowDown"
              ? (currentIdx + 1) % priorities.length
              : (currentIdx - 1 + priorities.length) % priorities.length;
          setTaskForm({ ...taskForm, priority: priorities[newIdx] });
        } else if (e.key === "Enter") {
          e.preventDefault();
          addOutput(taskForm.priority);
          addOutput("");
          addOutput("Add tags? (comma-separated, press Enter to skip):");
          setPromptState({ type: "create-tags" });
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [promptState, menuIndex, taskForm.priority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    switch (promptState.type) {
      case "create-title":
        if (!input.trim()) {
          addOutput("");
          addOutput("[red]✗[/] Task title required");
          addOutput("");
          resetToMenu();
          return;
        }
        setTaskForm({ ...taskForm, title: input });
        addOutput(input);
        addOutput("");
        addOutput("Add Description? (press Enter to skip):");
        setInput("");
        setPromptState({ type: "create-description" });
        break;

      case "create-description":
        setTaskForm({ ...taskForm, description: input });
        if (input) addOutput(input);
        addOutput("");
        addOutput("Select Priority (use ↑↓ arrows):");
        setInput("");
        setPromptState({ type: "create-priority" });
        break;

      case "create-tags":
        setTaskForm({ ...taskForm, tags: input });
        if (input) addOutput(input);
        addOutput("");
        addOutput("Creating task...");
        setInput("");
        createTaskMutation.mutate();
        break;

      case "view-id":
        if (!input.trim()) {
          addOutput("");
          addOutput("[red]✗[/] Task ID required");
          addOutput("");
          resetToMenu();
          return;
        }
        addOutput(input);
        // Check if input is a number (index) or UUID
        const numericInput = parseInt(input);
        const taskId =
          !isNaN(numericInput) && taskIndexMap[numericInput]
            ? taskIndexMap[numericInput]
            : input;
        handleViewTask(taskId);
        setInput("");
        break;

      case "complete-index":
        addOutput(input);
        handleCompleteTask(parseInt(input));
        setInput("");
        break;

      case "delete-index":
        addOutput(input);
        handleDeleteTask(parseInt(input));
        setInput("");
        break;
    }
  };

  const handleMenuSelect = (choice: string) => {
    // Clear current menu display
    setOutput((prev) => prev.slice(0, -menuOptions.length - 1));
    addOutput(`> ${choice}`);
    addOutput("");

    switch (choice) {
      case "Create Task":
        addOutput("Task Title:");
        setPromptState({ type: "create-title" });
        break;

      case "List All Tasks":
        displayTasks();
        resetToMenu();
        break;

      case "View Task by ID":
        displayTasks().then(() => {
          addOutput("Enter task ID:");
          setPromptState({ type: "view-id" });
        });
        break;

      case "Complete Task":
        displayTasks().then(() => {
          addOutput("Enter task ID to complete:");
          setPromptState({ type: "complete-index" });
        });
        break;

      case "Delete Task":
        displayTasks().then(() => {
          addOutput("Enter task ID to delete:");
          setPromptState({ type: "delete-index" });
        });
        break;

      case "Filter Tasks":
        addOutput("[yellow]Coming soon...[/]");
        addOutput("");
        resetToMenu();
        break;

      case "Clear":
        setOutput([]);
        resetToMenu();
        break;
    }
  };

  const displayTasks = async () => {
    const { data: freshTasks } = await refetch();
    const taskList = freshTasks || [];

    if (taskList.length === 0) {
      addOutput("[yellow]No tasks found.[/]");
      addOutput("");
      return;
    }

    addOutput(`Found ${taskList.length} task(s):`);
    addOutput("");
    taskList.forEach((task, idx) => {
      const status = task.isCompleted ? "✓" : "○";
      addOutput(`${idx + 1}. ${status} ${task.title} (${task.priority})`);
    });
    addOutput("");
  };

  const handleViewTask = async (id: string) => {
    try {
      const task = await taskApi.getTask(id);
      const width = 69;

      const pad = (text: string, extraLength = 0) => {
        const remaining = width - text.length + extraLength;
        return text + "\u00A0".repeat(Math.max(0, remaining));
      };

      const statusText = task.isCompleted
        ? "[green]Completed ✓[/]"
        : "[grey]Incomplete ○[/]";
      const statusMarkupLength = task.isCompleted
        ? "[green][/]".length
        : "[grey][/]".length;

      addOutput("");
      addOutput(
        "╭──────────────────────────────────────────────────────────────────────╮"
      );
      addOutput(`│ ${pad("Task: " + task.id)}│`);
      addOutput(
        "├──────────────────────────────────────────────────────────────────────┤"
      );
      addOutput(`│ ${pad("Title: " + task.title)}│`);
      addOutput(`│ ${pad("Description: " + (task.description || "N/A"))}│`);
      addOutput(`│ ${pad("Priority: " + task.priority)}│`);
      addOutput(`│ ${pad("Status: " + statusText, statusMarkupLength)}│`);
      addOutput(
        `│ ${pad("Tags: " + (task.tags.length ? task.tags.join(", ") : "None"))}│`
      );
      addOutput(
        `│ ${pad("Due Date: " + (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"))}│`
      );
      addOutput(
        `│ ${pad("Created At: " + new Date(task.createdAt).toLocaleString())}│`
      );
      addOutput(
        "╰──────────────────────────────────────────────────────────────────────╯"
      );
      addOutput("");
      resetToMenu();
    } catch (error) {
      console.error("View task error:", error);
      addOutput("");
      addOutput(
        `[red]✗[/] Task not found: ${error instanceof Error ? error.message : String(error)}`
      );
      addOutput("");
      resetToMenu();
    }
  };

  const handleCompleteTask = (idx: number) => {
    const taskIdx = idx - 1;
    if (isNaN(taskIdx) || taskIdx < 0 || taskIdx >= tasks.length) {
      addOutput("");
      addOutput("[red]✗[/] Invalid task index");
      addOutput("");
      resetToMenu();
      return;
    }
    addOutput("");
    completeTaskMutation.mutate(tasks[taskIdx].id);
  };

  const handleDeleteTask = (idx: number) => {
    const taskIdx = idx - 1;
    if (isNaN(taskIdx) || taskIdx < 0 || taskIdx >= tasks.length) {
      addOutput("");
      addOutput("[red]✗[/] Invalid task index");
      addOutput("");
      resetToMenu();
      return;
    }
    addOutput("");
    deleteTaskMutation.mutate(tasks[taskIdx].id);
  };

  const formatLine = (line: string) => {
    // Parse Spectre.Console-style markup
    let formatted = line;
    let className = "text-gray-300";

    if (line.startsWith(">")) {
      className = "text-cyan-400";
    } else if (line.includes("[green]") || line.startsWith("✓")) {
      className = "text-green-400";
      formatted = line.replace(/\[green\]/g, "").replace(/\[\/\]/g, "");
    } else if (line.includes("[red]") || line.startsWith("✗")) {
      className = "text-red-400";
      formatted = line.replace(/\[red\]/g, "").replace(/\[\/\]/g, "");
    } else if (line.includes("[yellow]")) {
      className = "text-yellow-400";
      formatted = line.replace(/\[yellow\]/g, "").replace(/\[\/\]/g, "");
    } else if (line.includes("[grey]")) {
      className = "text-gray-500";
      formatted = line.replace(/\[grey\]/g, "").replace(/\[\/\]/g, "");
    } else if (
      line.startsWith("│") ||
      line.startsWith("╭") ||
      line.startsWith("╰") ||
      line.startsWith("├")
    ) {
      className = "text-blue-400";
    } else if (line.includes("○") || line.includes("✓")) {
      className = "text-gray-300";
    }

    return { formatted, className };
  };

  return (
    <div className="mx-auto max-w-4xl">
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
        <div className="h-[600px] overflow-y-auto p-4 font-mono text-sm">
          {output.map((line, idx) => {
            const { formatted, className } = formatLine(line);
            return (
              <div key={idx} className={className}>
                {formatted}
              </div>
            );
          })}

          {/* Menu Selection */}
          {promptState.type === "menu" && (
            <div className="mt-2">
              {menuOptions.map((option, idx) => (
                <div
                  key={option}
                  className={
                    idx === menuIndex
                      ? "bg-green-500 pl-2 text-black"
                      : "pl-2 text-gray-400"
                  }
                >
                  {idx === menuIndex ? ">" : " "} {option}
                </div>
              ))}
            </div>
          )}

          {/* Priority Selection */}
          {promptState.type === "create-priority" && (
            <div className="mt-2">
              {(["Low", "Medium", "High", "Critical"] as const).map((p) => (
                <div
                  key={p}
                  className={
                    p === taskForm.priority
                      ? "bg-green-500 pl-2 text-black"
                      : "pl-2 text-gray-400"
                  }
                >
                  {p === taskForm.priority ? ">" : " "} {p}
                </div>
              ))}
            </div>
          )}

          {/* Command Input */}
          {promptState.type !== "menu" &&
            promptState.type !== "create-priority" && (
              <form onSubmit={handleSubmit} className="mt-2 flex items-center">
                <ChevronRight className="mr-2 h-4 w-4 text-green-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent font-mono text-green-400 outline-none"
                  autoFocus
                />
              </form>
            )}

          <div ref={outputEndRef} />
        </div>
      </div>

      <div className="mt-4 font-mono text-sm text-gray-500">
        {promptState.type === "menu" &&
          "Use ↑↓ arrows to navigate, Enter to select"}
        {promptState.type === "create-priority" &&
          "Use ↑↓ arrows to select priority, Enter to confirm"}
      </div>
    </div>
  );
}
