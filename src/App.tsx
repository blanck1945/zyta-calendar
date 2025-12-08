// src/App.tsx
import { useEffect, useState } from "react";
import axios from "axios";

import type { Bucket } from "./types/bucket";
import type { FileItem } from "./types/filteItem";
import { SafeLink } from "./components/SafeLink/SafeLink";
import { BucketsSection } from "./components/BucketSection/BucketSection";
import { FilesToolbar } from "./components/FilesToolbar/FilesToolbar";
import { FileTable } from "./components/FileTable/FileTable";
import { FilePreview } from "./components/FilePreview/FilePreivew";
import { useYourIdAuth } from "./sdk/useYourIDAuth";

function App() {
  // 1) Usamos el SDK
  useYourIdAuth({
    applicationBaseUrl: import.meta.env.VITE_APPLICATION_MICROSERVICE_URL,
    yourIdLoginUrl: import.meta.env.VITE_YOUR_ID_LOGIN_URL,
    env: import.meta.env.VITE_ENV, // "dev" | "prod"
  });

  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const [loadingBuckets, setLoadingBuckets] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploadWidgetOpen, setIsUploadWidgetOpen] = useState(false); // ya no lo usás si abrís modal directo, pero lo dejo por si lo querés más adelante
  const [customBucket, setCustomBucket] = useState(""); // 👈 nombre de bucket nuevo opcional

  console.warn(isUploadWidgetOpen);

  // 🔹 Cargar lista de buckets
  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        setLoadingBuckets(true);
        setError(null);

        const res = await axios.get<Bucket[]>(
          `${import.meta.env.VITE_APPLICATION_URL}/uploadcare/buckets`
        );

        setBuckets(res.data);
        if (res.data.length > 0) {
          setSelectedBucket(res.data[0].name);
        }
      } catch (err: any) {
        console.error(err);
        setError("No se pudieron cargar los buckets.");
      } finally {
        setLoadingBuckets(false);
      }
    };

    fetchBuckets();
  }, []);

  // 🔹 Cargar archivos del bucket seleccionado
  useEffect(() => {
    if (!selectedBucket) return;

    const fetchFiles = async () => {
      try {
        setLoadingFiles(true);
        setError(null);

        const res = await axios.get<{
          bucket: string;
          files: FileItem[];
        }>(
          `${
            import.meta.env.VITE_APPLICATION_URL
          }/uploadcare/buckets/${encodeURIComponent(selectedBucket)}`
        );

        setFiles(res.data.files);
        setSelectedFile(null); // al cambiar de bucket, limpiamos el preview
      } catch (err: any) {
        console.error(err);
        setError("No se pudieron cargar los archivos de ese bucket.");
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [selectedBucket]);

  const handleShare = () => {
    if (!selectedFile) {
      alert("Primero seleccioná un archivo de la tabla para compartir.");
      return;
    }

    if (!selectedFile.cdnUrl) {
      alert("Este archivo no tiene una URL pública disponible.");
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(selectedFile.cdnUrl);
      alert("URL copiada al portapapeles:\n" + selectedFile.cdnUrl);
    } else {
      window.prompt("Copiá la URL:", selectedFile.cdnUrl);
    }
  };

  // 👇 ahora esta función decide a qué bucket mandar la imagen
  const handleUploadDone = async (fileInfo: any) => {
    // bucket nuevo si se escribió, sino el seleccionado
    const bucketName =
      customBucket.trim() !== "" ? customBucket.trim() : selectedBucket;

    if (!fileInfo || !fileInfo.uuid || !bucketName) return;

    try {
      // 1) Asignar bucket en el backend
      await axios.post(
        `${import.meta.env.VITE_APPLICATION_URL}/uploadcare/buckets/assign`,
        {
          uuid: fileInfo.uuid,
          bucket: bucketName,
        }
      );

      // 2) Recargar lista de buckets (por si el bucket era nuevo)
      const bucketsRes = await axios.get<Bucket[]>(
        `${import.meta.env.VITE_APPLICATION_URL}/uploadcare/buckets`
      );
      setBuckets(bucketsRes.data);

      // 3) Asegurarnos de estar parados en ese bucket recién usado
      setSelectedBucket(bucketName);

      // 4) Recargar archivos de ese bucket
      const filesRes = await axios.get<{
        bucket: string;
        files: FileItem[];
      }>(
        `${
          import.meta.env.VITE_APPLICATION_URL
        }/uploadcare/buckets/${encodeURIComponent(bucketName)}`
      );

      setFiles(filesRes.data.files);
      setIsUploadWidgetOpen(false);
      setCustomBucket(""); // limpiamos el input de bucket nuevo
    } catch (err) {
      console.error(err);
      setError("No se pudo subir o asignar la imagen al bucket.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="mb-4 p-4 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
        <SafeLink
          to="/"
          className="text-blue-600 hover:underline text-lg font-semibold"
        >
          Go to Host
        </SafeLink>
        <h1 className="text-2xl md:text-3xl text-red-500 font-bold underline">
          {import.meta.env.VITE_APP_NAME}
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-8">
        <BucketsSection
          buckets={buckets}
          selectedBucket={selectedBucket}
          loadingBuckets={loadingBuckets}
          onSelectBucket={(name) => {
            setSelectedBucket(name);
            setCustomBucket(""); // si elige un bucket de la lista, limpiamos el custom
          }}
        />

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Toolbar: ahora recibe el bucket custom + setter */}
        <FilesToolbar
          selectedBucket={selectedBucket}
          customBucket={customBucket}
          onChangeCustomBucket={setCustomBucket}
          onShare={handleShare}
          onUploadDone={handleUploadDone}
        />

        <FileTable
          loadingFiles={loadingFiles}
          files={files}
          onSelectFile={setSelectedFile}
        />

        <FilePreview
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      </main>
    </div>
  );
}

export default App;
