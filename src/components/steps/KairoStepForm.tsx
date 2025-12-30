// src/components/steps/KairoStepForm.tsx
import { useState, type FormEvent } from "react";
import { Calendar, Clock, User, Mail, MessageSquare, Upload, File, X, Phone, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { BookingForm } from "../../hooks/useCalendarSchedule";

interface KairoStepFormProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;
  query: string;
  phone: string;
  wantsFile: boolean;
  file: File | null;

  bookingForm?: BookingForm;
  confirmCaseBeforePayment?: boolean;
  isLoading?: boolean;

  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeQuery: (v: string) => void;
  onChangePhone: (v: string) => void;
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
  phone,
  wantsFile,
  file,
  bookingForm,
  confirmCaseBeforePayment = false,
  isLoading = false,
  onChangeName,
  onChangeEmail,
  onChangeQuery,
  onChangePhone,
  onChangeWantsFile,
  onChangeFile,
  onBack,
  onContinue,
}) => {
  // Estado para errores de validación
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    notes?: string;
    phone?: string;
  }>({});

  // Obtener configuración de campos (con valores por defecto si no hay bookingForm)
  const nameField = bookingForm?.fields?.name ?? { enabled: true, required: true };
  const emailField = bookingForm?.fields?.email ?? { enabled: true, required: true };
  const notesField = bookingForm?.fields?.notes ?? { enabled: true, required: false };
  const phoneField = bookingForm?.fields?.phone ?? { enabled: false, required: false };

  // Función de validación
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validar nombre
    if (nameField.enabled && nameField.required && !name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    // Validar email
    if (emailField.enabled && emailField.required) {
      if (!email.trim()) {
        newErrors.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "El email no es válido";
      }
    }

    // Validar notas
    if (notesField.enabled && notesField.required && !query.trim()) {
      newErrors.notes = "Este campo es requerido";
    }

    // Validar teléfono
    if (phoneField.enabled && phoneField.required && !phone.trim()) {
      newErrors.phone = "El teléfono es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChangeFile(f);
  };

  // Función para verificar si el formulario es válido (sin mostrar errores)
  const isFormValid = (): boolean => {
    if (nameField.enabled && nameField.required && !name.trim()) return false;
    if (emailField.enabled && emailField.required) {
      if (!email.trim()) return false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    }
    if (notesField.enabled && notesField.required && !query.trim()) return false;
    if (phoneField.enabled && phoneField.required && !phone.trim()) return false;
    return true;
  };

  // Limpiar error cuando el usuario empieza a escribir
  const handleNameChange = (value: string) => {
    onChangeName(value);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleEmailChange = (value: string) => {
    onChangeEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleQueryChange = (value: string) => {
    onChangeQuery(value);
    if (errors.notes) {
      setErrors((prev) => ({ ...prev, notes: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    onChangePhone(value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const canContinue = isFormValid();

  return (
    <>
      {/* Resumen fecha + horario mejorado */}
      <Card
        className="mb-6"
        style={{
          padding: "var(--style-card-padding, 1.25rem)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 rounded-full p-2"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-semibold text-foreground mb-1"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              Fecha y horario seleccionados
            </p>
            {meetingStart && meetingEnd ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span
                    style={{
                      fontSize: "var(--style-body-size, 0.875rem)",
                      fontWeight: "var(--style-body-weight, 400)",
                    }}
                  >
                    {meetingStart.toLocaleDateString("es-AR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span
                    style={{
                      fontSize: "var(--style-body-size, 0.875rem)",
                      fontWeight: "var(--style-body-weight, 400)",
                    }}
                  >
                    {meetingStart
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(" ", "")}{" "}
                    -{" "}
                    {meetingEnd
                      .toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(" ", "")}
                  </span>
                </div>
              </div>
            ) : (
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                No se encontró la fecha/horario.
              </p>
            )}
          </div>
        </div>
      </Card>

      <form
        className="max-w-xl"
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--style-component-gap, 1.5rem)",
        }}
      >
        <div
          className="grid md:grid-cols-2"
          style={{
            gap: "var(--style-component-gap, 1rem)",
          }}
        >
          {/* Campo Nombre */}
          {nameField.enabled && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="flex items-center gap-2 font-medium text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 500)",
                }}
              >
                <User className="h-4 w-4" />
                Nombre
                {nameField.required && (
                  <span className="text-destructive" aria-label="requerido">
                    *
                  </span>
                )}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full border-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.name
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
                placeholder="Tu nombre completo"
                required={nameField.required}
                aria-invalid={errors.name ? "true" : "false"}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <div
                  id="name-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Campo Email */}
          {emailField.enabled && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 font-medium text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 500)",
                }}
              >
                <Mail className="h-4 w-4" />
                Email
                {emailField.required && (
                  <span className="text-destructive" aria-label="requerido">
                    *
                  </span>
                )}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full border-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.email
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
                placeholder="tu@email.com"
                required={emailField.required}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <div
                  id="email-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Campo Teléfono */}
          {phoneField.enabled && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="flex items-center gap-2 font-medium text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 500)",
                }}
              >
                <Phone className="h-4 w-4" />
                Teléfono
                {phoneField.required && (
                  <span className="text-destructive" aria-label="requerido">
                    *
                  </span>
                )}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full border-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.phone
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
                placeholder="+54 9 11 1234-5678"
                required={phoneField.required}
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {errors.phone && (
                <div
                  id="phone-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Campo Consulta/Notas */}
        {notesField.enabled && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="query"
              className="flex items-center gap-2 font-medium text-foreground"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Consulta
              {notesField.required && (
                <span className="text-destructive" aria-label="requerido">
                  *
                </span>
              )}
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              rows={5}
              className={`w-full border-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all ${
                errors.notes
                  ? "border-destructive focus:border-destructive"
                  : "border-input focus:border-ring"
              }`}
              style={{
                borderRadius: "var(--style-border-radius, 0.5rem)",
                padding: "0.75rem",
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
                lineHeight: "1.5",
              }}
              placeholder="Contanos brevemente el motivo del meet..."
              required={notesField.required}
              aria-invalid={errors.notes ? "true" : "false"}
              aria-describedby={errors.notes ? "notes-error" : undefined}
            />
            {errors.notes && (
              <div
                id="notes-error"
                className="flex items-center gap-1.5 text-destructive text-sm"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* Checkbox para subir archivo */}
        <Card
          className="cursor-pointer transition-all hover:border-primary/50"
          style={{
            padding: "var(--style-card-padding, 1rem)",
            borderWidth: "2px",
            borderStyle: "solid",
            borderColor: wantsFile
              ? "var(--primary)"
              : "var(--border)",
            backgroundColor: wantsFile
              ? "var(--primary)/5"
              : "transparent",
          }}
          onClick={() => onChangeWantsFile(!wantsFile)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <input
                id="wantsFile"
                type="checkbox"
                checked={wantsFile}
                onChange={(e) => onChangeWantsFile(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-primary"
                style={{
                  borderRadius: "var(--style-border-radius, 0.25rem)",
                }}
              />
            </div>
            <label
              htmlFor="wantsFile"
              className="flex-1 text-foreground select-none cursor-pointer"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 400)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Upload className="h-4 w-4" />
                <span className="font-medium">Subir archivo</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Material, presentación, contexto extra o cualquier archivo
                relacionado
              </span>
            </label>
          </div>
        </Card>

        {/* Input de archivo mejorado */}
        {wantsFile && (
          <div className="flex flex-col gap-2">
            <label
              htmlFor="file"
              className="flex items-center gap-2 font-medium text-foreground"
              style={{
                fontSize: "var(--style-body-size, 0.875rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              <File className="h-4 w-4" />
              Seleccionar archivo
            </label>
            <div className="relative">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                }}
              />
              <Card
                className="border-2 border-dashed transition-all hover:border-primary/50 hover:bg-accent/50"
                style={{
                  padding: "var(--style-card-padding, 1.5rem)",
                  borderColor: file
                    ? "var(--primary)"
                    : "var(--border)",
                  backgroundColor: file
                    ? "var(--primary)/5"
                    : "transparent",
                }}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {file ? (
                    <>
                      <div className="flex items-center gap-2 text-foreground">
                        <File className="h-5 w-5" />
                        <span
                          className="font-medium"
                          style={{
                            fontSize: "var(--style-body-size, 0.875rem)",
                            fontWeight: "var(--style-body-weight, 500)",
                          }}
                        >
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onChangeFile(null);
                            const input = document.getElementById(
                              "file"
                            ) as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          className="ml-2 p-1 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <span
                        className="text-muted-foreground text-sm"
                        style={{
                          fontSize: "var(--style-body-size, 0.75rem)",
                        }}
                      >
                        {(file.size / 1024).toFixed(2)} KB · Haz clic para
                        cambiar
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <span
                          className="text-foreground font-medium"
                          style={{
                            fontSize: "var(--style-body-size, 0.875rem)",
                            fontWeight: "var(--style-body-weight, 500)",
                          }}
                        >
                          Haz clic para seleccionar
                        </span>
                        <span
                          className="text-muted-foreground block text-sm mt-1"
                          style={{
                            fontSize: "var(--style-body-size, 0.75rem)",
                          }}
                        >
                          o arrastra y suelta el archivo aquí
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
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
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            type="submit"
            variant="default"
            size="md"
            disabled={!canContinue || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {confirmCaseBeforePayment ? "Enviando solicitud..." : "Cargando..."}
              </>
            ) : (
              confirmCaseBeforePayment ? "Enviar solicitud" : "Siguiente"
            )}
          </Button>
        </div>
      </form>
    </>
  );
};

export default KairoStepForm;
