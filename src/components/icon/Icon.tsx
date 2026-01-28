import React from "react";
import { ReactComponent as CloseIcon } from "@/assets/icons/browser/close.svg";
import { ReactComponent as MaximizeIcon } from "@/assets/icons/browser/maximize.svg";
import { ReactComponent as MinimizeIcon } from "@/assets/icons/browser/minimize.svg";
import { ReactComponent as LinkedinIcon } from "@/assets/icons/contact/linkedin.svg";
import { ReactComponent as MailIcon } from "@/assets/icons/contact/mail.svg";
import { ReactComponent as CalendarIcon } from "@/assets/icons/contact/calendar.svg";
import { ReactComponent as WhatsappIcon } from "@/assets/icons/contact/whatsapp.svg";
import { ReactComponent as structureIcon } from "@/assets/icons/service/structure.svg";
import { ReactComponent as codeIcon } from "@/assets/icons/service/code.svg";
import { ReactComponent as dialogIcon } from "@/assets/icons/service/dialog.svg";
import { ReactComponent as monitorsIcon } from "@/assets/icons/service/monitors.svg";
import { ReactComponent as testIcon } from "@/assets/icons/service/test.svg";
import { ReactComponent as checklistIcon } from "@/assets/icons/service/checklist.svg";

const icons = {
  close: CloseIcon,
  maximize: MaximizeIcon,
  minimize: MinimizeIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
  calendar: CalendarIcon,
  whatsapp: WhatsappIcon,
  structure: structureIcon,
  code: codeIcon,
  dialog: dialogIcon,
  monitors: monitorsIcon,
  test: testIcon,
  checklist: checklistIcon,
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
