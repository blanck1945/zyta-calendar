import type { Bucket } from "../../types/bucket";

type BucketsSectionProps = {
  buckets: Bucket[];
  selectedBucket: string | null;
  loadingBuckets: boolean;
  onSelectBucket: (bucketName: string) => void;
};

export function BucketsSection({
  buckets,
  selectedBucket,
  loadingBuckets,
  onSelectBucket,
}: BucketsSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Buckets</h2>

      {loadingBuckets && (
        <p className="text-gray-500 text-sm">Cargando buckets…</p>
      )}

      {!loadingBuckets && buckets.length === 0 && (
        <p className="text-gray-500 text-sm">
          No hay buckets configurados todavía.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {buckets.map((bucket) => {
          const isActive = bucket.name === selectedBucket;
          return (
            <button
              key={bucket.name}
              type="button"
              onClick={() => onSelectBucket(bucket.name)}
              className={`w-full text-left rounded-lg border p-4 shadow-sm transition 
                ${
                  isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">
                  {bucket.name}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {bucket.totalFiles} archivos
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
