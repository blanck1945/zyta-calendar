// src/components/steps/KairoStepForm.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, MessageSquare, Upload, File, X, Phone, AlertCircle, Loader2 } from "lucide-react";
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
  customFields?: Record<string, string>;

  bookingForm?: BookingForm;
  confirmCaseBeforePayment?: boolean;
  isLoading?: boolean;

  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangeQuery: (v: string) => void;
  onChangePhone: (v: string) => void;
  onChangeWantsFile: (v: boolean) => void;
  onChangeFile: (file: File | null) => void;
  onChangeCustomFields?: (fields: Record<string, string>) => void;

  onBack: () => void;
  onContinue: () => void;
}

// Función para crear el esquema de validación dinámicamente basado en bookingForm
function createValidationSchema(bookingForm?: BookingForm) {
  const nameField = bookingForm?.fields?.name ?? { enabled: true, required: true };
  const emailField = bookingForm?.fields?.email ?? { enabled: true, required: true };
  const notesField = bookingForm?.fields?.notes ?? { enabled: true, required: false };
  const phoneField = bookingForm?.fields?.phone ?? { enabled: false, required: false };

  let schema = z.object({
    name: nameField.enabled
      ? nameField.required
        ? z.string().min(1, "El nombre es requerido").trim()
        : z.string().optional()
      : z.string().optional(),
    email: emailField.enabled
      ? emailField.required
        ? z.string().email("El email no es válido").min(1, "El email es requerido")
        : z.string().email("El email no es válido").optional().or(z.literal(""))
      : z.string().optional(),
    query: notesField.enabled
      ? notesField.required
        ? z.string().min(1, "Este campo es requerido").trim()
        : z.string().optional()
      : z.string().optional(),
    phone: phoneField.enabled
      ? phoneField.required
        ? z.string().min(1, "El teléfono es requerido").trim()
        : z.string().optional()
      : z.string().optional(),
  });

  // Agregar validación para customFields
  if (bookingForm?.customFields && bookingForm.customFields.length > 0) {
    const customFieldsSchema: Record<string, z.ZodTypeAny> = {};
    
    bookingForm.customFields.forEach((field) => {
      if (field.enabled) {
        if (field.required) {
          customFieldsSchema[field.id] = z.string().min(1, `${field.label} es requerido`);
        } else {
          customFieldsSchema[field.id] = z.string().optional();
        }
      }
    });

    if (Object.keys(customFieldsSchema).length > 0) {
      schema = schema.extend(customFieldsSchema) as typeof schema;
    }
  }

  return schema;
}

type FormData = z.infer<ReturnType<typeof createValidationSchema>>;

const KairoStepForm: React.FC<KairoStepFormProps> = ({
  meetingStart: _meetingStart,
  meetingEnd: _meetingEnd,
  name,
  email,
  query,
  phone,
  wantsFile,
  file,
  customFields = {},
  bookingForm,
  confirmCaseBeforePayment = false,
  isLoading = false,
  onChangeName,
  onChangeEmail,
  onChangeQuery,
  onChangePhone,
  onChangeWantsFile,
  onChangeFile,
  onChangeCustomFields,
  onBack,
  onContinue,
}) => {
  const validationSchema = createValidationSchema(bookingForm);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      name: name || "",
      email: email || "",
      query: query || "",
      phone: phone || "",
      ...customFields,
    },
  });

  // Sincronizar valores del formulario con el estado externo
  useEffect(() => {
    setValue("name", name);
    setValue("email", email);
    setValue("query", query);
    setValue("phone", phone);
    
    // Sincronizar customFields
    if (bookingForm?.customFields) {
      bookingForm.customFields.forEach((field) => {
        if (field.enabled && customFields[field.id]) {
          setValue(field.id as keyof FormData, customFields[field.id]);
        }
      });
    }
  }, [name, email, query, phone, customFields, setValue, bookingForm]);

  // Observar cambios en los campos y actualizar el estado externo
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedQuery = watch("query");
  const watchedPhone = watch("phone");

  useEffect(() => {
    if (watchedName !== undefined) onChangeName(watchedName || "");
  }, [watchedName, onChangeName]);

  useEffect(() => {
    if (watchedEmail !== undefined) onChangeEmail(watchedEmail || "");
  }, [watchedEmail, onChangeEmail]);

  useEffect(() => {
    if (watchedQuery !== undefined) onChangeQuery(watchedQuery || "");
  }, [watchedQuery, onChangeQuery]);

  useEffect(() => {
    if (watchedPhone !== undefined) onChangePhone(watchedPhone || "");
  }, [watchedPhone, onChangePhone]);

  // Observar cambios en customFields
  useEffect(() => {
    if (!onChangeCustomFields || !bookingForm?.customFields) return;
    
    const customFieldsValues: Record<string, string> = {};
    bookingForm.customFields.forEach((field) => {
      if (field.enabled) {
        const value = watch(field.id as keyof FormData);
        if (value) {
          customFieldsValues[field.id] = value as string;
        }
      }
    });

    if (Object.keys(customFieldsValues).length > 0 || Object.keys(customFields).length > 0) {
      onChangeCustomFields(customFieldsValues);
    }
  }, [watch, bookingForm, onChangeCustomFields, customFields]);

  const onSubmit = (data: FormData) => {
    // Actualizar todos los valores antes de continuar
    onChangeName(data.name || "");
    onChangeEmail(data.email || "");
    onChangeQuery(data.query || "");
    onChangePhone(data.phone || "");
    
    // Actualizar customFields
    if (onChangeCustomFields && bookingForm?.customFields) {
      const customFieldsValues: Record<string, string> = {};
      bookingForm.customFields.forEach((field) => {
        if (field.enabled && data[field.id as keyof FormData]) {
          customFieldsValues[field.id] = data[field.id as keyof FormData] as string;
        }
      });
      onChangeCustomFields(customFieldsValues);
    }
    
    onContinue();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onChangeFile(f);
  };

  // Obtener configuración de campos
  const nameField = bookingForm?.fields?.name ?? { enabled: true, required: true };
  const emailField = bookingForm?.fields?.email ?? { enabled: true, required: true };
  const notesField = bookingForm?.fields?.notes ?? { enabled: true, required: false };
  const phoneField = bookingForm?.fields?.phone ?? { enabled: false, required: false };

  return (
    <>
      <form
        className="max-w-xl"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        style={{
          fontFamily: "Inter, sans-serif",
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
                className="flex items-center gap-2 text-[#000000]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <User className="h-4 w-4" />
                Nombre y apellido
                {nameField.required && (
                  <span className="text-destructive" aria-label="requerido">
                    *
                  </span>
                )}
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className={`w-full border-2 bg-white text-foreground placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.name
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
                placeholder="Ej: Vanesa Spano"
              />
              {errors.name && (
                <div
                  id="name-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.name.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Campo Email */}
          {emailField.enabled && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-[#000000]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
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
                {...register("email")}
                className={`w-full border-2 bg-white text-foreground placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.email
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
                placeholder="Ej: vane@email.com"
              />
              {errors.email && (
                <div
                  id="email-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Campo Teléfono */}
          {phoneField.enabled && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="flex items-center gap-2 text-[#000000]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                <Phone className="h-4 w-4" />
                WhatsApp
                {phoneField.required && (
                  <span className="text-destructive" aria-label="requerido">
                    *
                  </span>
                )}
              </label>
              <input
                id="phone"
                type="tel"
                {...register("phone")}
                className={`w-full border-2 bg-white text-foreground placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                  errors.phone
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-ring"
                }`}
                style={{
                  fontFamily: "Inter, sans-serif",
                  borderRadius: "var(--style-border-radius, 0.5rem)",
                  padding: "0.75rem",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
                placeholder="Ej: +54 11 5555-5555"
              />
              {errors.phone && (
                <div
                  id="phone-error"
                  className="flex items-center gap-1.5 text-destructive text-sm"
                  role="alert"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{errors.phone.message}</span>
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
              className="flex items-center gap-2 text-[#000000]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Motivo de la consulta
              {notesField.required && (
                <span className="text-destructive" aria-label="requerido">
                  *
                </span>
              )}
            </label>
            <textarea
              id="query"
              {...register("query")}
              rows={5}
              className={`w-full border-2 bg-white text-foreground placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all ${
                errors.query
                  ? "border-destructive focus:border-destructive"
                  : "border-input focus:border-ring"
              }`}
              style={{
                fontFamily: "Inter, sans-serif",
                borderRadius: "var(--style-border-radius, 0.5rem)",
                padding: "0.75rem",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "1.5",
              }}
              placeholder="Ej: Mi prepaga rechazó cobertura de medicación. Tengo orden médica y negativa por mail. Quiero evaluar amparo."
            />
            {errors.query && (
              <div
                id="query-error"
                className="flex items-center gap-1.5 text-destructive text-sm"
                role="alert"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errors.query.message}</span>
              </div>
            )}
          </div>
        )}

        {/* Custom Fields */}
        {bookingForm?.customFields && bookingForm.customFields.length > 0 && (
          <div className="space-y-4">
            {bookingForm.customFields
              .filter((field) => field.enabled)
              .map((field) => {
                const fieldError = errors[field.id as keyof typeof errors];
                
                return (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label
                      htmlFor={field.id}
                      className="flex items-center gap-2 text-[#000000]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-destructive" aria-label="requerido">
                          *
                        </span>
                      )}
                    </label>
                    {field.type === "select" && field.options ? (
                      <select
                        id={field.id}
                        {...register(field.id as keyof FormData)}
                        className={`w-full border-2 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                          fieldError
                            ? "border-destructive focus:border-destructive"
                            : "border-input focus:border-ring"
                        }`}
                        style={{
                          fontFamily: "Inter, sans-serif",
                          borderRadius: "var(--style-border-radius, 0.5rem)",
                          padding: "0.75rem",
                          fontSize: "14px",
                          fontWeight: 400,
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={field.id}
                        type={field.type === "number" ? "number" : "text"}
                        {...register(field.id as keyof FormData)}
                        className={`w-full border-2 bg-white text-foreground placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-ring transition-all ${
                          fieldError
                            ? "border-destructive focus:border-destructive"
                            : "border-input focus:border-ring"
                        }`}
                        style={{
                          fontFamily: "Inter, sans-serif",
                          borderRadius: "var(--style-border-radius, 0.5rem)",
                          padding: "0.75rem",
                          fontSize: "14px",
                          fontWeight: 400,
                        }}
                        placeholder={field.label}
                      />
                    )}
                    {fieldError && (
                      <div
                        id={`${field.id}-error`}
                        className="flex items-center gap-1.5 text-destructive text-sm"
                        role="alert"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{fieldError.message}</span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Checkbox para subir archivo - DESHABILITADO TEMPORALMENTE */}
        {false && (
          <>
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
                <div className="shrink-0 mt-0.5">
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
                              {file?.name ?? ""}
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
                            {((file?.size ?? 0) / 1024).toFixed(2)} KB · Haz clic para
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
          </>
        )}

        <div 
          className="flex flex-row pt-2 gap-2"
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
            disabled={!isValid || isLoading}
            className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
            }}
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
