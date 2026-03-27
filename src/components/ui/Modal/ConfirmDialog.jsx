// import { Dialog } from "@headlessui/react";

// export default function ConfirmDialog({
//   isOpen,
//   onClose,
//   onConfirm,
//   title = "Confirm Action",
//   message = "Are you sure you want to continue?",
// }) {
//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

//       {/* Centered Panel */}
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
//           <Dialog.Title className="text-lg font-semibold">
//             {title}
//           </Dialog.Title>

//           <p className="mt-2 text-sm text-gray-600">{message}</p>

//           <div className="mt-6 flex justify-end gap-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={onConfirm}
//               className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
//             >
//               Confirm
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }

import { Dialog } from "@headlessui/react";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default", // "default" | "danger"
  showCancel = true,
}) {
  const confirmStyles =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      {/* Centered Panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">
            {title}
          </Dialog.Title>

          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6 flex justify-end gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white ${confirmStyles}`}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
