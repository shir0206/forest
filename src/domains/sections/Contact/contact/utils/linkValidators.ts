/**
 * Validates if a phone number is in the correct format for WhatsApp
 */
export const isValidWhatsAppNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  // Check if it's a valid international phone number (10-15 digits)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
};

/**
 * Formats a phone number for display
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  if (cleanNumber.length === 10) {
    // Format as (XXX) XXX-XXXX
    return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(
      3,
      6
    )}-${cleanNumber.slice(6)}`;
  }
  return phoneNumber;
};
