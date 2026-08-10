import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  type ContactMessage,
  sendContactMessage,
} from "../contact/sendContactMessage";
import styles from "./ContactForm.module.css";

type FieldName = keyof ContactMessage;
type FieldErrors = Partial<Record<FieldName, string>>;
type ContactStatus =
  | { kind: "idle" }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "failure" };

const emptyFields: ContactMessage = {
  name: "",
  contact: "",
  message: "",
};
const fieldOrder = ["name", "contact", "message"] as const;
const errorMessages = {
  name: "Please enter your name.",
  contact: "Please enter your email or phone number.",
  message: "Please enter a message.",
} as const satisfies Record<FieldName, string>;

function validateFields(fields: ContactMessage): FieldErrors {
  return Object.fromEntries(
    fieldOrder
      .filter((field) => fields[field].trim().length === 0)
      .map((field) => [field, errorMessages[field]]),
  );
}

function statusMessage(status: ContactStatus): string {
  switch (status.kind) {
    case "invalid":
      return "Please correct the highlighted fields and try again.";
    case "sending":
      return "Sending your message…";
    case "success":
      return "Your message has been sent. Thank you for getting in touch.";
    case "failure":
      return "Your message could not be sent. Please try again.";
    case "idle":
      return "";
  }
}

function submitLabel(status: ContactStatus): string {
  if (status.kind === "sending") return "Sending…";
  if (status.kind === "failure") return "Try again";
  return "Send message";
}

export default function ContactForm() {
  const instanceId = useId().replaceAll(":", "");
  const [fields, setFields] = useState<ContactMessage>(emptyFields);
  const [status, setStatus] = useState<ContactStatus>({ kind: "idle" });
  const submittingRef = useRef(false);
  const pendingFocusRef = useRef<FieldName | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const headingId = `${instanceId}-contact-heading`;
  const fieldIds = {
    name: `${instanceId}-contact-name`,
    contact: `${instanceId}-contact-method`,
    message: `${instanceId}-contact-message`,
  } as const satisfies Record<FieldName, string>;
  const errors = status.kind === "invalid" ? status.errors : {};
  const isSending = status.kind === "sending";

  useEffect(() => {
    if (status.kind !== "invalid") return;

    const pendingField = pendingFocusRef.current;
    const pendingElement =
      pendingField === "name"
        ? nameRef.current
        : pendingField === "contact"
          ? contactRef.current
          : pendingField === "message"
            ? messageRef.current
            : null;

    pendingFocusRef.current = null;
    pendingElement?.focus();
  }, [status]);

  function updateField(
    field: FieldName,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    setFields((current) => ({ ...current, [field]: event.target.value }));
    setStatus((current) =>
      current.kind === "success" ? { kind: "idle" } : current,
    );
  }

  async function submitForm(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateFields(fields);
    const firstInvalidField = fieldOrder.find((field) => nextErrors[field]);

    if (firstInvalidField) {
      pendingFocusRef.current = firstInvalidField;
      setStatus({ kind: "invalid", errors: nextErrors });
      return;
    }

    const message = {
      name: fields.name.trim(),
      contact: fields.contact.trim(),
      message: fields.message.trim(),
    } satisfies ContactMessage;

    submittingRef.current = true;
    setStatus({ kind: "sending" });

    try {
      await sendContactMessage(message);
      setFields(emptyFields);
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "failure" });
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      className={styles.section}
      id="contact"
    >
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>Start a conversation</p>
        <h2 className={styles.heading} id={headingId}>
          Contact Me
        </h2>
        <p className={styles.summary}>
          Got a project waiting to be realized? Let's collaborate and make it
          happen!
        </p>
      </div>

      <form
        aria-label="Contact Umesh"
        className={styles.form}
        noValidate
        onSubmit={submitForm}
      >
        <div aria-busy={isSending} className={styles.controls}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={fieldIds.name}>
                Your Name
              </label>
              <p
                className={styles.description}
                id={`${fieldIds.name}-description`}
              >
                Tell me what to call you.
              </p>
              <input
                aria-describedby={[
                  `${fieldIds.name}-description`,
                  errors.name ? `${fieldIds.name}-error` : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-errormessage={
                  errors.name ? `${fieldIds.name}-error` : undefined
                }
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                className={styles.input}
                disabled={isSending}
                id={fieldIds.name}
                name="name"
                onChange={(event) => updateField("name", event)}
                placeholder="What's your name?"
                ref={nameRef}
                required
                type="text"
                value={fields.name}
              />
              {errors.name ? (
                <p className={styles.error} id={`${fieldIds.name}-error`}>
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={fieldIds.contact}>
                Email / Phone
              </label>
              <p
                className={styles.description}
                id={`${fieldIds.contact}-description`}
              >
                Share the best way to reach you.
              </p>
              <input
                aria-describedby={[
                  `${fieldIds.contact}-description`,
                  errors.contact ? `${fieldIds.contact}-error` : undefined,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-errormessage={
                  errors.contact ? `${fieldIds.contact}-error` : undefined
                }
                aria-invalid={Boolean(errors.contact)}
                className={styles.input}
                disabled={isSending}
                id={fieldIds.contact}
                name="contact"
                onChange={(event) => updateField("contact", event)}
                placeholder="How can I reach you?"
                ref={contactRef}
                required
                type="text"
                value={fields.contact}
              />
              {errors.contact ? (
                <p className={styles.error} id={`${fieldIds.contact}-error`}>
                  {errors.contact}
                </p>
              ) : null}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={fieldIds.message}>
              Message
            </label>
            <p
              className={styles.description}
              id={`${fieldIds.message}-description`}
            >
              Include the context that would help me respond.
            </p>
            <textarea
              aria-describedby={[
                `${fieldIds.message}-description`,
                errors.message ? `${fieldIds.message}-error` : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-errormessage={
                errors.message ? `${fieldIds.message}-error` : undefined
              }
              aria-invalid={Boolean(errors.message)}
              className={styles.textarea}
              disabled={isSending}
              id={fieldIds.message}
              name="message"
              onChange={(event) => updateField("message", event)}
              placeholder="Send me any inquiries or questions"
              ref={messageRef}
              required
              rows={7}
              value={fields.message}
            />
            {errors.message ? (
              <p className={styles.error} id={`${fieldIds.message}-error`}>
                {errors.message}
              </p>
            ) : null}
          </div>

          <div className={styles.feedback}>
            <button
              className={styles.submitButton}
              disabled={isSending}
              type="submit"
            >
              {submitLabel(status)}
            </button>
          </div>
        </div>
        <p
          aria-atomic="true"
          aria-live="polite"
          className={styles.status}
          role="status"
        >
          {statusMessage(status)}
        </p>
      </form>
    </section>
  );
}
