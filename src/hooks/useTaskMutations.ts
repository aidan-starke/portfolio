import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi, type TaskPriority } from "@/api/taskManagerClient";

interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  tags: string[];
  dueDate?: Date;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: Date;
}

interface CreateTaskCallbacks {
  onSuccess: (id: string) => void;
  onError: (error: Error) => void;
}

interface CompleteTaskCallbacks {
  onSuccess: (variables: { id: string; isCompleted: boolean }) => void;
  onError: (error: Error) => void;
}

interface BasicCallbacks {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskData) => taskApi.createTask(data),
  });

  const completeTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.completeTask(id, isCompleted),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      taskApi.updateTask(id, data),
  });

  return {
    createTask: (data: CreateTaskData, callbacks: CreateTaskCallbacks) => {
      createTaskMutation.mutate(data, {
        onSuccess: (id) => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          callbacks.onSuccess(id);
        },
        onError: callbacks.onError,
      });
    },
    completeTask: (
      params: { id: string; isCompleted: boolean },
      callbacks: CompleteTaskCallbacks
    ) => {
      completeTaskMutation.mutate(params, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["tasks"] });
          callbacks.onSuccess(params);
        },
        onError: callbacks.onError,
      });
    },
    deleteTask: (id: string, callbacks: BasicCallbacks) => {
      deleteTaskMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          callbacks.onSuccess();
        },
        onError: callbacks.onError,
      });
    },
    updateTask: (
      params: { id: string; data: UpdateTaskData },
      callbacks: BasicCallbacks
    ) => {
      updateTaskMutation.mutate(params, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ["tasks"] });
          callbacks.onSuccess();
        },
        onError: callbacks.onError,
      });
    },
  };
}
