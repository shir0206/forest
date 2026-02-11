// Contact Link Configuration
export const CONTACT_CONFIG = {
  email: {
    to: "shirzabolotny@gmail.com",
    subject: "Let's work together!",
    body: "Hi Shir,\n\nI'd like to discuss a potential collaboration...",
  },
  whatsapp: {
    phoneNumber: "972544400000",
    text: "Hi Shir, I'd like to discuss a potential collaboration!",
  },
  calendar: {
    action: "TEMPLATE",
    text: "Meeting with Shir",
    dates: {
      start: "20240101T100000Z",
      end: "20240101T110000Z",
    },
    details: "Let's discuss potential collaboration opportunities.",
    location: "Online",
    addGuests: ["shirzabolotny@gmail.com"],
    conferenceDataVersion: 1,
    conferenceSolution: "hangoutsMeet",
  },
} as const;

// External Links Configuration
export const EXTERNAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/shirzabolotny/",
  github: "https://github.com/shir0206",
  resume: "/resume.pdf",
} as const;

// Social Media Configuration
export const SOCIAL_MEDIA = {
  linkedin: {
    url: EXTERNAL_LINKS.linkedin,
    label: "LinkedIn",
    icon: "linkedin",
  },
  github: {
    url: EXTERNAL_LINKS.github,
    label: "GitHub",
    icon: "github",
  },
  email: {
    url: `mailto:${CONTACT_CONFIG.email.to}`,
    label: "Email",
    icon: "mail",
  },
  whatsapp: {
    url: `https://wa.me/${CONTACT_CONFIG.whatsapp.phoneNumber}`,
    label: "WhatsApp",
    icon: "whatsapp",
  },
  calendar: {
    url: "#",
    label: "Schedule Meeting",
    icon: "calendar",
  },
} as const;
