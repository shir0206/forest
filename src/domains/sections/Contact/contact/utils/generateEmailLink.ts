import type { EmailConfig } from "../types/types";

/**
 * Generates an email link with the provided configuration
 */
export const generateEmailLink = (config: EmailConfig): string =>
  `mailto:${config.to}?subject=${encodeURIComponent(
    config.subject
  )}&body=${encodeURIComponent(config.body)}`;
