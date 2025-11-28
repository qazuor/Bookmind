/**
 * Export Page (P7-015)
 *
 * Export bookmarks in various formats.
 */

import { Download, FileJson, FileText, Table } from "lucide-react";
import { useState } from "react";
import { toastError, toastSuccess } from "@/components/shared/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ExportFormat = "html" | "json" | "csv";

const formats: Array<{
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "html",
    label: "HTML (Netscape)",
    description: "Standard browser bookmark format. Import into any browser.",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    value: "json",
    label: "JSON",
    description:
      "Complete data export including all metadata and AI summaries.",
    icon: <FileJson className="h-6 w-6" />,
  },
  {
    value: "csv",
    label: "CSV",
    description: "Spreadsheet format. Open in Excel, Google Sheets, etc.",
    icon: <Table className="h-6 w-6" />,
  },
];

export function ExportPage() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("html");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: Replace with actual export API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate file download
      const filename = `bookmarks-${new Date().toISOString().split("T")[0]}.${selectedFormat}`;
      toastSuccess(`Exporting ${filename}...`);
      // TODO: Implement actual file download
    } catch {
      toastError("Failed to export bookmarks");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Export Bookmarks</h1>
        <p className="text-muted-foreground">
          Download your bookmarks in various formats for backup or migration.
        </p>
      </div>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Export Format</CardTitle>
          <CardDescription>
            Choose how you want to export your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedFormat}
            onValueChange={(value: ExportFormat) => setSelectedFormat(value)}
            className="space-y-4"
          >
            {formats.map((format) => (
              <div key={format.value}>
                <Label
                  htmlFor={format.value}
                  className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary"
                >
                  <RadioGroupItem value={format.value} id={format.value} />
                  <div className="text-muted-foreground">{format.icon}</div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium leading-none">{format.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {format.description}
                    </p>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>
            Customize what to include in your export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-archived"
              checked={includeArchived}
              onCheckedChange={(checked) =>
                setIncludeArchived(checked === true)
              }
            />
            <Label
              htmlFor="include-archived"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include archived bookmarks
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Export Info */}
      <Card>
        <CardHeader>
          <CardTitle>What's Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Bookmark URLs, titles, and descriptions</li>
            <li>Categories and tags</li>
            <li>Collection assignments</li>
            <li>Creation and modification dates</li>
            {selectedFormat === "json" && (
              <>
                <li>AI-generated summaries</li>
                <li>Full metadata and settings</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={handleExport} disabled={isExporting} size="lg">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Bookmarks"}
        </Button>
      </div>
    </div>
  );
}
