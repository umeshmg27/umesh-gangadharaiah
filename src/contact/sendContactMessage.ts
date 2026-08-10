import emailjs from "@emailjs/browser";

import { emailjsConfig } from "./emailjsConfig";

export type ContactMessage = Readonly<{
  name: string;
  contact: string;
  message: string;
}>;

export function sendContactMessage({
  name,
  contact,
  message,
}: ContactMessage) {
  return emailjs.send(
    emailjsConfig.serviceId,
    emailjsConfig.templateId,
    { name, email: contact, message },
    emailjsConfig.publicKey,
  );
}
