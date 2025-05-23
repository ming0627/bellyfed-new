'use client';

/**
 * Collapsible Component
 *
 * An interactive component that expands/collapses a panel.
 * Based on Radix UI's Collapsible primitive.
 */

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';

import { cn } from '../utils.js';
import { Button } from './button.js';

/**
 * Collapsible component
 */
export const Collapsible = CollapsiblePrimitive.Root;

/**
 * CollapsibleTrigger component
 */
export const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

/**
 * CollapsibleContent component
 */
export const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

/**
 * CollapsibleWithButton props interface
 */
export interface CollapsibleWithButtonProps {
  /**
   * The title to display in the trigger button
   */
  title: React.ReactNode;

  /**
   * The content to display when expanded
   */
  children: React.ReactNode;

  /**
   * Whether the collapsible is open by default
   */
  defaultOpen?: boolean;

  /**
   * Whether the collapsible is controlled externally
   */
  open?: boolean;

  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Additional class name for the trigger button
   */
  triggerClassName?: string;

  /**
   * Additional class name for the content
   */
  contentClassName?: string;

  /**
   * Whether to disable the animation
   */
  disableAnimation?: boolean;

  /**
   * The icon to display when collapsed
   */
  collapseIcon?: React.ReactNode;

  /**
   * The icon to display when expanded
   */
  expandIcon?: React.ReactNode;

  /**
   * The variant of the trigger button
   */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];

  /**
   * The size of the trigger button
   */
  buttonSize?: React.ComponentProps<typeof Button>['size'];

  /**
   * Additional class name for the root element
   */
  className?: string;

  /**
   * Whether the collapsible is disabled
   */
  disabled?: boolean;
}

/**
 * CollapsibleWithButton component
 *
 * A convenience component that combines Collapsible with a Button trigger
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function CollapsibleWithButton({
  title,
  children,
  defaultOpen,
  open,
  onOpenChange,
  triggerClassName,
  contentClassName,
  disableAnimation = false,
  collapseIcon = <ChevronUp className="h-4 w-4" />,
  expandIcon = <ChevronDown className="h-4 w-4" />,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
  className,
  ...props
}: CollapsibleWithButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = React.useState(defaultOpen || false);

  // Handle controlled component
  const handleOpenChange = React.useCallback((value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    if (open === undefined) {
      setIsOpen(value);
    }
  }, [onOpenChange, open]);

  // Use controlled value if provided
  const isControlled = open !== undefined;
  const isExpanded = isControlled ? open : isOpen;

  return (
    <Collapsible
      open={isControlled ? open : isOpen}
      onOpenChange={handleOpenChange}
      className={cn('w-full', className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn('flex w-full justify-between', triggerClassName)}
        >
          {title}
          {isExpanded ? collapseIcon : expandIcon}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          'overflow-hidden',
          disableAnimation ? '' : 'data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
          contentClassName
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/**
 * CollapsibleGroup props interface
 */
export interface CollapsibleGroupProps {
  /**
   * The collapsible items to display
   */
  items: {
    /**
     * The unique key for the item
     */
    key: string;

    /**
     * The title to display in the trigger button
     */
    title: React.ReactNode;

    /**
     * The content to display when expanded
     */
    content: React.ReactNode;

    /**
     * Whether the item is disabled
     */
    disabled?: boolean;
  }[];

  /**
   * Whether to allow multiple items to be open at once
   */
  allowMultiple?: boolean;

  /**
   * The key of the item that should be open by default
   */
  defaultOpenKey?: string;

  /**
   * Additional class name for the group
   */
  className?: string;

  /**
   * Additional class name for the trigger buttons
   */
  triggerClassName?: string;

  /**
   * Additional class name for the content
   */
  contentClassName?: string;

  /**
   * Whether to disable the animation
   */
  disableAnimation?: boolean;

  /**
   * The variant of the trigger buttons
   */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];

  /**
   * The size of the trigger buttons
   */
  buttonSize?: React.ComponentProps<typeof Button>['size'];
}

/**
 * CollapsibleGroup component
 *
 * A group of collapsible items where only one can be open at a time (accordion-like)
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export function CollapsibleGroup({
  items,
  allowMultiple = false,
  defaultOpenKey,
  className,
  triggerClassName,
  contentClassName,
  disableAnimation = false,
  buttonVariant = 'ghost',
  buttonSize = 'sm',
}: CollapsibleGroupProps): JSX.Element {
  const [openKeys, setOpenKeys] = React.useState<Set<string>>(
    defaultOpenKey ? new Set([defaultOpenKey]) : new Set()
  );

  const handleOpenChange = React.useCallback((key: string, isOpen: boolean) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);

      if (isOpen) {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(key);
      } else {
        next.delete(key);
      }

      return next;
    });
  }, [allowMultiple]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <CollapsibleWithButton
          key={item.key}
          title={item.title}
          open={openKeys.has(item.key)}
          onOpenChange={(isOpen) => handleOpenChange(item.key, isOpen)}
          triggerClassName={triggerClassName}
          contentClassName={contentClassName}
          disableAnimation={disableAnimation}
          buttonVariant={buttonVariant}
          buttonSize={buttonSize}
          disabled={item.disabled}
        >
          {item.content}
        </CollapsibleWithButton>
      ))}
    </div>
  );
}
