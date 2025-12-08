// src/components/FilesToolbar.tsx
import { useRef } from "react";
import { Widget as UploadcareWidget } from "@uploadcare/react-widget";

type FilesToolbarProps = {
  selectedBucket: string | null;
  customBucket: string;
  onChangeCustomBucket: (value: string) => void;
  onShare: () => void;
  onUploadDone: (fileInfo: any) => void;
};

const WidgetAny = UploadcareWidget as any;

export function FilesToolbar({
  selectedBucket,
  customBucket,
  onChangeCustomBucket,
  onShare,
  onUploadDone,
}: FilesToolbarProps) {
  const widgetApi = useRef<any>(null);

  const openUploadDialog = () => {
    const bucketToUse =
      customBucket.trim() !== "" ? customBucket.trim() : selectedBucket;

    if (!bucketToUse) return;

    if (!widgetApi.current) {
      console.error("Uploadcare widget API not initialized");
      return;
    }

    widgetApi.current.openDialog();
  };

  return (
    <>
      <WidgetAny
        publicKey={import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY}
        ref={widgetApi}
        multiple={false}
        imagesOnly={false}
        clearable
        style={{ display: "none" }}
        onChange={(fileInfo: any) => {
          if (!fileInfo) return;
          console.log("UPLOADCARE FILE:", fileInfo);

          // 👉 Limpia el widget para que desaparezca la imagen cargada
          if (widgetApi.current) {
            widgetApi.current.value(null);
          }

          onUploadDone(fileInfo);
        }}
      />

      <div className="flex items-center justify-between mb-3">
        {/* Left */}
        <div>
          <h2 className="text-xl font-semibold">
            Archivos{" "}
            {selectedBucket ? (
              <span className="text-gray-500 text-base">
                en <span className="font-mono">{selectedBucket}</span>
              </span>
            ) : null}
          </h2>
          <p className="text-xs text-gray-500">
            Seleccioná un archivo en la tabla para poder compartirlo.
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nuevo bucket (opcional)"
            className="border rounded px-2 py-1 text-xs w-40"
            value={customBucket}
            onChange={(e) => onChangeCustomBucket(e.target.value)}
          />

          <button
            type="button"
            onClick={onShare}
            className="px-3 py-1 text-xs md:text-sm rounded border border-gray-300 bg-white hover:bg-gray-100"
          >
            Share
          </button>

          <button
            type="button"
            disabled={!selectedBucket && customBucket.trim() === ""}
            onClick={openUploadDialog}
            className="px-3 py-1 text-xs md:text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload
          </button>
        </div>
      </div>
    </>
  );
}
