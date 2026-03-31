import React from "react";

import { SectionComponent } from "../../../sections/types";

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
    <Screen.component isVisible={isVisible} containerRef={containerRef} />
  </div>
);

export default WebsiteSection;
