import { SiCplusplus, SiTypescript, SiGo } from "react-icons/si";
import type { IconType } from "react-icons";

// Brand logos come from react-icons' Simple Icons set (no image assets). Keyed
// by slug; an unknown language simply renders nothing.
const ICONS: Record<string, { Icon: IconType; color: string }> = {
  cpp: { Icon: SiCplusplus, color: "#00599C" },
  ts: { Icon: SiTypescript, color: "#3178C6" },
  go: { Icon: SiGo, color: "#00ADD8" },
};

export function LanguageIcon({
  slug,
  className,
}: {
  slug: string | undefined;
  className?: string;
}) {
  const entry = slug ? ICONS[slug] : undefined;
  if (!entry) return null;
  const { Icon, color } = entry;
  return <Icon className={className} style={{ color }} />;
}
