import { useRef, useState } from "react";
import { usePortal } from "@/lib/portal-store";
import type { DocStatus, DocType, StudentDocument } from "@/lib/portal-types";
import { DOC_STATUSES, DOC_TYPES } from "@/lib/portal-types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const { documents, addDocument, removeDocument, updateDocument } = usePortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pending, setPending] = useState<File[] | null>(null);
  const [pendingType, setPendingType] = useState<DocType>("Essay");
  const [pendingStatus, setPendingStatus] = useState<DocStatus>("Pending");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPending(Array.from(files));
    setPendingType("Essay");
    setPendingStatus("Pending");
  };

  const confirmUpload = () => {
    if (!pending) return;
    pending.forEach((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const safeExt: StudentDocument["ext"] =
        ext === "pdf" ? "pdf" : ext === "docx" || ext === "doc" ? "docx" : ext === "png" ? "png" : "jpg";
      addDocument({
        id: `d${Date.now()}-${f.name}`,
        name: f.name,
        ext: safeExt,
        type: pendingType,
        status: pendingStatus,
        modified: new Date().toISOString().slice(0, 10),
      });
    });
    toast.success(`${pending.length} file(s) uploaded`);
    setPending(null);
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
                  <TableCell>
                    <Select
                      value={d.type}
                      onValueChange={(v) => updateDocument(d.id, { type: v as DocType })}
                    >
                      <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={d.status}
                      onValueChange={(v) =>
                        updateDocument(d.id, { status: v as DocStatus })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 w-[140px] border",
                          statusClass(d.status),
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOC_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

      <Dialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Classify Upload</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Files</Label>
              <Input
                readOnly
                value={(pending ?? []).map((f) => f.name).join(", ")}
                className="mt-1.5 bg-muted"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Document Type</Label>
                <Select value={pendingType} onValueChange={(v) => setPendingType(v as DocType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={pendingStatus}
                  onValueChange={(v) => setPendingStatus(v as DocStatus)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button onClick={confirmUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}