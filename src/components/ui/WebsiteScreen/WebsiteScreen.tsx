import React from "react";
import { SectionComponent } from "../../../types/app";

interface WebsiteSectionProps {
  id: string;
  isVisible: boolean;
  Screen: SectionComponent;
  setRef: (el: HTMLDivElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const WebsiteSection = ({
  id,
  isVisible,
  Screen,
  setRef,
  containerRef,
}: WebsiteSectionProps) => (
  <div ref={setRef} id={id}>
    <Screen isVisible={isVisible} containerRef={containerRef} />
  </div>
);

export default WebsiteSection;
