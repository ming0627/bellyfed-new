import React, { useEffect, useState, memo } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';
import { LucideClientIcon } from './lucide-icon.js';

/**
 * ThemeToggle component for switching between light, dark, and system themes
 * 
 * @returns {JSX.Element} - Rendered component
 */
const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // After mounting, we can safely show the theme toggle
  // This avoids hydration mismatch issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('#theme-toggle-button') === null && 
          event.target.closest('#theme-toggle-dropdown') === null) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle theme selection
  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  // If not mounted yet, render a placeholder to avoid layout shift
  if (!mounted) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }

  // Determine which icon to show based on current theme
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div className="relative">
      <button
        id="theme-toggle-button"
        onClick={toggleDropdown}
        className="w-8 h-8 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle theme"
      >
        <LucideClientIcon icon={ThemeIcon} className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          id="theme-toggle-dropdown"
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5"
        >
          <ul className="py-1">
            <li
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'light' ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleSelectTheme('light')}
            >
              <div className="flex items-center">
                <LucideClientIcon icon={Sun} className="w-5 h-5 mr-3 text-yellow-500" />
                <span className={`block truncate ${
                  theme === 'light' ? 'font-medium text-orange-500' : 'font-normal text-gray-700 dark:text-gray-200'
                }`}>
                  Light
                </span>
              </div>
            </li>
            <li
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleSelectTheme('dark')}
            >
              <div className="flex items-center">
                <LucideClientIcon icon={Moon} className="w-5 h-5 mr-3 text-blue-500" />
                <span className={`block truncate ${
                  theme === 'dark' ? 'font-medium text-orange-500' : 'font-normal text-gray-700 dark:text-gray-200'
                }`}>
                  Dark
                </span>
              </div>
            </li>
            <li
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'system' ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
              onClick={() => handleSelectTheme('system')}
            >
              <div className="flex items-center">
                <LucideClientIcon icon={Laptop} className="w-5 h-5 mr-3 text-gray-500" />
                <span className={`block truncate ${
                  theme === 'system' ? 'font-medium text-orange-500' : 'font-normal text-gray-700 dark:text-gray-200'
                }`}>
                  System
                </span>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
});

export default ThemeToggle;
