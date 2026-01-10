import React from "react";

import { ReactComponent as ArchitectureIcon } from "@/assets/icons/architecture.svg";
import { ReactComponent as BalanceIcon } from "@/assets/icons/balance.svg";
import { ReactComponent as ExperienceIcon } from "@/assets/icons/experience.svg";
import { ReactComponent as DesignIcon } from "@/assets/icons/design.svg";
import { ReactComponent as LinkedinIcon } from "@/assets/icons/linkedin.svg";
import { ReactComponent as MailIcon } from "@/assets/icons/mail.svg";
import { ReactComponent as UxIcon } from "@/assets/icons/ux.svg";
import { ReactComponent as CloseIcon } from "@/assets/icons/close.svg";
import { ReactComponent as MaximizeIcon } from "@/assets/icons/maximize.svg";
import { ReactComponent as MinimizeIcon } from "@/assets/icons/minimize.svg";
import { ReactComponent as CalendarIcon } from "@/assets/icons/calendar.svg";
import { ReactComponent as WhatsappIcon } from "@/assets/icons/whatsapp.svg";

const icons = {
  architecture: ArchitectureIcon,
  balance: BalanceIcon,
  experience: ExperienceIcon,
  design: DesignIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
  ux: UxIcon,
  close: CloseIcon,
  maximize: MaximizeIcon,
  minimize: MinimizeIcon,
  calendar: CalendarIcon,
  whatsapp: WhatsappIcon,
};

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  width,
  height,
  className,
}) => {
  const SvgIcon = icons[name];

  if (!SvgIcon) {
    console.warn(`Icon "${name}" not found in Icon.tsx`);
    return null;
  }

  return (
    <SvgIcon
      width={width ?? size}
      height={height ?? size}
      className={className}
    />
  );
};
