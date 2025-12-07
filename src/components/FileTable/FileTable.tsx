import type { FileItem } from "../../types/filteItem";

type FileTableProps = {
  loadingFiles: boolean;
  files: FileItem[];
  onSelectFile: (file: FileItem) => void;
};

function formatSize(bytes: number) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

export const FileTable = ({
  loadingFiles,
  files,
  onSelectFile,
}: FileTableProps) => {
  if (loadingFiles) {
    return <p className="text-gray-500 text-sm">Cargando archivos…</p>;
  }

  if (!loadingFiles && files.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No hay archivos en este bucket.</p>
    );
  }

  const handleDownload = async (file: FileItem) => {
    if (!file.cdnUrl) return;

    try {
      // 1) Bajamos el archivo como blob (sin navegar)
      const response = await fetch(file.cdnUrl);
      if (!response.ok) {
        console.error("Error al descargar:", response.statusText);
        alert("No se pudo descargar el archivo.");
        return;
      }

      const blob = await response.blob();

      // 2) Creamos una URL temporal en el browser
      const url = window.URL.createObjectURL(blob);

      // 3) Creamos un link y disparamos click
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename || "archivo";
      document.body.appendChild(link);
      link.click();

      // 4) Limpiamos
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el archivo (error de red o CORS).");
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">
              Nombre
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">
              Tamaño
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">
              Fecha subida
            </th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {files.map((file) => (
            <tr
              key={file.uuid}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectFile(file)}
            >
              <td className="px-4 py-2 font-mono text-xs md:text-sm">
                {file.filename}
              </td>
              <td className="px-4 py-2">{formatSize(file.size ?? 0)}</td>
              <td className="px-4 py-2">
                {file.uploadedAt
                  ? new Date(file.uploadedAt).toLocaleString()
                  : "-"}
              </td>
              <td className="px-4 py-2">
                <button
                  className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
                  onClick={(e) => {
                    e.stopPropagation(); // no dispara el onSelectFile de la fila
                    handleDownload(file);
                  }}
                >
                  Descargar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
