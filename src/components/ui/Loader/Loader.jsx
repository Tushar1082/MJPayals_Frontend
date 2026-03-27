import { createPortal } from "react-dom";
import { LoaderPinwheel } from "lucide-react";

export default function Loader({ open }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] bg-black/40 flex items-center justify-center">
      <LoaderPinwheel className="w-16 h-16 text-white animate-spin" />
    </div>,
    document.body
  );
}
