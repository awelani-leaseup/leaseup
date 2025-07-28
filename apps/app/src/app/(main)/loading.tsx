import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="grid h-screen place-content-center bg">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="size-6 animate-spin" />
        <p className="tracking-tight">Loading</p>
      </div>
    </div>
  );
}
