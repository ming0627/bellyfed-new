'use client';

import { LucideIcon, LucideProps } from 'lucide-react';
import React from 'react';

import { ClientOnly } from './client-only';

interface LucideIconProps extends LucideProps {
  icon: LucideIcon;
}

/**
 * A component that renders Lucide icons only on the client side.
 * This prevents hydration errors when using Lucide icons.
 *
 * @example
 * <LucideClientIcon icon={Heart} size={24} className="text-red-500" />
 */
export function LucideClientIcon({
  icon: Icon,
  ...props
}: LucideIconProps): JSX.Element {
  // Calculate dimensions for the fallback
  const size = props.size || '1em';
  const width = props.width || size;
  const height = props.height || size;

  return (
    <ClientOnly
      fallback={
        <span
          style={{
            display: 'inline-block',
            width: width,
            height: height,
          }}
          aria-hidden="true"
          data-lucide-placeholder="true"
        />
      }
    >
      <Icon {...props} />
    </ClientOnly>
  );
}
