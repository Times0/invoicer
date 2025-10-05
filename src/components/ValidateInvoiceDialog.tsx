import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ValidateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  invoiceNumber: string;
  isValidating?: boolean;
}

export function ValidateInvoiceDialog({
  open,
  onOpenChange,
  onConfirm,
  invoiceNumber,
  isValidating = false,
}: ValidateInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Validate Invoice
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to validate invoice{" "}
            <span className="font-semibold text-foreground">{invoiceNumber}</span>?
            <br />
            <br />
            This will update the invoice status to "sent" and make it ready for
            delivery to the client.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isValidating}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isValidating}
            className="bg-green-600 hover:bg-green-700"
          >
            {isValidating ? "Validating..." : "Confirm Validation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

