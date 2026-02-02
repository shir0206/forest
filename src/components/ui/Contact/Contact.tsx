import React from "react";
import "./contact.scss";
import { Icon } from "../Icon/Icon";
import {
  generateWhatsAppLink,
  generateGoogleCalendarLink,
  generateEmailLink,
} from "../../../utils/links";
import { EXTERNAL_LINKS } from "../../../config/links";

// Types
type IconName = "linkedin" | "mail" | "calendar" | "whatsapp";

interface ContactLinkProps {
  name: string;
  icon: IconName;
  url: string;
}

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
        <h3 className="contact-title">Say Hi</h3>
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
