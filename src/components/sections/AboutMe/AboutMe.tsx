import React from "react";
import "./aboutMe.scss";
import imagePath from "../../../assets/images/shirzabolotny.png?url";
import { ReactComponent as Circle } from "../../../assets/images/circle.svg";
import { useTranslation } from "../../../hooks/useTranslation";

const AboutMe: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="about-me-container">
      <h2 className="about-me-title">{t.aboutMe.title}</h2>

      <div className="about-me-content">
        <div className="profile-image-wrapper">
          <Circle className="background-circle" aria-hidden />
          <img src={imagePath} alt="Profile" className="profile-image" />
        </div>

        <div className="about-me-text">
          <p className="text-paragraph">{t.aboutMe.paragraph1}</p>

          <p className="text-paragraph">{t.aboutMe.paragraph2}</p>

          <p className="text-paragraph">{t.aboutMe.paragraph3}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
