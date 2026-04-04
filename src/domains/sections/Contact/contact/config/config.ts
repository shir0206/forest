/**
 * Contact configuration - Single source of truth for contact link structure
 */
export const CONTACT_CONFIG = {
  email: {
    to: "shirzabolotny@gmail.com",
    subject: "",
    body: "",
  },
  whatsapp: {
    phoneNumber: "+972542098332",
    text: "",
  },
  calendar: {
    action: "EVENTEDIT" as const,
    text: "",
    dates: {
      start: "20240101T110000Z",
      end: "20240101T120000Z",
    },
    details: "",
    location: "Google Meet",
    addGuests: ["shirzabolotny@gmail.com"],
    conferenceDataVersion: 1,
    conferenceSolution: "hangoutsMeet",
  },
};
