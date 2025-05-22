/**
 * Theme configuration for the Bellyfed application
 * 
 * This file contains the color palette and theme settings for the application.
 * The primary color scheme is orange-peach with high contrast for accessibility.
 */

export const colors = {
  // Primary colors - Orange-Peach palette
  primary: {
    50: '#fff7ed',  // Lightest orange
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Base orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',  // Darkest orange
    950: '#431407',
  },
  
  // Secondary colors - Complementary to orange-peach
  secondary: {
    50: '#f0fdfa',  // Lightest teal
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Base teal
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',  // Darkest teal
    950: '#042f2e',
  },
  
  // Accent colors - For highlights and special elements
  accent: {
    50: '#fdf2f8',  // Lightest pink
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Base pink
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',  // Darkest pink
    950: '#500724',
  },
  
  // Success, warning, error colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Base green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Base amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Base red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  
  // Neutral colors for text, backgrounds, etc.
  neutral: {
    50: '#fafafa',  // Lightest gray
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373', // Base gray
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',  // Darkest gray
    950: '#0a0a0a',
  },
};

// Theme configuration for light mode
export const lightTheme = {
  background: {
    primary: 'white',
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[700],
    tertiary: colors.neutral[500],
    inverted: 'white',
  },
  border: {
    light: colors.neutral[200],
    medium: colors.neutral[300],
    dark: colors.neutral[400],
  },
};

// Theme configuration for dark mode
export const darkTheme = {
  background: {
    primary: colors.neutral[900],
    secondary: colors.neutral[800],
    tertiary: colors.neutral[700],
  },
  text: {
    primary: 'white',
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
    inverted: colors.neutral[900],
  },
  border: {
    light: colors.neutral[700],
    medium: colors.neutral[600],
    dark: colors.neutral[500],
  },
};

// Button variants
export const buttonVariants = {
  primary: {
    base: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
    outline: 'border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:ring-orange-500',
    ghost: 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:ring-orange-500',
  },
  secondary: {
    base: 'bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500',
    outline: 'border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 focus:ring-teal-500',
    ghost: 'text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 focus:ring-teal-500',
  },
  success: {
    base: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    outline: 'border border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-500',
    ghost: 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-500',
  },
  warning: {
    base: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500',
    outline: 'border border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:ring-amber-500',
    ghost: 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:ring-amber-500',
  },
  error: {
    base: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    outline: 'border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
    ghost: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500',
  },
  neutral: {
    base: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-gray-500 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 focus:ring-gray-500',
    ghost: 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/20 focus:ring-gray-500',
  },
};

// Common spacing values
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
};

// Border radius values
export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  md: '0.25rem',   // 4px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};

// Animation durations
export const animation = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '1000ms',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export default {
  colors,
  lightTheme,
  darkTheme,
  buttonVariants,
  spacing,
  borderRadius,
  animation,
  shadows,
};
