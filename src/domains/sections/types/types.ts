import React from "react";

export interface SectionComponent {
  id: string;
  title: string;
  component: React.ComponentType<{
    isVisible: boolean;
    containerRef?: React.RefObject<HTMLDivElement | null>;
  }>;
}
