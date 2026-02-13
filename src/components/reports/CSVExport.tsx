import { Download } from "lucide-react";

interface CSVExportProps {
  headers: string[];
  rows: string[][];
  filename: string;
  label?: string;
}

function exportToCSV(headers: string[], rows: string[][], filename: string) {
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function CSVExport({ headers, rows, filename, label = "Export CSV" }: CSVExportProps) {
  return (
    <button
      onClick={() => exportToCSV(headers, rows, filename)}
      className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-transform border border-primary/20"
    >
      <Download className="h-3 w-3" />
      {label}
    </button>
  );
}
