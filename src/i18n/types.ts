import type { Language } from "../types/app";

export interface TextStructure {
  browser: {
    windowControls: {
      close: string;
      minimize: string;
      maximize: string;
    };
    title: string;
  };
  overview: {
    name: string;
    subtitle: string;
    skills: {
      architecture: string;
      design: string;
      userExperience: string;
    };
    quote: string;
    cta: string;
  };
  aboutMe: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  expertise: {
    title: string;
    cards: {
      architecture: {
        title: string;
        description: string;
      };
      implementation: {
        title: string;
        description: string;
      };
      communication: {
        title: string;
        description: string;
      };
      design: {
        title: string;
        description: string;
      };
      testing: {
        title: string;
        description: string;
      };
      mentorship: {
        title: string;
        description: string;
      };
    };
  };
  contact: {
    title: string;
    subtitle: string;
    links: {
      linkedin: string;
      whatsapp: string;
      email: string;
      scheduleMeeting: string;
    };
  };
}
