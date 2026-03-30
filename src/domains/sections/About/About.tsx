import React from "react";

import "./about.scss";

import { ReactComponent as Circle } from "../../../assets/images/circle.svg";
import imagePath from "../../../assets/images/shirzabolotny.png?url";
import { useTranslation } from "../../../domains/context/hooks/useTranslation";

interface AboutProps {
  isVisible: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const About: React.FC<AboutProps> = () => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <h2 className="about-title">{t.aboutMe.title}</h2>

      <div className="about-content">
        <div className="profile-image-wrapper">
          <Circle className="background-circle" aria-hidden />
          <img src={imagePath} alt="Profile" className="profile-image" />
        </div>

        <div className="about-text">
          <p className="text-paragraph">{t.aboutMe.paragraph1}</p>

          <p className="text-paragraph">{t.aboutMe.paragraph2}</p>

          <p className="text-paragraph">{t.aboutMe.paragraph3}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
