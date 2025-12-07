import type { FileItem } from "../../types/filteItem";
import { motion, AnimatePresence } from "framer-motion";

type FilePreviewProps = {
  file: FileItem | null;
  onClose: () => void;
};

export function FilePreview({ file, onClose }: FilePreviewProps) {
  return (
    <AnimatePresence>
      {file && (
        <>
          {/* 🔥 Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 🔥 Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base truncate">
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.uploadedAt
                      ? new Date(file.uploadedAt).toLocaleString()
                      : ""}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="px-3 py-1 text-xs rounded-md border border-gray-300 hover:bg-gray-100"
                >
                  Cerrar
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
                {file.cdnUrl ? (
                  <img
                    src={file.cdnUrl}
                    alt={file.filename}
                    className="max-w-full max-h-[80vh] object-contain rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">
                    Sin preview disponible
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
