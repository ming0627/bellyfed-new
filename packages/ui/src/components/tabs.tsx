'use client';

/**
 * Tabs Component
 *
 * A set of layered sections of content that are displayed one at a time.
 * Based on Radix UI's Tabs primitive.
 */

import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '../utils.js';

/**
 * Tabs component
 */
export const Tabs = TabsPrimitive.Root;

/**
 * TabsList props interface
 */
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /**
   * Additional class name
   */
  className?: string;

  /**
   * Whether to use a vertical layout
   */
  vertical?: boolean;

  /**
   * Whether to use a full-width layout
   */
  fullWidth?: boolean;
}

/**
 * TabsList component
 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, vertical = false, fullWidth = false, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
      vertical && 'flex-col h-auto',
      fullWidth && 'w-full',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * TabsTrigger props interface
 */
export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /**
   * Additional class name
   */
  className?: string;

  /**
   * Icon to display before the label
   */
  icon?: React.ReactNode;

  /**
   * Badge to display after the label
   */
  badge?: React.ReactNode;

  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;
}

/**
 * TabsTrigger component
 */
export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, icon, badge, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      className,
    )}
    {...props}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {props.children}
    {badge && <span className="ml-2">{badge}</span>}
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * TabsContent component
 */
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * TabsWithUnderline props interface
 */
export interface TabsWithUnderlineProps {
  /**
   * The default value of the tabs
   */
  defaultValue?: string;

  /**
   * The current value of the tabs
   */
  value?: string;

  /**
   * Callback when the value changes
   */
  onValueChange?: (value: string) => void;

  /**
   * The tabs to display
   */
  tabs: {
    /**
     * The value of the tab
     */
    value: string;

    /**
     * The label of the tab
     */
    label: React.ReactNode;

    /**
     * The icon of the tab
     */
    icon?: React.ReactNode;

    /**
     * The badge of the tab
     */
    badge?: React.ReactNode;

    /**
     * Whether the tab is disabled
     */
    disabled?: boolean;
  }[];

  /**
   * The content of the tabs
   */
  children: React.ReactNode;

  /**
   * Additional class name for the tabs
   */
  className?: string;

  /**
   * Additional class name for the tabs list
   */
  tabsListClassName?: string;

  /**
   * Additional class name for the tabs trigger
   */
  tabsTriggerClassName?: string;
}

/**
 * TabsWithUnderline component
 *
 * A tabs component with an underline style
 */
export function TabsWithUnderline({
  defaultValue,
  value,
  onValueChange,
  tabs,
  children,
  className,
  tabsListClassName,
  tabsTriggerClassName,
}: TabsWithUnderlineProps): JSX.Element {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn('w-full', className)}
    >
      <div className="relative">
        <TabsList
          className={cn(
            'bg-transparent mb-4 flex w-full justify-start',
            tabsListClassName
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              badge={tab.badge}
              disabled={tab.disabled}
              className={cn(
                'flex-shrink-0 px-3 py-2 text-sm font-medium text-primary',
                'data-[state=active]:text-primary data-[state=active]:border-b-2',
                'data-[state=active]:border-primary transition-all',
                'border-0 rounded-none relative z-10 whitespace-nowrap',
                'focus:outline-none focus:ring-0 hover:bg-primary/10',
                'shadow-none data-[state=active]:shadow-none',
                tabsTriggerClassName
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/20 -z-10" />
      </div>
      {children}
    </Tabs>
  );
}
