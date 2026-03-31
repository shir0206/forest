import type { WhatsAppConfig } from "../types";

/**
 * Generates a WhatsApp link with the provided configuration
 */
export const generateWhatsAppLink = (config: WhatsAppConfig): string =>
  `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(config.text || "")}`;
