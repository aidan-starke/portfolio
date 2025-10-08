import type { TaskPriority } from "@/api/taskManagerClient";

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export const TASK_DETAIL_WIDTH = 69;

export const MENU_OPTIONS = [
  "Create Task",
  "List All Tasks",
  "View Task by ID",
  "Complete Task",
  "Update Task",
  "Delete Task",
  "Search Tasks",
  "Filter Tasks",
  "Clear",
] as const;

export const UPDATABLE_FIELDS = [
  "title",
  "description",
  "priority",
  "tags",
  "duedate",
] as const;

export type UpdatableField = (typeof UPDATABLE_FIELDS)[number];
