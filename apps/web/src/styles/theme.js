/**
 * Bellyfed Design System - Modern Minimalist Edition
 *
 * This file contains the core design tokens and variables used throughout the application.
 * It establishes a sophisticated, contemporary visual language for the Bellyfed food discovery platform.
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary colors - Warm orange-peach
    primary: {
      50: '#FFF8F5',
      100: '#FFF0E9',
      200: '#FFE1D3',
      300: '#FFD2BD',
      400: '#FFC3A7',
      500: '#FF9A70', // Main primary color
      600: '#FF8552',
      700: '#FF6E33',
      800: '#FF5714',
      900: '#F54000',
    },

    // Secondary colors - Deeper peach-coral
    secondary: {
      50: '#FFF4F0',
      100: '#FFE9E1',
      200: '#FFD3C3',
      300: '#FFBDA5',
      400: '#FFA787',
      500: '#FF8C69', // Main secondary color
      600: '#FF7347',
      700: '#FF5A25',
      800: '#FF4103',
      900: '#E53700',
    },

    // Accent colors
    accent: {
      // Golden yellow
      gold: {
        50: '#FFFDF5',
        100: '#FFFAEB',
        200: '#FFF5D6',
        300: '#FFEFB8',
        400: '#FFE99A',
        500: '#FFE07C', // Main gold accent
        600: '#FFD44D',
        700: '#FFC91F',
        800: '#F0B800',
        900: '#CC9A00',
      },
      // Soft teal - complementary to orange
      teal: {
        50: '#F0FAFA',
        100: '#E0F5F5',
        200: '#C1EBEB',
        300: '#A3E0E0',
        400: '#84D6D6',
        500: '#66CCCC', // Main teal accent
        600: '#4DB8B8',
        700: '#339999',
        800: '#1A7A7A',
        900: '#005C5C',
      },
      // Soft purple
      purple: {
        50: '#F9F5FF',
        100: '#F3EBFF',
        200: '#E7D7FF',
        300: '#D6BDFF',
        400: '#C4A3FF',
        500: '#B388FF', // Main purple accent
        600: '#9F6DFF',
        700: '#8B52FF',
        800: '#7738FF',
        900: '#631DFF',
      },
    },

    // Neutral colors - Warmer, more sophisticated grays
    neutral: {
      white: '#FFFFFF',
      background: '#FAFAF8', // Slightly warmer background
      50: '#F7F7F5',
      100: '#EEEEE9',
      200: '#E0E0D9',
      300: '#D2D2C9',
      400: '#C4C4B9',
      500: '#AEAEA0',
      600: '#8E8E7D',
      700: '#6E6E5A',
      800: '#4E4E3A', // Main text color
      900: '#2E2E1A',
      black: '#1A1A0A',
    },

    // Semantic colors - More refined
    semantic: {
      success: '#4CAF50', // Vibrant green
      warning: '#FFB74D', // Warm amber
      error: '#FF5252',   // Bright red
      info: '#29B6F6',    // Bright blue
    },

    // Special purpose colors
    special: {
      premium: '#FFD700',    // Bright gold
      verified: '#4CAF50',   // Verified restaurants
      new: '#29B6F6',        // New items
      popular: '#FF8C69',    // Popular items
      featured: '#B388FF',   // Featured content
      ranking: '#FF6E33',    // Ranking board
    },

    // Gradients
    gradients: {
      primaryToSecondary: 'linear-gradient(135deg, #FF9A70 0%, #FF8C69 100%)',
      secondaryToAccent: 'linear-gradient(135deg, #FF8C69 0%, #FFE07C 100%)',
      accentToPrimary: 'linear-gradient(135deg, #FFE07C 0%, #FF9A70 100%)',
      neutralGradient: 'linear-gradient(135deg, #FAFAF8 0%, #EEEEE9 100%)',
      rankingGradient: 'linear-gradient(135deg, #FF8552 0%, #FF5714 100%)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      heading: '"Fraunces", Georgia, serif', // More distinctive serif for headings
      body: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', // Clean, modern sans-serif
      accent: '"Caveat", cursive', // Playful script font for accents
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    lineHeight: {
      none: 1,
      tight: 1.2,
      snug: 1.35,
      normal: 1.5,
      relaxed: 1.625,
      loose: 1.8,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Spacing system (based on more refined 4px scale)
  spacing: {
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
  },

  // Border radius - More refined with subtle rounding
  borderRadius: {
    none: '0',
    xs: '0.125rem',    // 2px
    sm: '0.25rem',     // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    pill: '9999px',    // Pill shape
  },

  // Shadows - More subtle and sophisticated
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.03), 0 4px 6px rgba(0, 0, 0, 0.02)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.03), 0 10px 10px rgba(0, 0, 0, 0.02)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
    // Colored shadows
    primary: '0 4px 14px rgba(105, 155, 115, 0.25)',
    secondary: '0 4px 14px rgba(230, 145, 125, 0.25)',
  },

  // Z-index
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    auto: 'auto',
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },

  // Transitions - More refined with custom easings
  transitions: {
    default: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Custom easings
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      smooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
    },
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Layout
  layout: {
    containerPadding: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '3rem',
    },
    sectionSpacing: {
      xs: '2rem',
      sm: '3rem',
      md: '4rem',
      lg: '5rem',
      xl: '6rem',
    },
  },
};

export default theme;
