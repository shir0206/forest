import React from "react";
import "./HeroSection.scss";
import branchPath from "../../assets/images/branch.svg?url";
const HeroSection: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        {/* Name */}
        <h1 className="hero-name">Shir Zabolotny</h1>
        {/* Subtitle */}
        <p className="hero-subtitle">Frontend developer who weaves together</p>
        {/* Skills with dots */}
        <div className="hero-skills">
          <span>Architecture</span>
          <span className="dot">●</span>
          <span>Design</span>
          <span className="dot">●</span>
          <span>User Experience</span>
        </div>
        <img
          src={branchPath}
          alt="background circle"
          className="background-branch branch-left"
        />
        <img
          src={branchPath}
          alt="background circle"
          className="background-branch branch-right"
        />
        {/* Quote */}
        <blockquote className="hero-quote">
          "To me, a website is more than code or visuals - it should{" "}
          <strong>
            tell your brand's story and turn visitors into believers in what you
            do
          </strong>
          ".
        </blockquote>
        {/* CTA */}
        <p className="hero-cta">
          Let's create something that makes you unique and helps your business
          grow
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
