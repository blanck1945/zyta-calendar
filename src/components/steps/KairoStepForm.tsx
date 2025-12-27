// src/components/steps/KairoStepForm.tsx
import type { FormEvent } from "react";
import { Button } from "../ui/button";

interface KairoStepFormProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;
  query: string;
  wantsFile: boolean;
  file: File | null;

  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeQuery: (v: string) => void;
  onChangeWantsFile: (v: boolean) => void;
  onChangeFile: (file: File | null) => void;

  onBack: () => void;
  onContinue: () => void;
}

const KairoStepForm: React.FC<KairoStepFormProps> = ({
  meetingStart,
  meetingEnd,
  name,
  email,
  query,
  wantsFile,
  file,
  onChangeName,
  onChangeEmail,
  onChangeQuery,
  onChangeWantsFile,
  onChangeFile,
  onBack,
  onContinue,
}) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChangeFile(f);
  };

  return (
    <>
      {/* Resumen fecha + horario */}
      <div 
        className="mb-6 bg-accent border border-border shadow-sm"
        style={{
          borderRadius: "var(--style-border-radius, 0.75rem)",
          padding: "var(--style-card-padding, 0.75rem)",
        }}
      >
        <p 
          className="font-semibold text-foreground"
          style={{
            fontSize: "var(--style-body-size, 0.875rem)",
            fontWeight: "var(--style-body-weight, 400)",
          }}
        >
          Fecha y horario seleccionados
        </p>
        <p 
          className="text-muted-foreground"
          style={{
            fontSize: "var(--style-body-size, 0.875rem)",
            fontWeight: "var(--style-body-weight, 400)",
          }}
        >
          {meetingStart && meetingEnd
            ? `${meetingStart.toLocaleDateString()} · ${meetingStart
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(" ", "")} - ${meetingEnd
                .toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(" ", "")}`
            : "No se encontró la fecha/horario."}
        </p>
      </div>

      <form 
        className="max-w-xl" 
        onSubmit={handleSubmit} 
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--style-component-gap, 1rem)",
        }}
      >
        <div 
          className="grid md:grid-cols-2"
          style={{
            gap: "var(--style-component-gap, 0.75rem)",
          }}
        >
          <div className="flex flex-col">
            <label 
              className="font-medium text-foreground mb-1"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              className="border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-background text-foreground"
              style={{
                borderRadius: "var(--style-border-radius, 0.5rem)",
                padding: "var(--style-card-padding, 0.5rem)",
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
              required
            />
          </div>
          <div className="flex flex-col">
            <label 
              className="font-medium text-foreground mb-1"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
              className="border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all bg-background text-foreground"
              style={{
                borderRadius: "var(--style-border-radius, 0.5rem)",
                padding: "var(--style-card-padding, 0.5rem)",
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
              required
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label 
            className="font-medium text-foreground mb-1"
            style={{
              fontSize: "var(--style-body-size, 0.875rem)",
              fontWeight: "var(--style-body-weight, 400)",
            }}
          >
            Consulta
          </label>
          <textarea
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            rows={4}
            className="border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all bg-background text-foreground"
            style={{
              borderRadius: "var(--style-border-radius, 0.5rem)",
              padding: "var(--style-card-padding, 0.5rem)",
              fontSize: "var(--style-body-size, 0.875rem)",
              fontWeight: "var(--style-body-weight, 400)",
            }}
            placeholder="Contanos brevemente el motivo del meet..."
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="wantsFile"
            type="checkbox"
            checked={wantsFile}
            onChange={(e) => onChangeWantsFile(e.target.checked)}
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
          />
          <label
            htmlFor="wantsFile"
            className="text-foreground select-none"
            style={{
              fontSize: "var(--style-body-size, 0.875rem)",
              fontWeight: "var(--style-body-weight, 400)",
            }}
          >
            Subir archivo (ej. material, presentación, contexto extra)
          </label>
        </div>

        {wantsFile && (
          <div className="flex flex-col">
            <label 
              className="font-medium text-foreground mb-1"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
            >
              Archivo
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
              }}
            />
            {file && (
              <p 
                className="mt-1 text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.75rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                Archivo seleccionado:{" "}
                <span 
                  style={{
                    fontWeight: "var(--style-body-weight, 500)",
                  }}
                >
                  {file.name}
                </span>
              </p>
            )}
          </div>
        )}

        <div 
          className="flex flex-col-reverse sm:flex-row pt-4"
          style={{
            gap: "var(--style-component-gap, 0.75rem)",
          }}
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
          >
            Volver
          </Button>
          <Button
            type="submit"
            variant="default"
            size="md"
          >
            Siguiente
          </Button>
        </div>
      </form>
    </>
  );
};

export default KairoStepForm;
