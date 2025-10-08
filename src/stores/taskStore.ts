import { create } from "zustand";
import type { TaskPriority } from "@/api/taskManagerClient";

export type PromptState =
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

export interface TaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  tags: string;
  dueDate: string;
}

interface TaskStore {
  // Terminal output
  output: string[];
  addOutput: (line: string) => void;
  setOutput: (output: string[]) => void;
  clearOutput: () => void;

  // Prompt state
  promptState: PromptState;
  setPromptState: (state: PromptState) => void;

  // Input
  input: string;
  setInput: (input: string) => void;

  // Menu navigation
  menuIndex: number;
  setMenuIndex: (index: number) => void;
  incrementMenuIndex: (length: number) => void;
  decrementMenuIndex: (length: number) => void;

  // Task creation form
  taskForm: TaskForm;
  setTaskForm: (form: TaskForm) => void;
  updateTaskFormField: <K extends keyof TaskForm>(
    field: K,
    value: TaskForm[K]
  ) => void;
  resetTaskForm: () => void;

  // Task update state
  updateTaskId: string;
  updateField: string;
  updatePriority: TaskPriority;
  setUpdateTaskId: (id: string) => void;
  setUpdateField: (field: string) => void;
  setUpdatePriority: (priority: TaskPriority) => void;
  resetUpdateState: () => void;

  // Filter state
  filterPriority: TaskPriority;
  setFilterPriority: (priority: TaskPriority) => void;

  // Combined actions
  resetToMenu: () => void;
}

const initialTaskForm: TaskForm = {
  title: "",
  description: "",
  priority: "Medium",
  tags: "",
  dueDate: "",
};

export const useTaskStore = create<TaskStore>((set) => ({
  // Terminal output
  output: ["TaskManager CLI v1.0.0", "", "What would you like to do?"],
  addOutput: (line) => set((state) => ({ output: [...state.output, line] })),
  setOutput: (output) => set({ output }),
  clearOutput: () => set({ output: [] }),

  // Prompt state
  promptState: { type: "menu" },
  setPromptState: (promptState) => set({ promptState }),

  // Input
  input: "",
  setInput: (input) => set({ input }),

  // Menu navigation
  menuIndex: 0,
  setMenuIndex: (menuIndex) => set({ menuIndex }),
  incrementMenuIndex: (length) =>
    set((state) => ({ menuIndex: (state.menuIndex + 1) % length })),
  decrementMenuIndex: (length) =>
    set((state) => ({
      menuIndex: (state.menuIndex - 1 + length) % length,
    })),

  // Task creation form
  taskForm: initialTaskForm,
  setTaskForm: (taskForm) => set({ taskForm }),
  updateTaskFormField: (field, value) =>
    set((state) => ({
      taskForm: { ...state.taskForm, [field]: value },
    })),
  resetTaskForm: () => set({ taskForm: initialTaskForm }),

  // Task update state
  updateTaskId: "",
  updateField: "",
  updatePriority: "Medium",
  setUpdateTaskId: (updateTaskId) => set({ updateTaskId }),
  setUpdateField: (updateField) => set({ updateField }),
  setUpdatePriority: (updatePriority) => set({ updatePriority }),
  resetUpdateState: () =>
    set({
      updateTaskId: "",
      updateField: "",
      updatePriority: "Medium",
    }),

  // Filter state
  filterPriority: "Low",
  setFilterPriority: (filterPriority) => set({ filterPriority }),

  // Combined actions
  resetToMenu: () =>
    set({
      promptState: { type: "menu" },
      menuIndex: 0,
      input: "",
      taskForm: initialTaskForm,
      updateTaskId: "",
      updateField: "",
      updatePriority: "Medium",
    }),
}));
