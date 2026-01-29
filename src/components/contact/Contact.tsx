import React from "react";
import "./contact.scss";
import { Icon } from "../icon/Icon";
import {
  generateWhatsAppLink,
  generateGoogleCalendarLink,
  generateEmailLink,
} from "../../utils/links";
import { EXTERNAL_LINKS } from "../../config/links";

// Types
type IconName = "linkedin" | "mail" | "calendar" | "whatsapp";

interface ContactLinkProps {
  name: string;
  icon: IconName;
  url: string;
}

// Icon Component (simplified inline SVG icons)
// const Icon: React.FC<{ name: IconName }> = ({ name }) => {
//   const icons = {
//     linkedin: (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//       >
//         <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
//         <rect x="2" y="9" width="4" height="12" />
//         <circle cx="4" cy="4" r="2" />
//       </svg>
//     ),
//     whatsapp: (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//       >
//         <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
//       </svg>
//     ),
//     mail: (

//     ),
//     calendar: (

//     ),
//   };

//   return <span className="icon">{icons[name]}</span>;
// };

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

// Contact Configuration
const contactLinks = [
  {
    name: "LinkedIn",
    icon: "linkedin" as IconName,
    url: EXTERNAL_LINKS.linkedin,
  },
  {
    name: "WhatsApp",
    icon: "whatsapp" as IconName,
    url: generateWhatsAppLink({
      phoneNumber: "+972542098332",
      text: "Hello! I'm reaching out to inquire about your services. Looking forward to your reply.",
    }),
  },
  {
    name: "Email",
    icon: "mail" as IconName,
    url: generateEmailLink({
      to: "shirzabolotny@gmail.com",
      subject: "Booking a meeting",
      body: "Hi, I would like to schedule a meeting to discuss potential collaboration.",
    }),
  },
  {
    name: "Schedule Meeting",
    icon: "calendar" as IconName,
    url: generateGoogleCalendarLink({
      action: "EVENTEDIT",
      text: "Business Meeting",
      dates: {
        start: "20240101T110000Z",
        end: "20240101T120000Z",
      },
      details: "Discuss potential collaboration",
      location: "Google Meet",
      addGuests: ["shirzabolotny@gmail.com"],
      conferenceDataVersion: 1,
      conferenceSolution: "hangoutsMeet",
    }),
  },
];

// Main Contact Component
export const Contact: React.FC = () => {
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Say Hi</h1>
        <p className="contact-subtitle">
          Exploring ideas, questions, or a collaboration?
          <br />
          I'd be glad to hear from you.
        </p>
        <div className="contact-list">
          {contactLinks.map(({ name, icon, url }) => (
            <ContactLink key={name} name={name} icon={icon} url={url} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
