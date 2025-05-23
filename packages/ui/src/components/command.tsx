'use client';

/**
 * Command Component
 *
 * A command palette for keyboard-first interfaces.
 * Based on cmdk and Radix UI's Dialog primitive.
 */

import { type DialogProps } from '@radix-ui/react-dialog';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';

import { cn } from '../utils.js';
import { Dialog, DialogContent } from './dialog.js';

/**
 * Command component
 */
export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

/**
 * CommandDialog props interface
 */
export interface CommandDialogProps extends DialogProps {
  /**
   * Whether to hide the close button
   */
  hideCloseButton?: boolean;

  /**
   * Additional class name for the command component
   */
  commandClassName?: string;
}

/**
 * CommandDialog component
 */
export const CommandDialog = ({
  children,
  hideCloseButton,
  commandClassName,
  ...props
}: CommandDialogProps): JSX.Element => {
  return (
    <Dialog {...props}>
      <DialogContent
        className="overflow-hidden p-0"
        hideCloseButton={hideCloseButton}
      >
        <Command
          className={cn(
            '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5',
            commandClassName
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

/**
 * CommandInput props interface
 */
export interface CommandInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  /**
   * Whether to hide the search icon
   */
  hideIcon?: boolean;

  /**
   * Custom search icon
   */
  icon?: React.ReactNode;

  /**
   * Additional class name for the wrapper
   */
  wrapperClassName?: string;
}

/**
 * CommandInput component
 */
export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  CommandInputProps
>(({
  className,
  hideIcon = false,
  icon,
  wrapperClassName,
  ...props
}, ref) => (
  <div
    className={cn(
      "flex items-center border-b px-3",
      wrapperClassName
    )}
    data-cmdk-input-wrapper=""
  >
    {!hideIcon && (
      icon || <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    )}
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

/**
 * CommandList component
 */
export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

/**
 * CommandEmpty component
 */
export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

/**
 * CommandGroup component
 */
export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

/**
 * CommandSeparator component
 */
export const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/**
 * CommandItem props interface
 */
export interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  /**
   * Whether the item is active
   */
  active?: boolean;

  /**
   * Icon to display before the item text
   */
  icon?: React.ReactNode;

  /**
   * Shortcut to display after the item text
   */
  shortcut?: string;
}

/**
 * CommandItem component
 */
export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({
  className,
  active,
  icon,
  shortcut,
  children,
  ...props
}, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      active && 'bg-accent text-accent-foreground',
      className,
    )}
    {...props}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
    {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
  </CommandPrimitive.Item>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

/**
 * CommandShortcut component
 */
export const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

/**
 * CommandPalette props interface
 */
export interface CommandPaletteProps {
  /**
   * Whether the command palette is open
   */
  open: boolean;

  /**
   * Callback when the open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Placeholder text for the search input
   */
  placeholder?: string;

  /**
   * Text to display when no results are found
   */
  emptyMessage?: string;

  /**
   * Groups of command items
   */
  groups: {
    /**
     * Group heading
     */
    heading: string;

    /**
     * Group items
     */
    items: {
      /**
       * Item ID
       */
      id: string;

      /**
       * Item label
       */
      label: string;

      /**
       * Item icon
       */
      icon?: React.ReactNode;

      /**
       * Item shortcut
       */
      shortcut?: string;

      /**
       * Callback when the item is selected
       */
      onSelect: () => void;

      /**
       * Whether the item is disabled
       */
      disabled?: boolean;
    }[];
  }[];
}

/**
 * CommandPalette component
 *
 * A convenience component that combines all the command components
 */
export function CommandPalette({
  open,
  onOpenChange,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
  groups,
}: CommandPaletteProps): JSX.Element {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group.heading} heading={group.heading}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                icon={item.icon}
                shortcut={item.shortcut}
                onSelect={item.onSelect}
                disabled={item.disabled}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
