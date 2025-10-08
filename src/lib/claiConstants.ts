export const CLAI_COMMANDS = [
  "/clear",
  "/new",
  "/save",
  "/delete",
  "/list",
  "/resume",
  "/role",
  "/model",
] as const;

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export const COMMAND_HELP = {
  "/clear": "Clear the terminal screen",
  "/new [name]": "Create a new session (optionally with a name)",
  "/save <name>": "Save the current session with a name",
  "/delete <name>": "Delete a saved session",
  "/list": "List all saved sessions",
  "/resume <name>": "Resume a saved session",
  "/role [name]": "Set or view the role-playing character",
  "/model [number]": "Set or view the Claude model",
} as const;
