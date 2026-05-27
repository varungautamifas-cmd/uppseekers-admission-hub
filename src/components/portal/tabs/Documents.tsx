import { useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { DocStatus, StudentDocument } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Download, FileImage, FileText, FileType2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

function statusClass(s: DocStatus) {
  switch (s) {
    case "Verified":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "Under Review":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function ExtIcon({ ext }: { ext: StudentDocument["ext"] }) {
  if (ext === "pdf") return <FileType2 className="h-4 w-4 text-red-500" />;
  if (ext === "docx") return <FileText className="h-4 w-4 text-blue-500" />;
  return <FileImage className="h-4 w-4 text-emerald-500" />;
}

export function Documents() {
  const { documents, addDocument, removeDocument } = usePortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const safeExt: StudentDocument["ext"] =
        ext === "pdf" ? "pdf" : ext === "docx" || ext === "doc" ? "docx" : ext === "png" ? "png" : "jpg";
      addDocument({
        id: `d${Date.now()}-${f.name}`,
        name: f.name,
        ext: safeExt,
        type: "Essay",
        status: "Pending",
        modified: new Date().toISOString().slice(0, 10),
      });
    });
    toast.success(`${files.length} file(s) uploaded`);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <UploadCloud className="h-7 w-7 text-muted-foreground" />
        <div className="text-sm">
          Drag & drop documents here, or{" "}
          <button
            className="font-medium text-primary underline-offset-2 hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            browse to upload
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ExtIcon ext={d.ext} />
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{d.type}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        statusClass(d.status),
                      )}
                    >
                      {d.status}
                    </span>
                  </TableCell>
                  <TableCell>{d.modified}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label="Download">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeDocument(d.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}