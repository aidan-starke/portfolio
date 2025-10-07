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
  | { type: "create-duedate" }
  | { type: "view-id" }
  | { type: "complete-index" }
  | { type: "delete-index" }
  | { type: "update-id" }
  | { type: "update-field" }
  | { type: "update-value" }
  | { type: "update-priority" }
  | { type: "search-term" }
  | { type: "filter-priority" };

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
    dueDate: "",
  });

  // Update task state
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateField, setUpdateField] = useState("");
  const [updatePriority, setUpdatePriority] = useState<TaskPriority>("Medium");

  // filter state
  const [filterPriority, setFilterPriority] = useState<TaskPriority>("Low");

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
    mutationFn: () => {
      // Parse DD-MM-YYYY format to Date (UTC)
      let dueDate: Date | undefined;
      if (taskForm.dueDate) {
        const [day, month, year] = taskForm.dueDate.split("-");
        if (day && month && year) {
          dueDate = new Date(
            Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
          );
        }
      }

      return taskApi.createTask({
        title: taskForm.title,
        priority: taskForm.priority,
        description: taskForm.description || undefined,
        tags: taskForm.tags
          ? taskForm.tags.split(",").map((t) => t.trim())
          : [],
        dueDate,
      });
    },
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
      dueDate: "",
    });
    addOutput("What would you like to do?");
  };

  const menuOptions = [
    "Create Task",
    "List All Tasks",
    "View Task by ID",
    "Complete Task",
    "Update Task",
    "Delete Task",
    "Search Tasks",
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
      } else if (promptState.type === "update-priority") {
        const priorities: TaskPriority[] = [
          "Low",
          "Medium",
          "High",
          "Critical",
        ];
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const currentIdx = priorities.indexOf(updatePriority);
          const newIdx =
            e.key === "ArrowDown"
              ? (currentIdx + 1) % priorities.length
              : (currentIdx - 1 + priorities.length) % priorities.length;
          setUpdatePriority(priorities[newIdx]);
        } else if (e.key === "Enter") {
          e.preventDefault();
          addOutput(updatePriority);
          handleUpdateTask(updateTaskId, updateField, updatePriority);
        }
      } else if (promptState.type === "filter-priority") {
        const priorities: TaskPriority[] = [
          "Low",
          "Medium",
          "High",
          "Critical",
        ];
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          const currentIdx = priorities.indexOf(filterPriority);
          const newIdx =
            e.key === "ArrowDown"
              ? (currentIdx + 1) % priorities.length
              : (currentIdx - 1 + priorities.length) % priorities.length;
          setFilterPriority(priorities[newIdx]);
        } else if (e.key === "Enter") {
          e.preventDefault();
          addOutput(filterPriority);
          handleFilterTasks(filterPriority);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    promptState,
    menuIndex,
    taskForm.priority,
    updatePriority,
    filterPriority,
  ]);

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
        addOutput("Add Due Date (DD-MM-YYYY, press Enter to skip):");
        setInput("");
        setPromptState({ type: "create-duedate" });
        break;

      case "create-duedate":
        setTaskForm({ ...taskForm, dueDate: input });
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

      case "update-id":
        if (!input.trim()) {
          addOutput("");
          addOutput("[red]✗[/] Task ID required");
          addOutput("");
          resetToMenu();
          return;
        }
        addOutput(input);
        const updateNumeric = parseInt(input);
        const updateId =
          !isNaN(updateNumeric) && taskIndexMap[updateNumeric]
            ? taskIndexMap[updateNumeric]
            : input;
        setUpdateTaskId(updateId);
        addOutput("");
        addOutput(
          "What would you like to update? (title/description/priority/tags/duedate):"
        );
        setInput("");
        setPromptState({ type: "update-field" });
        break;

      case "update-field":
        if (
          !["title", "description", "priority", "tags", "duedate"].includes(
            input.toLowerCase()
          )
        ) {
          addOutput(
            "[red]✗[/] Invalid field. Choose: title, description, priority, tags, or duedate"
          );
          addOutput("");
          resetToMenu();
          return;
        }
        addOutput(input);
        setUpdateField(input.toLowerCase());
        addOutput("");

        if (input.toLowerCase() === "priority") {
          addOutput("Select Priority (use ↑↓ arrows):");
          setInput("");
          setPromptState({ type: "update-priority" });
        } else {
          addOutput(`Enter new ${input.toLowerCase()}:`);
          setInput("");
          setPromptState({ type: "update-value" });
        }
        break;

      case "update-value":
        addOutput(input);
        handleUpdateTask(updateTaskId, updateField, input);
        setInput("");
        break;

      case "search-term":
        if (!input.trim()) {
          addOutput("[red]✗[/] Search term required");
          addOutput("");
          resetToMenu();
          return;
        }
        addOutput(input);
        handleSearchTasks(input);
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

      case "Update Task":
        displayTasks().then(() => {
          addOutput("Enter task ID to update:");
          setPromptState({ type: "update-id" });
        });
        break;

      case "Delete Task":
        displayTasks().then(() => {
          addOutput("Enter task ID to delete:");
          setPromptState({ type: "delete-index" });
        });
        break;

      case "Search Tasks":
        addOutput("Enter search term:");
        setPromptState({ type: "search-term" });
        break;

      case "Filter Tasks":
        addOutput("Select priority to filter by (use ↑↓ arrows):");
        setPromptState({ type: "filter-priority" });
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

  const handleUpdateTask = async (id: string, field: string, value: string) => {
    try {
      // Get the existing task first
      const task = await taskApi.getTask(id);

      const updateData: any = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        tags: task.tags,
        dueDate: task.dueDate,
      };

      if (field === "title") {
        updateData.title = value;
      } else if (field === "description") {
        updateData.description = value || null;
      } else if (field === "priority") {
        const validPriorities = ["low", "medium", "high", "critical"];
        if (!validPriorities.includes(value.toLowerCase())) {
          addOutput(
            "[red]✗[/] Invalid priority. Use: Low, Medium, High, or Critical"
          );
          addOutput("");
          resetToMenu();
          return;
        }
        updateData.priority = (value.charAt(0).toUpperCase() +
          value.slice(1).toLowerCase()) as TaskPriority;
      } else if (field === "tags") {
        updateData.tags = value ? value.split(",").map((t) => t.trim()) : [];
      } else if (field === "duedate") {
        if (value) {
          const [day, month, year] = value.split("-");
          if (day && month && year) {
            updateData.dueDate = new Date(
              Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day))
            );
          } else {
            addOutput("[red]✗[/] Invalid date format. Use DD-MM-YYYY");
            addOutput("");
            resetToMenu();
            return;
          }
        } else {
          updateData.dueDate = null;
        }
      }

      await taskApi.updateTask(id, updateData);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      addOutput("");
      addOutput("[green]✓[/] Task updated successfully.");
      addOutput("");
      resetToMenu();
    } catch (error) {
      addOutput("");
      addOutput(
        `[red]✗[/] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      addOutput("");
      resetToMenu();
    }
  };

  const handleSearchTasks = async (term: string) => {
    try {
      // Since we don't have a search endpoint, filter locally
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(term.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(term.toLowerCase()))
      );

      addOutput("");
      if (filtered.length === 0) {
        addOutput("[yellow]No tasks found matching your search.[/]");
      } else {
        addOutput(`Found ${filtered.length} task(s):`);
        addOutput("");
        filtered.forEach((task, idx) => {
          const status = task.isCompleted ? "✓" : "○";
          addOutput(`${idx + 1}. ${status} ${task.title} (${task.priority})`);
        });
      }
      addOutput("");
      resetToMenu();
    } catch (error) {
      addOutput("");
      addOutput(
        `[red]✗[/] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      addOutput("");
      resetToMenu();
    }
  };

  const handleFilterTasks = async (priority: TaskPriority) => {
    try {
      const filtered = tasks.filter((task) => task.priority === priority);

      addOutput("");
      if (filtered.length === 0) {
        addOutput(`[yellow]No ${priority} priority tasks found.[/]`);
      } else {
        addOutput(`Found ${filtered.length} ${priority} priority task(s):`);
        addOutput("");
        filtered.forEach((task, idx) => {
          const status = task.isCompleted ? "✓" : "○";
          addOutput(`${idx + 1}. ${status} ${task.title}`);
        });
      }
      addOutput("");
      resetToMenu();
    } catch (error) {
      addOutput("");
      addOutput(
        `[red]✗[/] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      addOutput("");
      resetToMenu();
    }
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

          {/* Update Priority Selection */}
          {promptState.type === "update-priority" && (
            <div className="mt-2">
              {(["Low", "Medium", "High", "Critical"] as const).map((p) => (
                <div
                  key={p}
                  className={
                    p === updatePriority
                      ? "bg-green-500 pl-2 text-black"
                      : "pl-2 text-gray-400"
                  }
                >
                  {p === updatePriority ? ">" : " "} {p}
                </div>
              ))}
            </div>
          )}

          {/* Filter Priority Selection */}
          {promptState.type === "filter-priority" && (
            <div className="mt-2">
              {(["Low", "Medium", "High", "Critical"] as const).map((p) => (
                <div
                  key={p}
                  className={
                    p === filterPriority
                      ? "bg-green-500 pl-2 text-black"
                      : "pl-2 text-gray-400"
                  }
                >
                  {p === filterPriority ? ">" : " "} {p}
                </div>
              ))}
            </div>
          )}

          {/* Command Input */}
          {promptState.type !== "menu" &&
            promptState.type !== "create-priority" &&
            promptState.type !== "update-priority" &&
            promptState.type !== "filter-priority" && (
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
