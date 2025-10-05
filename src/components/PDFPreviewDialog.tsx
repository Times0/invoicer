import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

interface PDFPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrl: string | null;
  title?: string;
}

export function PDFPreviewDialog({
  open,
  onOpenChange,
  pdfUrl,
  title = "Invoice Preview",
}: PDFPreviewDialogProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] flex flex-col p-0 max-w-[1200px] w-[90vw] min-w-[min(900px,98vw)]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {pdfUrl && !error ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
              onError={() => setError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Unable to display PDF preview</p>
                <p className="text-sm mt-2">Try downloading the PDF instead</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
