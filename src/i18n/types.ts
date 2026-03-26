export type Language = "en" | "he";

export const LANGUAGE = {
  EN: "en" as Language,
  HE: "he" as Language,
} as const;

export interface TextStructure {
  browser: {
    windowControls: {
      close: string;
      minimize: string;
      maximize: string;
    };
    title: string;
  };
  navigation: {
    overview: string;
    about: string;
    service: string;
    contact: string;
  };
  overview: {
    name: string;
    subtitle: string;
    skills: {
      architecture: string;
      design: string;
      userExperience: string;
    };
    hook: string;
    quote: string;
    cta: string;
    link: string;
  };
  aboutMe: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  service: {
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
    subtitlePrimary: string;
    subtitleSecondary: string;
    links: {
      linkedin: {
        name: string;
      };
      whatsapp: {
        name: string;
        text: string;
      };
      email: {
        name: string;
        subject: string;
        body: string;
      };
      scheduleMeeting: {
        name: string;
        text: string;
        details: string;
      };
    };
  };
}
