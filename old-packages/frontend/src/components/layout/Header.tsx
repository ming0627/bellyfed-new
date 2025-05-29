import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientOnly } from '@/components/ui/client-only';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { COUNTRIES } from '@/config/countries';
import { useAuth } from '@/contexts/AuthContext';
import { useCountry } from '@/contexts/CountryContext';
import { cn } from '@/lib/utils';
import { OpenAIService } from '@/services/openai';
import { useLoadScript } from '@react-google-maps/api';
import { MapPin, Search, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

const libraries: 'places'[] = ['places'];

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm: (term: string) => void;
  children?: React.ReactNode;
}

// Check if we're in a static export environment
const isStaticExport = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    !!(window as Window & { IS_STATIC_EXPORT?: boolean }).IS_STATIC_EXPORT
  );
};

export const Header: React.FC<HeaderProps> = ({
  searchTerm = '',
  setSearchTerm,
  children,
}) => {
  const { currentCountry, setCountryByCode, isInitialized } = useCountry();
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const staticExport = isStaticExport();

  // Update search input when searchTerm prop changes
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Only load Google Maps API in browser environment and not in static export
  useEffect(() => {
    if (typeof window === 'undefined' || staticExport) {
      return;
    }

    try {
      // Delay loading Google Maps to avoid issues during static export
      if (!isGoogleMapsLoaded && isInitialized) {
        setTimeout(() => {
          setIsGoogleMapsLoaded(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  }, [isGoogleMapsLoaded, isInitialized, staticExport]);

  // Initialize places autocomplete
  const {
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: currentCountry.code.toLowerCase() },
      types: ['restaurant', 'food'],
    },
    debounce: 300,
    initOnMount: isLoaded && !staticExport,
  });

  // Update places autocomplete value when search input changes
  useEffect(() => {
    if (searchInput !== value && isLoaded && !staticExport) {
      try {
        setValue(searchInput, true);
      } catch (error) {
        console.error('Error setting places autocomplete value:', error);
      }
    }
  }, [searchInput, setValue, value, isLoaded, staticExport]);

  const handleSelect = async (description: string) => {
    try {
      if (staticExport) {
        setSearchInput(description);
        setSearchTerm(description);
        return;
      }

      setValue(description, false);
      clearSuggestions();
      setSearchInput(description);
      setSearchTerm(description);

      if (isLoaded) {
        const results = await getGeocode({ address: description });
        const { lat, lng } = await getLatLng(results[0]);
        console.log('Selected place coordinates:', { lat, lng });
      }
    } catch (error) {
      console.error('Error handling place selection:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setSearchInput(value);

    if (!staticExport && isLoaded) {
      try {
        setValue(value, true);
      } catch (error) {
        console.error('Error setting places autocomplete value:', error);
      }
    }
  };

  const handleCountryChange = (newCountryCode: string): void => {
    try {
      const path = router.asPath.split('?')[0];
      const pathSegments = path.split('/').filter(Boolean);

      if (pathSegments[0] === 'my' || pathSegments[0] === 'sg') {
        pathSegments[0] = newCountryCode;
      } else {
        pathSegments.unshift(newCountryCode);
      }

      const newPath = `/${pathSegments.join('/')}`;
      setCountryByCode(newCountryCode);

      // In static export, just update the URL without router navigation
      if (staticExport) {
        window.location.href = newPath;
        return;
      }

      router.push(newPath);
    } catch (error) {
      console.error('Error changing country:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAIEnabled || !searchInput.trim()) return;

    try {
      // Skip API call in static export
      if (staticExport) {
        const searchParams = new URLSearchParams({
          cuisine: 'All',
          location: '',
          searchQuery: searchInput,
        });

        const restaurantsPath = `/restaurants?${searchParams.toString()}`;
        window.location.href = restaurantsPath;
        return;
      }

      const response = await OpenAIService.extractKeywords(searchInput);
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('AI Search Results:', response);
      }

      // Prepare search params
      const searchParams = new URLSearchParams({
        cuisine: response.cuisine || 'All',
        location: response.location || '',
        searchQuery: searchInput,
      });

      // If not authenticated, redirect to sign in
      if (!isAuthenticated) {
        try {
          // No need to store in session storage, just pass in the URL
          router.push({
            pathname: '/signin',
            query: {
              returnUrl: `/restaurants?${searchParams.toString()}`,
              message: 'Please sign in to view restaurants',
            },
          });
        } catch (error) {
          console.error('Error redirecting to signin:', error);
        }
        return;
      }

      // If authenticated, redirect to restaurants page
      const restaurantsPath = `/restaurants?${searchParams.toString()}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('Redirecting to:', restaurantsPath);
      }
      await router.push(restaurantsPath);
    } catch (error) {
      console.error('AI Search Error:', error);
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Country Selector */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${currentCountry.code}`}
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <Image
                src="/bellyfed.png"
                alt="BellyFed"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-bold text-xl text-orange-600 hidden sm:inline">
                BellyFed
              </span>
            </Link>

            {/* Country Selector */}
            <Select
              value={currentCountry.code}
              onValueChange={handleCountryChange}
            >
              <SelectTrigger className="w-[130px] bg-orange-50 hover:bg-orange-100 transition-colors border-orange-200 text-orange-700">
                <div className="flex items-center whitespace-nowrap">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                  <span className="truncate">{currentCountry.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-orange-100">
                {Object.values(COUNTRIES).map((country) => (
                  <SelectItem
                    key={country.code}
                    value={country.code}
                    className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer"
                  >
                    <div className="flex items-center whitespace-nowrap">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="flex items-center gap-2">
              {/* Search Input with Submit */}
              <div className="relative flex-1 max-w-2xl">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleInputChange}
                    disabled={!isLoaded}
                    placeholder={
                      !isLoaded
                        ? 'Loading Google Maps...'
                        : isAIEnabled
                          ? 'Try: Find me the best Nasi Lemak in Kuala Lumpur'
                          : 'Search for restaurants, dishes, or cuisines...'
                    }
                    className={cn(
                      'flex h-9 w-full rounded-md border px-3 py-1 pl-10 pr-10 text-sm shadow-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1',
                      isAIEnabled
                        ? 'bg-indigo-50 border-indigo-200 placeholder:text-indigo-400 focus-visible:ring-indigo-500'
                        : 'bg-gray-50 border-gray-200 hover:border-orange-200 focus-visible:ring-orange-500',
                    )}
                  />
                  {searchInput && (
                    <button
                      onClick={() => {
                        setSearchInput('');
                        clearSuggestions();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {status === 'OK' && data.length > 0 && !isAIEnabled && (
                  <div className="absolute z-50 w-full mt-1">
                    <Command className="rounded-lg border shadow-md bg-white">
                      <CommandList>
                        <CommandGroup>
                          {data.map((suggestion) => (
                            <CommandItem
                              key={suggestion.place_id}
                              onSelect={() =>
                                handleSelect(suggestion.description)
                              }
                              className="flex items-center gap-2 px-4 py-2.5 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <div className="flex flex-col min-w-0">
                                  <span className="truncate text-sm font-medium">
                                    {suggestion.structured_formatting
                                      ?.main_text ||
                                      suggestion.description.split(',')[0]}
                                  </span>
                                  {suggestion.structured_formatting
                                    ?.secondary_text && (
                                    <span className="truncate text-xs text-muted-foreground">
                                      {
                                        suggestion.structured_formatting
                                          .secondary_text
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>

              {/* Toggle between Normal and AI search */}
              <div className="flex items-center rounded-full bg-gray-100/50 p-0.5 backdrop-blur-sm border border-gray-200/50">
                <button
                  onClick={() => setIsAIEnabled(false)}
                  className={cn(
                    'px-4 py-1.5 rounded-full transition-all duration-300 text-sm font-medium',
                    !isAIEnabled
                      ? 'bg-white text-orange-600 shadow-sm border border-orange-100'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Normal
                  </span>
                </button>
                <button
                  onClick={() => setIsAIEnabled(true)}
                  className={cn(
                    'px-4 py-1.5 rounded-full transition-all duration-300 text-sm font-medium',
                    isAIEnabled
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm border border-indigo-300'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <ClientOnly
                      fallback={<span className="w-3.5 h-3.5"></span>}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill={isAIEnabled ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </ClientOnly>
                    AI
                  </span>
                </button>
              </div>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleSearch}
                disabled={!isLoaded || !searchInput}
                className={cn(
                  isAIEnabled &&
                    'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
                )}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    console.log('Sign Out clicked from Header');

                    // Prevent any UI flicker by disabling the button during sign-out
                    const button = e.currentTarget;
                    if (button) {
                      // Disable the button and change text
                      button.disabled = true;
                      button.innerHTML = 'Signing out...';

                      // Add a class to prevent the button from being clicked again
                      button.classList.add('pointer-events-none', 'opacity-50');
                    }

                    // Use the AuthContext's signOut function
                    signOut();
                  }}
                  className="text-xs sm:text-sm md:text-base px-2 sm:px-4"
                >
                  Sign Out
                </Button>

                <Link href="/profile">
                  <Avatar className="h-8 w-8 hover:ring-2 hover:ring-orange-200 transition-all">
                    <AvatarImage
                      src="https://avatars.githubusercontent.com/u/124599?v=4"
                      alt="User Avatar"
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              /* Don't render Sign In button here - it's already in the headerContent */
              <div></div>
            )}
          </div>

          {children}
        </div>
      </div>
    </header>
  );
};
