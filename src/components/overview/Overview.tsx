import React from "react";
import "./overview.scss";
import branchPath from "../../assets/images/branch.svg?url";
const Overview: React.FC = () => {
  return (
    <div className="overview-section">
      <div className="overview-content">
        <h1 className="overview-name">Shir Zabolotny</h1>
        <p className="overview-subtitle">
          Frontend developer who weaves together
        </p>
        <div className="overview-skills">
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
        <blockquote className="overview-quote">
          "To me, a website is more than code or visuals - it should
          <strong>tell your brand's story</strong> and turn visitors into
          <strong>believers in what you do</strong>
          ".
        </blockquote>
        <p className="overview-cta">
          Let's create something that makes you unique and helps your business
          grow
        </p>
      </div>
    </div>
  );
};

export default Overview;
