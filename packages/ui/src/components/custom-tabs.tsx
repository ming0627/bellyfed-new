'use client';

/**
 * Custom Tabs Component
 * 
 * A customized tabs component with scrollable tabs and automatic scrolling to the active tab.
 */

import * as React from 'react';

import { cn } from '../utils.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.js';

/**
 * CustomTabs props interface
 */
export interface CustomTabsProps {
  /**
   * The tabs to display
   */
  tabs: readonly string[] | string[];
  
  /**
   * The active tab
   */
  activeTab: string;
  
  /**
   * Callback when the tab changes
   */
  onTabChange: (tab: string) => void;
  
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
  
  /**
   * Whether to use smooth scrolling
   */
  smoothScroll?: boolean;
  
  /**
   * The color theme for the tabs
   */
  colorTheme?: 'primary' | 'secondary' | 'orange';
}

/**
 * CustomTabs component
 */
export function CustomTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  tabsListClassName,
  tabsTriggerClassName,
  smoothScroll = true,
  colorTheme = 'orange',
}: CustomTabsProps): JSX.Element {
  const tabsRef = React.useRef<HTMLDivElement>(null);

  // Get color classes based on the theme
  const getColorClasses = React.useCallback(() => {
    switch (colorTheme) {
      case 'primary':
        return {
          text: 'text-primary',
          border: 'border-primary',
          hover: 'hover:bg-primary/10',
          bg: 'bg-primary/20',
        };
      case 'secondary':
        return {
          text: 'text-secondary',
          border: 'border-secondary',
          hover: 'hover:bg-secondary/10',
          bg: 'bg-secondary/20',
        };
      case 'orange':
      default:
        return {
          text: 'text-orange-600',
          border: 'border-orange-600',
          hover: 'hover:bg-orange-50',
          bg: 'bg-orange-200',
        };
    }
  }, [colorTheme]);

  const colors = getColorClasses();

  // Scroll to the active tab when it changes
  React.useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(
        '[data-state="active"]',
      );
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: smoothScroll ? 'smooth' : 'auto',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab, smoothScroll]);

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange} 
      className={cn('w-full', className)}
    >
      <div className="relative">
        <div 
          className="overflow-x-auto scrollbar-hide" 
          ref={tabsRef}
        >
          <TabsList 
            className={cn(
              'w-max bg-transparent mb-4 flex',
              tabsListClassName
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  'flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium',
                  colors.text,
                  `data-[state=active]:${colors.text} data-[state=active]:border-b-2`,
                  `data-[state=active]:${colors.border} transition-all capitalize`,
                  'focus:outline-none focus:ring-0',
                  colors.hover,
                  'border-0 rounded-none relative z-10 whitespace-nowrap',
                  'shadow-none data-[state=active]:shadow-none',
                  tabsTriggerClassName
                )}
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div 
          className={cn(
            'absolute bottom-0 left-0 w-full h-[2px] -z-10',
            colors.bg
          )} 
        />
      </div>
      {children}
    </Tabs>
  );
}

/**
 * ScrollableTabsContainer props interface
 */
export interface ScrollableTabsContainerProps {
  /**
   * The tabs to display
   */
  tabs: readonly string[] | string[];
  
  /**
   * The active tab
   */
  activeTab: string;
  
  /**
   * Callback when the tab changes
   */
  onTabChange: (tab: string) => void;
  
  /**
   * The content of the tabs
   */
  children: React.ReactNode;
  
  /**
   * Additional class name for the container
   */
  className?: string;
  
  /**
   * Additional class name for the tabs
   */
  tabsClassName?: string;
  
  /**
   * Additional class name for the content
   */
  contentClassName?: string;
  
  /**
   * The color theme for the tabs
   */
  colorTheme?: 'primary' | 'secondary' | 'orange';
}

/**
 * ScrollableTabsContainer component
 * 
 * A convenience component that combines CustomTabs with TabsContent
 */
export function ScrollableTabsContainer({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  tabsClassName,
  contentClassName,
  colorTheme,
}: ScrollableTabsContainerProps): JSX.Element {
  // Get the children as an array
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={cn('w-full', className)}>
      <CustomTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={tabsClassName}
        colorTheme={colorTheme}
      >
        {tabs.map((tab, index) => (
          <TabsContent
            key={tab}
            value={tab}
            className={cn('mt-4', contentClassName)}
          >
            {/* Render the corresponding child for this tab */}
            {childrenArray[index] || null}
          </TabsContent>
        ))}
      </CustomTabs>
    </div>
  );
}

export { TabsContent };
