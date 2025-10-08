import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  taskApi,
  type TaskPriority,
  type CreateTaskDto,
} from "@/api/taskManagerClient";
import { queryClient } from "@/App";

export function useTasks() {
  // Fetch all tasks
  const {
    data: tasks = [],
    refetch,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskApi.getTasks(),
  });

  // Map task indices (1-based) to task IDs for easy lookup
  const taskIndexMap = useMemo(() => {
    const map: Record<number, string> = {};
    tasks.forEach((task, idx) => {
      map[idx + 1] = task.id;
    });
    return map;
  }, [tasks]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Complete/uncomplete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.completeTask(id, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskDto> }) =>
      taskApi.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Get single task
  const getTask = async (id: string) => {
    return taskApi.getTask(id);
  };

  // Filter tasks by priority
  const filterByPriority = (priority: TaskPriority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  // Search tasks by term
  const searchTasks = (term: string) => {
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(term.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(term.toLowerCase()))
    );
  };

  return {
    // Data
    tasks,
    taskIndexMap,
    isLoading,
    error,

    // Queries
    refetch,
    getTask,

    // Mutations
    createTask: createTaskMutation.mutate,
    createTaskAsync: createTaskMutation.mutateAsync,
    completeTask: completeTaskMutation.mutate,
    completeTaskAsync: completeTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutate,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutate,
    updateTaskAsync: updateTaskMutation.mutateAsync,

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,

    // Helpers
    filterByPriority,
    searchTasks,
  };
}
