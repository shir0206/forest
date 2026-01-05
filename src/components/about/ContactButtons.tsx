import React from "react";
import { Icon } from "../icon/Icon";

// Define the type for our link configuration
interface LinkConfig {
  [key: string]: {
    [key: string]: any;
  };
}

// Define the type for our contact button props
interface ContactButtonProps {
  name: string;
  icon: "linkedin" | "mail" | "calendar" | "whatsapp";
  url: string;
  className?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  name,
  icon,
  url,
  className,
}) => {
  // Create a class name for the button based on the icon name
  const buttonClassName = `contact-button ${icon}-button ${
    className || ""
  }`.trim();

  return (
    <a
      href={url}
      className={buttonClassName}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
    >
      <Icon name={icon} className="button-icon" />
      <span>{name.toUpperCase()}</span>
    </a>
  );
};

interface ContactButtonsProps {
  links: LinkConfig;
}

export const ContactButtons: React.FC<ContactButtonsProps> = ({ links }) => {
  // Generate WhatsApp URL
  const generateWhatsAppUrl = (phoneNumber: string, text: string) => {
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
  };

  // Generate Google Calendar URL
  const generateCalendarUrl = (config: any) => {
    const { action, text, dates, details, location, addGuests } = config;
    const start = dates.start;
    const end = dates.end;

    const params = new URLSearchParams({
      action,
      text,
      dates: `${start}/${end}`,
      details,
      location,
    });

    if (addGuests && addGuests.length > 0) {
      params.append("add", addGuests.join(","));
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Generate Email URL
  const generateEmailUrl = (config: any) => {
    const { to, subject, body } = config;
    return `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Create buttons based on links configuration
  const buttons = Object.entries(links).map(([key, config]) => {
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

    return <ContactButton key={key} name={name} icon={icon} url={url} />;
  });

  return <div className="contact-buttons">{buttons}</div>;
};
