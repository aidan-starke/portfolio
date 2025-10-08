import { useState, useEffect, useRef } from "react";
import { Terminal, ChevronRight, Loader2 } from "lucide-react";
import { useClaiSession } from "@/hooks/useClaiSession";
import { CLAI_COMMANDS, COMMAND_HELP, DEFAULT_MODEL } from "@/lib/claiConstants";

type OutputLine = {
  text: string;
  type: "system" | "user" | "assistant" | "error" | "info";
};

export default function ClaiChat() {
  const [output, setOutput] = useState<OutputLine[]>([
    { text: "CLAI - Command Line AI Interface v1.0.0", type: "system" },
    { text: "", type: "system" },
    { text: "Type your message to chat, or use /help for commands", type: "info" },
    { text: "", type: "system" },
  ]);
  const [input, setInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [showCommandHelp, setShowCommandHelp] = useState(false);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const session = useClaiSession();

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      try {
        const sess = await session.initializeSession();
        addOutput({
          text: `✨ Session initialized (ID: ${sess.id})`,
          type: "info",
        });
        if (sess.display_name) {
          addOutput({
            text: `📝 Session: ${sess.display_name}`,
            type: "info",
          });
        }
        addOutput({ text: "", type: "system" });
      } catch (err) {
        addOutput({
          text: `✗ Failed to initialize: ${err instanceof Error ? err.message : "Unknown error"}`,
          type: "error",
        });
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addOutput = (line: OutputLine) => {
    setOutput((prev) => [...prev, line]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isWaitingForResponse) return;

    const message = input.trim();
    setInput("");

    // Check if it's a command
    if (message.startsWith("/")) {
      if (message === "/help") {
        showHelp();
        return;
      }
      await handleCommand(message);
      return;
    }

    // Regular chat message
    addOutput({ text: `> ${message}`, type: "user" });
    setIsWaitingForResponse(true);

    try {
      const response = await session.sendMessage(message);
      addOutput({ text: "", type: "system" });
      addOutput({ text: response, type: "assistant" });
      addOutput({ text: "", type: "system" });
    } catch (err) {
      addOutput({
        text: `✗ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        type: "error",
      });
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const showHelp = () => {
    addOutput({ text: "", type: "system" });
    addOutput({ text: "📚 Available Commands:", type: "info" });
    addOutput({ text: "─────────────────────", type: "info" });
    Object.entries(COMMAND_HELP).forEach(([cmd, desc]) => {
      addOutput({ text: `${cmd.padEnd(20)} ${desc}`, type: "info" });
    });
    addOutput({ text: "", type: "system" });
  };

  const handleCommand = async (cmd: string) => {
    const parts = cmd.split(" ");
    const command = parts[0];
    const args = parts.slice(1).join(" ");

    addOutput({ text: `> ${cmd}`, type: "user" });

    try {
      switch (command) {
        case "/clear":
          setOutput([]);
          break;

        case "/new":
          await handleNew(args);
          break;

        case "/save":
          await handleSave(args);
          break;

        case "/delete":
          await handleDelete(args);
          break;

        case "/list":
          await handleList();
          break;

        case "/resume":
          await handleResume(args);
          break;

        case "/role":
          await handleRole(args);
          break;

        case "/model":
          await handleModel(args);
          break;

        default:
          addOutput({
            text: `✗ Unknown command: ${command}`,
            type: "error",
          });
          addOutput({
            text: "Type /help to see available commands",
            type: "info",
          });
      }
    } catch (err) {
      addOutput({
        text: `✗ Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        type: "error",
      });
    }
  };

  const handleNew = async (name: string) => {
    const sess = await session.createNewSession(name || undefined);
    addOutput({ text: "", type: "system" });
    addOutput({
      text: `✨ Created new session (ID: ${sess.id})`,
      type: "info",
    });
    if (sess.display_name) {
      addOutput({
        text: `📝 Session: ${sess.display_name}`,
        type: "info",
      });
    }
    addOutput({ text: "", type: "system" });
  };

  const handleSave = async (name: string) => {
    if (!name) {
      addOutput({ text: "Usage: /save <name>", type: "error" });
      return;
    }
    await session.saveSession(name);
    addOutput({ text: "", type: "system" });
    addOutput({ text: `✅ Session saved as '${name}'`, type: "info" });
    addOutput({ text: "", type: "system" });
  };

  const handleDelete = async (name: string) => {
    if (!name) {
      addOutput({ text: "Usage: /delete <name>", type: "error" });
      return;
    }

    // Check if trying to delete current session
    if (session.currentSession?.display_name === name) {
      addOutput({
        text: "✗ Cannot delete the current session. Switch to another session first.",
        type: "error",
      });
      return;
    }

    await session.deleteSession(name);
    addOutput({ text: "", type: "system" });
    addOutput({ text: `🗑️  Session '${name}' deleted`, type: "info" });
    addOutput({ text: "", type: "system" });
  };

  const handleList = async () => {
    const sessions = await session.listSessions();
    addOutput({ text: "", type: "system" });
    if (sessions.length === 0) {
      addOutput({ text: "No saved sessions found", type: "info" });
    } else {
      addOutput({ text: "📚 Saved Sessions:", type: "info" });
      addOutput({ text: "─────────────────", type: "info" });
      sessions.forEach((s) => {
        if (s.display_name) {
          let line = `• ${s.display_name} (ID: ${s.id})`;
          if (s.role) line += ` 🎭 ${s.role}`;
          addOutput({ text: line, type: "info" });
        }
      });
    }
    addOutput({ text: "", type: "system" });
  };

  const handleResume = async (name: string) => {
    if (!name) {
      addOutput({ text: "Usage: /resume <name>", type: "error" });
      return;
    }
    const sess = await session.resumeSession(name);
    addOutput({ text: "", type: "system" });
    addOutput({ text: `🔄 Switched to session: '${name}'`, type: "info" });
    addOutput({ text: `📝 Session ID: ${sess.id}`, type: "info" });
    if (sess.role) {
      addOutput({ text: `🎭 Role: ${sess.role}`, type: "info" });
    }
    if (sess.model) {
      addOutput({ text: `🤖 Model: ${sess.model}`, type: "info" });
    }
    addOutput({ text: "", type: "system" });
  };

  const handleRole = async (role: string) => {
    if (!role) {
      // Show current role
      const currentRole = session.currentSession?.role;
      addOutput({ text: "", type: "system" });
      if (currentRole) {
        addOutput({ text: `🎭 Current role: '${currentRole}'`, type: "info" });
      } else {
        addOutput({
          text: "🎭 No role set (Claude will respond as default assistant)",
          type: "info",
        });
      }
      addOutput({ text: "", type: "system" });
      return;
    }

    await session.setRole(role);
    addOutput({ text: "", type: "system" });
    addOutput({ text: `🎭 Role set to: '${role}'`, type: "info" });
    addOutput({ text: "", type: "system" });
  };

  const handleModel = async (modelInput: string) => {
    if (!modelInput) {
      // Show current model and available models
      const models = await session.getModels();
      const currentModel =
        session.currentSession?.model || DEFAULT_MODEL;

      addOutput({ text: "", type: "system" });
      addOutput({ text: `🤖 Current model: ${currentModel}`, type: "info" });
      addOutput({ text: "", type: "system" });
      addOutput({ text: "📋 Available models:", type: "info" });
      addOutput({ text: "─────────────────", type: "info" });

      models.forEach((m, i) => {
        const indicator = m.id === currentModel ? "→" : " ";
        addOutput({
          text: `${indicator} ${i + 1}. ${m.id} - ${m.display_name}`,
          type: "info",
        });
      });
      addOutput({ text: "", type: "system" });
      addOutput({
        text: "💡 Use '/model <number>' to select a model",
        type: "info",
      });
      addOutput({ text: "", type: "system" });
      return;
    }

    // Parse model selection by number
    const modelIndex = parseInt(modelInput);
    if (isNaN(modelIndex)) {
      addOutput({
        text: "✗ Please provide a valid number. Use '/model' to see available options.",
        type: "error",
      });
      return;
    }

    const models = await session.getModels();
    if (modelIndex < 1 || modelIndex > models.length) {
      addOutput({
        text: "✗ Invalid model number. Use '/model' to see available options.",
        type: "error",
      });
      return;
    }

    const selectedModel = models[modelIndex - 1];
    await session.setModel(selectedModel.id);
    addOutput({ text: "", type: "system" });
    addOutput({
      text: `🤖 Model set to: '${selectedModel.display_name}'`,
      type: "info",
    });
    addOutput({ text: "", type: "system" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Show command help if typing a command
    if (value.startsWith("/") && value.length > 1) {
      setShowCommandHelp(true);
    } else {
      setShowCommandHelp(false);
    }
  };

  const getFilteredCommands = () => {
    if (!showCommandHelp) return [];
    const search = input.toLowerCase();
    return CLAI_COMMANDS.filter((cmd) => cmd.startsWith(search));
  };

  const formatOutputLine = (line: OutputLine) => {
    const classes: Record<typeof line.type, string> = {
      system: "text-gray-500",
      user: "text-green-400",
      assistant: "text-blue-400",
      error: "text-red-400",
      info: "text-cyan-400",
    };
    return classes[line.type] || "text-gray-300";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Terminal className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold">CLAI Chat</h1>
        {session.currentSession && (
          <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
            {session.currentSession.display_name && (
              <span>📝 {session.currentSession.display_name}</span>
            )}
            {session.currentSession.role && (
              <span>🎭 {session.currentSession.role}</span>
            )}
          </div>
        )}
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
          <span className="ml-4 text-sm text-gray-400">clai@localhost:~</span>
        </div>

        {/* Terminal Output */}
        <div className="h-[600px] overflow-y-auto p-4 font-mono text-sm">
          {output.map((line, idx) => (
            <div key={idx} className={formatOutputLine(line)}>
              {line.text || "\u00A0"}
            </div>
          ))}

          {/* Loading spinner */}
          {isWaitingForResponse && (
            <div className="mt-2 flex items-center gap-2 text-cyan-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          {/* Command suggestions */}
          {showCommandHelp && getFilteredCommands().length > 0 && (
            <div className="mt-2 rounded border border-gray-700 bg-gray-800 p-2">
              {getFilteredCommands().map((cmd) => (
                <div key={cmd} className="text-gray-400">
                  {cmd}
                </div>
              ))}
            </div>
          )}

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="mt-2 flex items-center">
            <ChevronRight className="mr-2 h-4 w-4 text-cyan-400" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              disabled={isWaitingForResponse}
              className="flex-1 bg-transparent font-mono text-cyan-400 outline-none disabled:opacity-50"
              placeholder={
                isWaitingForResponse
                  ? "Waiting for response..."
                  : "Type a message or /help for commands..."
              }
              autoFocus
            />
          </form>

          <div ref={outputEndRef} />
        </div>
      </div>

      <div className="mt-4 font-mono text-sm text-gray-500">
        {session.currentSession?.model && `Model: ${session.currentSession.model}`}
      </div>
    </div>
  );
}
