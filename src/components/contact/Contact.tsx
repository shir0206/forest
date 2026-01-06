import React from "react";
import { Icon } from "../icon/Icon";
import "./contact.scss";
import linksConfig from "@/helper/linksConfig.json";
import { getNextWeekdayAt11AM } from "@/helper/calendarUtils";

// Define the type for our contact button props
interface CContactLinkProps {
  name: string;
  icon: "linkedin" | "mail" | "calendar" | "whatsapp";
  url: string;
  className?: string;
}

const ContactLink: React.FC<CContactLinkProps> = ({ name, icon, url }) => {
  return (
    <a
      href={url}
      className="contact-link"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
    >
      <Icon name={icon} className="button-icon" />
    </a>
  );
};

export const Contact = () => {
  const generateWhatsAppUrl = (phoneNumber: string, text: string) => {
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  const generateCalendarUrl = (config: any) => {
    // Get dynamic dates
    const { start, end } = getNextWeekdayAt11AM();

    const params = new URLSearchParams({
      action: config.action,
      text: config.text,
      dates: `${start}/${end}`,
      details: config.details,
      location: config.location,
    });

    if (config.addGuests && config.addGuests.length > 0) {
      params.append("add", config.addGuests.join(","));
    }

    // Add conference data parameters
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

  const generateEmailUrl = (config: any) => {
    const { to, subject, body } = config;
    return `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const list = Object.entries(linksConfig).map(([key, config]) => {
    let url = "";
    let name = "";
    let icon: "linkedin" | "mail" | "calendar" | "whatsapp" = "linkedin";

    switch (key) {
      case "whatsapp":
        name = "WhatsApp";
        icon = "whatsapp";
        url = generateWhatsAppUrl(config.phoneNumber, config.text);
        break;
      case "googleCalendar":
        name = "Meeting";
        icon = "calendar";
        url = generateCalendarUrl(config);
        break;
      case "email":
        name = "Mail";
        icon = "mail";
        url = generateEmailUrl(config);
        break;
      default:
        name = key.charAt(0).toUpperCase() + key.slice(1);
        // For default case, we'll check if the key matches one of our valid icons
        const validIcons = ["linkedin", "mail", "calendar", "whatsapp"];
        if (validIcons.includes(key)) {
          icon = key as "linkedin" | "mail" | "calendar" | "whatsapp";
        }
        url = config.url || "#";
    }

    return <ContactLink key={key} name={name} icon={icon} url={url} />;
  });

  return <div className="contact-list">{list}</div>;
};
