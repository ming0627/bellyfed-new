import {
  Bell,
  Lock,
  Star,
  Users,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useState, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CustomTabs, TabsContent } from '@/components/ui/custom-tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TabItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

export function SettingsComponent(): React.ReactElement {
  const [cuisineTags, setCuisineTags] = useState<string[]>([
    'Italian',
    'Japanese',
    'Mexican',
  ]);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const tabsRef = useRef<HTMLDivElement>(null);

  const addTag = (tag: string): void => {
    if (tag) {
      setCuisineTags((prevTags: string[]) => [...prevTags, tag]);
    }
  };

  const removeTag = (tag: string): void => {
    setCuisineTags((prevTags: string[]) =>
      prevTags.filter((t: string) => t !== tag),
    );
  };

  const tabs: TabItem[] = [
    { value: 'profile', label: 'Profile', icon: Users },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'privacy', label: 'Privacy', icon: Lock },
    { value: 'review', label: 'Review', icon: Star },
    { value: 'discovery', label: 'Discovery', icon: Globe },
  ];

  const handleTabChange = (tabValue: string): void => {
    setActiveTab(tabValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      addTag(e.currentTarget.value);
      e.currentTarget.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-600 text-white">
            <CardTitle className="text-2xl font-bold">John Doe</CardTitle>
            <CardDescription className="text-orange-100">
              Food enthusiast and amateur chef
            </CardDescription>
          </CardHeader>
          <div className="bg-white">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (item: TabItem) => item.value === activeTab,
                  );
                  if (currentIndex > 0) {
                    handleTabChange(tabs[currentIndex - 1].value);
                  }
                }}
                disabled={activeTab === tabs[0].value}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex space-x-4" ref={tabsRef}>
                {tabs.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleTabChange(item.value)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center
                      ${
                        activeTab === item.value
                          ? 'bg-orange-100 text-orange-800'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const currentIndex = tabs.findIndex(
                    (item: TabItem) => item.value === activeTab,
                  );
                  if (currentIndex < tabs.length - 1) {
                    handleTabChange(tabs[currentIndex + 1].value);
                  }
                }}
                disabled={activeTab === tabs[tabs.length - 1].value}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <CustomTabs
                  tabs={tabs.map((t) => t.value)}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                >
                  <TabsContent value="profile">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          placeholder="Your display name"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          placeholder="Tell us about yourself"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="Your city or region"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          placeholder="Your personal website"
                          className="border-orange-200 focus:border-orange-400"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Favorite Cuisines</Label>
                        <div className="flex flex-wrap gap-2">
                          {cuisineTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            >
                              {tag} <span className="ml-1">×</span>
                            </Badge>
                          ))}
                          <Input
                            placeholder="Add cuisine"
                            className="w-32 border-orange-200 focus:border-orange-400"
                            onKeyPress={handleKeyPress}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  {/* Other TabsContent components remain unchanged */}
                </CustomTabs>
                <Button className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white">
                  Save {tabs.find((item) => item.value === activeTab)?.label}{' '}
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
