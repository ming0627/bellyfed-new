// components/AddDishDialog.tsx
// Using type declarations to avoid TS errors when modules are not found
import { Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface AddDishDialogProps {
  existingMenuItems: string[];
  newMenuItems: string[];
  setExistingMenuItems: React.Dispatch<React.SetStateAction<string[]>>;
  setNewMenuItems: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedMenuItem: (name: string) => void;
}

export const AddDishDialog: React.FC<AddDishDialogProps> = ({
  existingMenuItems,
  newMenuItems,
  setExistingMenuItems,
  setNewMenuItems,
  setSelectedMenuItem,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredNewMenuItems, setFilteredNewMenuItems] =
    useState<string[]>(newMenuItems);

  const handleSearchMenuItem = (term: string): void => {
    setSearchTerm(term);
    const filtered = newMenuItems.filter((menuItem: string) =>
      menuItem.toLowerCase().includes(term.toLowerCase()),
    );
    setFilteredNewMenuItems(filtered);
  };

  const handleAddMenuItem = (menuItem: string): void => {
    if (menuItem && !existingMenuItems.includes(menuItem)) {
      setExistingMenuItems([...existingMenuItems, menuItem]);
      setNewMenuItems(newMenuItems.filter((d: string) => d !== menuItem));
      setSelectedMenuItem(menuItem);
      toast.success(`Added new menu item: ${menuItem}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
          <DialogDescription>
            Select a new menu item to add to your list.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleSearchMenuItem(e.target.value)
            }
            placeholder="Search for a new menu item"
            className="flex-grow"
          />
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {(searchTerm ? filteredNewMenuItems : newMenuItems).map(
            (menuItem: string) => (
              <Button
                key={menuItem}
                onClick={() => {
                  handleAddMenuItem(menuItem);
                  const closeButton = document.querySelector(
                    '[data-dismiss]',
                  ) as HTMLElement;
                  if (closeButton) closeButton.click();
                }}
                variant="ghost"
                className="w-full justify-start text-left mb-2 hover:bg-orange-100"
              >
                {menuItem}
              </Button>
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
