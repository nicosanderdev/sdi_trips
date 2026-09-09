import { CheckCircle } from 'lucide-react';
import { DynamicIcon, dynamicIconImports, type IconName } from 'lucide-react/dynamic';

/** DB IconId values that don't match a Lucide icon name directly. */
const AMENITY_ICON_ALIASES: Record<string, IconName> = {
  garage: 'car',
};

function resolveIconName(iconId?: string | null): IconName | null {
  const normalized = iconId?.trim().toLowerCase();
  if (!normalized) return null;

  const aliased = AMENITY_ICON_ALIASES[normalized] ?? normalized;
  if (aliased in dynamicIconImports) return aliased;
  return null;
}

export interface AmenityIconProps {
  iconId?: string | null;
  className?: string;
  size?: string | number;
}

export default function AmenityIcon({ iconId, className, size }: AmenityIconProps) {
  const name = resolveIconName(iconId);

  if (!name) {
    return <CheckCircle className={className} size={size} />;
  }

  return (
    <DynamicIcon
      name={name}
      className={className}
      size={size}
      fallback={() => <CheckCircle className={className} size={size} />}
    />
  );
}
