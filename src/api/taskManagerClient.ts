import { z } from "zod";
import { fetchJson } from "../lib/api-client";

const TASK_API = import.meta.env.VITE_TASK_API_URL || "http://localhost:5000";

export const TaskPrioritySchema = z.enum(["Low", "Medium", "High", "Critical"]);

export const TaskItemSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  priority: TaskPrioritySchema,
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
  dueDate: z.coerce.date().nullable(),
  isCompleted: z.boolean(),
});

export const TaskListSchema = z.array(TaskItemSchema);

export const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: TaskPrioritySchema,
  tags: z.array(z.string()).optional(),
  dueDate: z.coerce.date().optional(),
});

export const TaskIdSchema = z.uuid();

export type TaskItem = z.infer<typeof TaskItemSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export interface FilterTasksParams {
  title?: string;
  description?: string;
  isCompleted?: boolean;
  priority?: TaskPriority;
  tags?: string[];
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: "Title" | "Priority" | "DueDate" | "CreatedAt" | "IsCompleted";
  sortDescending?: boolean;
}

export const taskApi = {
  getTasks: async (): Promise<TaskItem[]> => {
    return fetchJson(`${TASK_API}/tasks`, TaskListSchema);
  },

  getTask: async (id: string): Promise<TaskItem> => {
    return fetchJson(`${TASK_API}/tasks/${id}`, TaskItemSchema);
  },

  createTask: async (task: CreateTaskDto): Promise<string> => {
    return fetchJson(`${TASK_API}/tasks`, TaskIdSchema, {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  updateTask: async (
    id: string,
    task: Partial<CreateTaskDto>
  ): Promise<void> => {
    return fetchJson(`${TASK_API}/tasks/${id}`, z.void(), {
      method: "PUT",
      body: JSON.stringify(task),
    });
  },

  completeTask: async (id: string): Promise<void> => {
    return fetchJson(`${TASK_API}/tasks/${id}/complete`, z.void(), {
      method: "PUT",
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return fetchJson(`${TASK_API}/tasks/${id}`, z.void(), {
      method: "DELETE",
    });
  },

  filterTasks: async (params: FilterTasksParams): Promise<TaskItem[]> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(key, String(v)));
        } else {
          query.append(key, String(value));
        }
      }
    });
    return fetchJson(`${TASK_API}/tasks/filter?${query}`, TaskListSchema);
  },
};
