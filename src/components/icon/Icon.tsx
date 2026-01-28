import React from "react";
import CloseIcon from "../../assets/icons/browser/close.svg?react";
import MaximizeIcon from "../../assets/icons/browser/maximize.svg?react";
import MinimizeIcon from "../../assets/icons/browser/minimize.svg?react";
import LinkedinIcon from "../../assets/icons/contact/linkedin.svg?react";
import MailIcon from "../../assets/icons/contact/mail.svg?react";
import CalendarIcon from "../../assets/icons/contact/calendar.svg?react";
import WhatsappIcon from "../../assets/icons/contact/whatsapp.svg?react";
import StructureIcon from "../../assets/icons/service/structure.svg?react";
import CodeIcon from "../../assets/icons/service/code.svg?react";
import DialogIcon from "../../assets/icons/service/dialog.svg?react";
import MonitorsIcon from "../../assets/icons/service/monitors.svg?react";
import TestIcon from "../../assets/icons/service/test.svg?react";
import ChecklistIcon from "../../assets/icons/service/checklist.svg?react";

const icons = {
  close: CloseIcon,
  maximize: MaximizeIcon,
  minimize: MinimizeIcon,
  linkedin: LinkedinIcon,
  mail: MailIcon,
  calendar: CalendarIcon,
  whatsapp: WhatsappIcon,
  structure: StructureIcon,
  code: CodeIcon,
  dialog: DialogIcon,
  monitors: MonitorsIcon,
  test: TestIcon,
  checklist: ChecklistIcon,
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
