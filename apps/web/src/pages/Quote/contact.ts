import { FORM_ENDPOINT } from "@/shared/config/constants";
import { PROFILE } from "@/shared/config/profile";

/** Somente o contrato Formspree verificado é reutilizado. Outros provedores
 * degradam para e-mail, sem transmitir dados a um contrato desconhecido. */
export function verifiedEndpoint(value: string): string {
    return /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(value)
        ? value
        : "";
}
export function businessWhatsApp(value: string): string {
    return /^\+[1-9]\d{7,14}$/.test(value)
        ? `https://wa.me/${value.slice(1)}`
        : "";
}
export const QUOTE_ENDPOINT = verifiedEndpoint(FORM_ENDPOINT || "");
export const BUSINESS_CONTACT =
    businessWhatsApp(import.meta.env.VITE_BUSINESS_WHATSAPP || "") ||
    `mailto:${PROFILE.email}`;
