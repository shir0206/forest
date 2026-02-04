import React from "react";
import { Icon, IconName } from "../../ui/Icon/Icon";
import "./expertiseCards.css";
import { useTranslation } from "../../../hooks/useTranslation";

interface ExpertiseItem {
  title: string;
  description: string;
  icon: IconName;
}

const ExpertiseCards: React.FC = () => {
  const { t } = useTranslation();

  const expertiseData: ExpertiseItem[] = [
    {
      title: t.expertise.cards.architecture.title,
      description: t.expertise.cards.architecture.description,
      icon: "structure",
    },
    {
      title: t.expertise.cards.implementation.title,
      description: t.expertise.cards.implementation.description,
      icon: "code",
    },
    {
      title: t.expertise.cards.communication.title,
      description: t.expertise.cards.communication.description,
      icon: "dialog",
    },
    {
      title: t.expertise.cards.design.title,
      description: t.expertise.cards.design.description,
      icon: "monitors",
    },
    {
      title: t.expertise.cards.testing.title,
      description: t.expertise.cards.testing.description,
      icon: "test",
    },
    {
      title: t.expertise.cards.mentorship.title,
      description: t.expertise.cards.mentorship.description,
      icon: "checklist",
    },
  ];

  return (
    <div className="expertise-container">
      <h2 className="expertise-title">{t.expertise.title}</h2>
      <div className="expertise-grid">
        {expertiseData.map((item, index) => (
          <article key={index} className="expertise-card">
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

export default ExpertiseCards;
