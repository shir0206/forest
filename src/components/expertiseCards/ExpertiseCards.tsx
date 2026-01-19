import React from "react";
import { Icon, IconName } from "./../icon/Icon";
import "./expertiseCards.css";

interface ExpertiseItem {
  title: string;
  description: string;
  icon: IconName;
}

const ExpertiseCards: React.FC = () => {
  const expertiseData: ExpertiseItem[] = [
    {
      title: "Architecture & Direction",
      description:
        "Designing frontend structure, defining coding standards, and ensuring scalable, maintainable code.",
      icon: "structure",
    },
    {
      title: "Implementation",
      description:
        "Developing and maintaining modular apps and reusable components for production systems.",
      icon: "code",
    },
    {
      title: "Clear Communication",
      description:
        "Explaining ideas and sharing decisions, collaborating through the process with flexibility, and refining work through feedback.",
      icon: "dialog",
    },
    {
      title: "UI Design Leadership",
      description:
        "Owning visual and functional decisions end-to-end, building layouts, visual language, and responsive structures to match consistency and the product's goals.",
      icon: "monitors",
    },
    {
      title: "A/B Testing Implementation",
      description:
        "Planning, implementing, and analyzing tests to validate UI and UX choices with real user data.",
      icon: "test",
    },
    {
      title: "Mentorship & Guidance",
      description:
        "Sharing knowledge and guidance, that help the team grow and carry ideas forward.",
      icon: "checklist",
    },
  ];

  return (
    <div className="expertise-container">
      <div className="expertise-grid">
        {expertiseData.map((item, index) => (
          <article key={index} className="expertise-card">
            <div className="card-icon-wrapper">
              <Icon name={item.icon} size={64} className="card-icon" />
            </div>
            <h3 className="card-title">
              <span className="card-number">{index}</span> {item.title}
            </h3>
            <p className="card-description">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ExpertiseCards;
