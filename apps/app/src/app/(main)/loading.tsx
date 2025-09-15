import {
  AlertDialog,
  AlertDialogContent,
} from "@leaseup/ui/components/alert-dialog";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <AlertDialog open>
      <AlertDialogContent className="flex items-center justify-center sm:max-w-fit">
        <Loader2 className="text-primary size-5 animate-spin" />
      </AlertDialogContent>
    </AlertDialog>
  );
}
