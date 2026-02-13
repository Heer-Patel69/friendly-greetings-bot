import { useState } from "react";
import { Clock, Plus, MessageSquare } from "lucide-react";

interface LogEntry {
  timestamp: number;
  entry: string;
  tech?: string;
}

interface WorkLogProps {
  logs: LogEntry[];
  onAdd: (entry: string) => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function WorkLog({ logs, onAdd }: WorkLogProps) {
  const [note, setNote] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!note.trim()) return;
    onAdd(note.trim());
    setNote("");
    setShowAdd(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Work Log
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] font-semibold text-primary flex items-center gap-0.5"
        >
          <Plus className="h-3 w-3" /> Add Note
        </button>
      </div>

      {showAdd && (
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add work note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
            className="flex-1 px-3 py-2 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold active:scale-95"
          >
            Add
          </button>
        </div>
      )}

      {logs.length > 0 ? (
        <div className="relative pl-4 space-y-2">
          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border/50" />
          {[...logs].reverse().map((log, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[10.5px] top-1 h-2 w-2 rounded-full bg-primary/60 border border-primary/30" />
              <div className="pl-2">
                <p className="text-xs text-foreground/80">{log.entry}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {formatTime(log.timestamp)}
                  {log.tech && ` • ${log.tech}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground/50 italic">No work log entries yet</p>
      )}
    </div>
  );
}
