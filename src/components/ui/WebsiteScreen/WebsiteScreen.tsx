import React from "react";
import { SectionComponent } from "../../../helper/types";

const WebsiteSection = ({
  id,
  isVisible,
  Screen,
  setRef,
}: {
  id: string;
  isVisible: boolean;
  Screen: SectionComponent;
  setRef: (el: HTMLDivElement | null) => void;
}) => (
  <div ref={setRef} id={id}>
    <Screen isVisible={isVisible} />
  </div>
);

export default WebsiteSection;
