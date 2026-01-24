import React from "react";
import "./contact.scss";

// Types
type IconName = "linkedin" | "mail" | "calendar" | "whatsapp";

interface WhatsAppConfig {
  phoneNumber: string;
  text: string;
}

interface GoogleCalendarConfig {
  action: string;
  text: string;
  details: string;
  location: string;
  addGuests: string[];
  conferenceDataVersion: number;
  conferenceSolution: string;
}

interface EmailConfig {
  to: string;
  subject: string;
  body: string;
}

interface LinkedInConfig {
  url: string;
}

interface LinksConfig {
  whatsapp: WhatsAppConfig;
  googleCalendar: GoogleCalendarConfig;
  email: EmailConfig;
  linkedin: LinkedInConfig;
}

interface ContactLinkProps {
  name: string;
  icon: IconName;
  url: string;
}

// Configuration
const linksConfig: LinksConfig = {
  whatsapp: {
    phoneNumber: "+972542098332",
    text: "Hello! I'm reaching out to inquire about your services. Looking forward to your reply.",
  },
  googleCalendar: {
    action: "EVENTEDIT",
    text: "Business Meeting",
    details: "Discuss potential collaboration",
    location: "Google Meet",
    addGuests: ["shirzabolotny@gmail.com"],
    conferenceDataVersion: 1,
    conferenceSolution: "hangoutsMeet",
  },
  email: {
    to: "shirzabolotny@gmail.com",
    subject: "Booking a meeting",
    body: "Hi, I would like to schedule a meeting to discuss potential collaboration.",
  },
  linkedin: {
    url: "https://www.linkedin.com/in/shir-zabolotny-a83b18109/",
  },
};

// Utility Functions
const getNextWeekdayAt11AM = (): { start: string; end: string } => {
  const now = new Date();
  const next = new Date(now);

  next.setDate(next.getDate() + 1);
  next.setHours(11, 0, 0, 0);

  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }

  const start = next.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const end = new Date(next);
  end.setHours(12, 0, 0, 0);
  const endStr = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return { start, end: endStr };
};

const generateWhatsAppUrl = (config: WhatsAppConfig): string => {
  return `https://wa.me/${config.phoneNumber}?text=${encodeURIComponent(
    config.text
  )}`;
};

const generateCalendarUrl = (config: GoogleCalendarConfig): string => {
  const { start, end } = getNextWeekdayAt11AM();

  const params = new URLSearchParams({
    action: config.action,
    text: config.text,
    dates: `${start}/${end}`,
    details: config.details,
    location: config.location,
  });

  if (config.addGuests?.length > 0) {
    params.append("add", config.addGuests.join(","));
  }

  if (config.conferenceDataVersion) {
    params.append(
      "conferenceDataVersion",
      config.conferenceDataVersion.toString()
    );
  }

  if (config.conferenceSolution) {
    params.append("conferenceSolution", config.conferenceSolution);
  }

  return `https://calendar.google.com/calendar/u/0/r/eventedit?${params.toString()}`;
};

const generateEmailUrl = (config: EmailConfig): string => {
  return `mailto:${config.to}?subject=${encodeURIComponent(
    config.subject
  )}&body=${encodeURIComponent(config.body)}`;
};

// Icon Component (simplified inline SVG icons)
const Icon: React.FC<{ name: IconName }> = ({ name }) => {
  const icons = {
    linkedin: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    whatsapp: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    mail: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
      </svg>
    ),
    calendar: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  };

  return <span className="icon">{icons[name]}</span>;
};

// Contact Link Component
const ContactLink: React.FC<ContactLinkProps> = ({ name, icon, url }) => {
  return (
    <a
      href={url}
      className="contact-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
    >
      <Icon name={icon} />
    </a>
  );
};

// URL Generator Map
const urlGenerators = {
  whatsapp: generateWhatsAppUrl,
  googleCalendar: generateCalendarUrl,
  email: generateEmailUrl,
  linkedin: (config: LinkedInConfig) => config.url,
};

// Contact Configuration Map
const contactConfig: Array<{
  key: keyof LinksConfig;
  name: string;
  icon: IconName;
}> = [
  { key: "linkedin", name: "LinkedIn", icon: "linkedin" },
  { key: "whatsapp", name: "WhatsApp", icon: "whatsapp" },
  { key: "email", name: "Email", icon: "mail" },
  { key: "googleCalendar", name: "Schedule Meeting", icon: "calendar" },
];

// Main Contact Component
export const Contact: React.FC = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Say Hi</h1>
        <p className="contact-subtitle">
          Ideas, questions, or just a hello?
          <br />
          I'd like to hear from you
        </p>
        <div className="contact-list">
          {contactConfig.map(({ key, name, icon }) => {
            const config = linksConfig[key];
            const generator = urlGenerators[key] as (config: any) => string;
            const url = generator(config);

            return <ContactLink key={key} name={name} icon={icon} url={url} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default Contact;
