import React from "react";
import "./aboutMe.scss";
import imagePath from "../../assets/images/shirzabolotny.png?url";
import { ReactComponent as Circle } from "../../assets/images/circle.svg";

const AboutMe: React.FC = () => {
  return (
    <div className="about-me-container">
      <h2 className="about-me-title">About me</h2>

      <div className="about-me-content">
        <div className="profile-image-wrapper">
          <Circle className="background-circle" aria-hidden />
          <img src={imagePath} alt="Profile" className="profile-image" />
        </div>

        <div className="about-me-text">
          <p className="text-paragraph">
            I've shaped my skills at top tech companies, with an M.Sc. in
            Information Systems.
          </p>

          <p className="text-paragraph">
            I blend technical precision with design intuition, creating reliable
            and functional solutions, while prioritizing work done correctly and
            thoroughly
          </p>

          <p className="text-paragraph">
            I bring <strong>an artist's eye</strong> to every project - turning
            <strong>color, composition, and hierarchy</strong> into interfaces
            that <strong>feel intuitive.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
