import { useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Database,
  Download,
  FileText,
  Archive,
  Loader2,
  Play,
  Repeat,
} from "lucide-react";

const DBForm = () => {
  const [action, setAction] = useState<"backup" | "migrate">("backup");
  const [outputFormat, setOutputFormat] = useState<"sql" | "tar">("sql");
  const [sourceUrl, setSourceUrl] = useState("");
  const [destUrl, setDestUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  function isValidPgUrl(url: string) {
    try {
      const u = new URL(url);
      return (
        ["postgres:", "postgresql:"].includes(u.protocol) &&
        !!u.hostname &&
        !!u.pathname
      );
    } catch {
      return false;
    }
  }

  async function downloadBackup(
    action: string,
    outputFormat: string,
    dbType: string,
    sourceUrl: string,
    destUrl: string
  ) {
    const apiUrl = `http://localhost:8000/${action}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        outputFormat,
        dbType,
        sourceUrl,
        destUrl,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      alert("Backup failed: " + err.message);
      return;
    }

    if (action === "backup") {
      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Use filename from Content-Disposition header if available
      const fileName = `backup.${outputFormat}`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }else{

      console.log(await response.json());
      
    }
  }

  const handleExecute = async () => {
    if (!isValidPgUrl(sourceUrl.trim())) {
      alert("Please enter a valid PostgreSQL URL");
      return;
    }
    if (action === "migrate" && !isValidPgUrl(destUrl)) {
      alert("Please enter a valid PostgreSQL URL");
      return;
    }

    setIsLoading(true);

    await downloadBackup(action, outputFormat, "postgres", sourceUrl, destUrl);
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 shadow-sm rounded-lg bg-white">
      <div className=" mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">Database Tool</h2>
        </div>
        <p className="text-gray-600">PostgreSQL Backup & Migration</p>
      </div>

      <div>
        {/* Left Column */}
        <div className="space-y-6">
          {/* Action Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Action</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="backup"
                  checked={action === "backup"}
                  onChange={() => setAction("backup")}
                  className="text-blue-600"
                />
                <Download className="h-5 w-5" />
                <span>Backup</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="migrate"
                  checked={action === "migrate"}
                  onChange={() => setAction("migrate")}
                  className="text-blue-600"
                />
                <Repeat className="h-5 w-5" />
                <span>Sync (Migrate source to destination)</span>
              </label>
            </div>
          </div>

          {/* Database Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Database</Label>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700">PostgreSQL</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-4">
          {/* Source URL */}
          <div>
            <Label
              htmlFor="source-url"
              className="text-base font-medium mb-3 block"
            >
              Source Database URL
            </Label>
            <Input
              id="source-url"
              type="url"
              placeholder="postgresql://username:password@host:port/database"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Destination URL (for migration) */}
          {action === "migrate" && (
            <div>
              <Label
                htmlFor="dest-url"
                className="text-base font-medium mb-3 block"
              >
                Destination Database URL
              </Label>
              <Input
                id="dest-url"
                type="url"
                placeholder="postgresql://username:password@host:port/database"
                value={destUrl}
                onChange={(e) => setDestUrl(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Output Format (for backup) */}
        {action === "backup" && (
          <div className="mt-4">
            <Label className="text-base font-medium mb-3 block">
              Output Format
            </Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="sql"
                  checked={outputFormat === "sql"}
                  onChange={() => setOutputFormat("sql")}
                  className="text-blue-600"
                />
                <FileText className="h-5 w-5" />
                <span>SQL</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <input
                  type="radio"
                  value="tar"
                  checked={outputFormat === "tar"}
                  onChange={() => setOutputFormat("tar")}
                  className="text-blue-600"
                />
                <Archive className="h-5 w-5" />
                <span>TAR</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Execute Button */}
      <div className="mt-8">
        <Button
          onClick={handleExecute}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              Start {action}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DBForm;
