import React, { useRef, useState } from "react";
import { Download, Upload, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ExportImportActionsProps {
  recipes: any[];
  onImportSuccess?: () => void;
}

export const ExportImportActions: React.FC<ExportImportActionsProps> = ({
  recipes,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Handle Export to JSON
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(recipes, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.download = `recipe_vault_backup_${Date.now()}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Recipes exported to JSON successfully!");
    } catch (e) {
      toast.error("Failed to export to JSON");
    } finally {
      setShowExportMenu(false);
    }
  };

  // Handle Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        "name",
        "description",
        "ingredients",
        "instructions",
        "preparation_time",
        "cooking_time",
        "servings",
        "category",
        "difficulty",
        "cuisine",
        "image_url",
        "tags"
      ];

      const csvRows = [
        headers.join(","), // header row
        ...recipes.map((r) => {
          return headers
            .map((fieldName) => {
              let value = r[fieldName];
              if (value === null || value === undefined) {
                value = "";
              }
              // Format arrays as semicolon-separated lists
              if (Array.isArray(value)) {
                value = value.join(";");
              } else if (typeof value === "object") {
                // If it is JSONB from Postgres but stored differently, stringify
                value = JSON.stringify(value);
              }
              // Escape quotes in strings
              const stringVal = String(value).replace(/"/g, '""');
              // Wrap value in quotes to handle commas, newlines, etc.
              return `"${stringVal}"`;
            })
            .join(",");
        }),
      ];

      const csvStr = csvRows.join("\n");
      const csvBlob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.download = `recipe_vault_backup_${Date.now()}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Recipes exported to CSV successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export to CSV");
    } finally {
      setShowExportMenu(false);
    }
  };

  // Handle File Import Upload
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension !== "json" && fileExtension !== "csv") {
      toast.error("Unsupported file format. Please upload a .json or .csv file.");
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const apiFormat = fileExtension === "csv" ? "csv" : "json";

        const response = await fetch(`/api/import?format=${apiFormat}`, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: text,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Import request failed");
        }

        if (data.success) {
          toast.success(`Successfully imported ${data.count} recipes!`);
          if (data.failed_count > 0) {
            toast.warning(`Skipped ${data.failed_count} invalid recipes.`);
          }
          if (onImportSuccess) {
            onImportSuccess();
          }
        } else {
          toast.error(data.message || "Failed to import recipes.");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "An error occurred during file parsing.");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 relative">
      {/* Hidden File Input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.csv"
        className="hidden"
      />

      {/* Import Button */}
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className="rounded-xl border-slate-200 text-xs font-semibold py-2"
      >
        {importing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 text-[#2563EB]" />
        )}
        Import Data
      </Button>

      {/* Export Dropdown Anchor */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={recipes.length === 0}
          className="rounded-xl border-slate-200 text-xs font-semibold py-2"
        >
          <Download className="h-4 w-4 text-[#22C55E]" />
          Export Data
        </Button>

        {showExportMenu && (
          <>
            {/* Backdrop cover to close menu */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowExportMenu(false)}
            />
            {/* Dropdown Card */}
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden py-1">
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2"
              >
                <FileJson className="h-4 w-4 text-[#2563EB]" />
                Export as JSON
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-[#22C55E]" />
                Export as CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
