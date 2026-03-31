import React from "react";

import "./service.css";

import { useTranslation } from "../../../i18n/hooks/useTranslation";
import { Icon, IconName } from "../../../shared/components/Icon/Icon";

interface ServiceCard {
  title: string;
  description: string;
  icon: IconName;
}

interface ServiceProps {
  isVisible: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const Service: React.FC<ServiceProps> = () => {
  const { t } = useTranslation();

  const serviceData: ServiceCard[] = [
    {
      title: t.service.cards.architecture.title,
      description: t.service.cards.architecture.description,
      icon: "structure",
    },
    {
      title: t.service.cards.implementation.title,
      description: t.service.cards.implementation.description,
      icon: "code",
    },
    {
      title: t.service.cards.communication.title,
      description: t.service.cards.communication.description,
      icon: "dialog",
    },
    {
      title: t.service.cards.design.title,
      description: t.service.cards.design.description,
      icon: "monitors",
    },
    {
      title: t.service.cards.testing.title,
      description: t.service.cards.testing.description,
      icon: "test",
    },
    {
      title: t.service.cards.mentorship.title,
      description: t.service.cards.mentorship.description,
      icon: "checklist",
    },
  ];

  return (
    <div className="service-container">
      <h2 className="service-title">{t.service.title}</h2>
      <div className="service-grid">
        {serviceData.map((item, index) => (
          <article key={index} className="service-card">
            <div className="card-icon-wrapper">
              <Icon name={item.icon} size={64} className="card-icon" />
            </div>
            <h3 className="card-title">{item.title}</h3>
            <p className="card-description">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Service;
