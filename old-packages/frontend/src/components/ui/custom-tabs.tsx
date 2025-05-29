import React, { useRef, useEffect } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomTabsProps {
  tabs: readonly string[] | string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export function CustomTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
}: CustomTabsProps): JSX.Element {
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const activeTabElement = tabsRef.current.querySelector(
        '[data-state="active"]',
      );
      if (activeTabElement) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide" ref={tabsRef}>
          <TabsList className="w-max bg-transparent mb-4 flex">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm font-medium text-orange-600
                           data-[state=active]:text-orange-600 data-[state=active]:border-b-2
                           data-[state=active]:border-orange-600 transition-all capitalize
                           focus:outline-none focus:ring-0 hover:bg-orange-50
                           border-0 rounded-none relative z-10 whitespace-nowrap"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-200 -z-10" />
      </div>
      {children}
    </Tabs>
  );
}

export { TabsContent };
