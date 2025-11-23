import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 24, color = 'currentColor', className = '' }) => {
  // capitalize first letter to match Lucide component names (e.g. "home" -> "Home")
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return <IconComponent size={size} color={color} className={className} />;
};

export default Icon;