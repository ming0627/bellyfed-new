/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors - Vibrant orange-peach with improved contrast
        primary: {
          50: '#FFF8F2',
          100: '#FFF0E6',
          200: '#FFE1CC',
          300: '#FFD2B3',
          400: '#FFC399',
          500: '#FF9966', // Main primary color - more vibrant with better contrast
          600: '#FF8033',
          700: '#FF6600',
          800: '#E65C00',
          900: '#CC5200',
        },

        // Secondary colors - Deeper peach-coral with better contrast
        secondary: {
          50: '#FFF5F0',
          100: '#FFEBE0',
          200: '#FFD7C2',
          300: '#FFC3A3',
          400: '#FFAF85',
          500: '#FF9B66', // Main secondary color - better contrast
          600: '#FF8742',
          700: '#FF731F',
          800: '#F26000',
          900: '#D95400',
        },

        // Accent colors
        accent: {
          // Bright golden yellow with better contrast
          gold: {
            50: '#FFFDF5',
            100: '#FFFAEB',
            200: '#FFF5D6',
            300: '#FFEFB8',
            400: '#FFE99A',
            500: '#FFD44D', // Main gold accent - better contrast
            600: '#FFCC1A',
            700: '#E6B800',
            800: '#CC9900',
            900: '#B38600',
          },
          // Bright teal - complementary to orange with better contrast
          teal: {
            50: '#F0FAFA',
            100: '#E0F5F5',
            200: '#C1EBEB',
            300: '#A3E0E0',
            400: '#84D6D6',
            500: '#4DB8B8', // Main teal accent - better contrast
            600: '#339999',
            700: '#267373',
            800: '#1A4D4D',
            900: '#0D2626',
          },
          // Bright coral with better contrast
          coral: {
            50: '#FFF5F2',
            100: '#FFEBE5',
            200: '#FFD6CC',
            300: '#FFC2B2',
            400: '#FFAD99',
            500: '#FF8566', // Main coral accent - better contrast
            600: '#FF6B47',
            700: '#FF5128',
            800: '#F93A0A',
            900: '#DA3000',
          },
        },

        // Neutral colors - Improved contrast for better readability
        neutral: {
          white: '#FFFFFF',
          background: '#FFFAF5', // Warmer background with peach tint
          50: '#F9F7F5',
          100: '#F2EFE9',
          200: '#E6E2D9',
          300: '#D9D4C9',
          400: '#C0B8A6',
          500: '#A69E8C',
          600: '#8C8273',
          700: '#736A5F',
          800: '#59524A', // Darker text color for better contrast
          900: '#403A34',
          black: '#262220',
        },

        // Semantic colors - Improved contrast for accessibility
        success: '#36B37E', // Green with better contrast (WCAG AA compliant)
        warning: '#FFAB00', // Amber with better contrast (WCAG AA compliant)
        error: '#E53935', // Red with better contrast (WCAG AA compliant)
        info: '#2196F3', // Blue with better contrast (WCAG AA compliant)

        // Special purpose colors - Aligned with orange-peach theme with better contrast
        premium: '#FFB700', // Gold with better contrast
        verified: '#36B37E', // Green with better contrast for verified
        new: '#2196F3', // Blue with better contrast for new items
        popular: '#FF8033', // Peach with better contrast for popular
        featured: '#FF6B47', // Coral with better contrast for featured
        ranking: '#FF6600', // Orange with better contrast for ranking board
      },

      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        accent: ['Caveat', 'cursive'],
      },

      fontSize: {
        xs: '0.75rem', // 12px
        sm: '0.875rem', // 14px
        base: '1rem', // 16px
        lg: '1.125rem', // 18px
        xl: '1.25rem', // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem', // 36px
        '5xl': '3rem', // 48px
        '6xl': '3.75rem', // 60px
      },

      lineHeight: {
        none: '1',
        tight: '1.2',
        snug: '1.35',
        normal: '1.5',
        relaxed: '1.625',
        loose: '1.8',
      },

      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },

      spacing: {
        0.5: '0.125rem', // 2px
        1: '0.25rem', // 4px
        1.5: '0.375rem', // 6px
        2: '0.5rem', // 8px
        2.5: '0.625rem', // 10px
        3: '0.75rem', // 12px
        3.5: '0.875rem', // 14px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        7: '1.75rem', // 28px
        8: '2rem', // 32px
        9: '2.25rem', // 36px
        10: '2.5rem', // 40px
        12: '3rem', // 48px
        14: '3.5rem', // 56px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        28: '7rem', // 112px
        32: '8rem', // 128px
      },

      borderRadius: {
        none: '0',
        xs: '0.125rem', // 2px
        sm: '0.25rem', // 4px
        DEFAULT: '0.375rem', // 6px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        xl: '1rem', // 16px
        '2xl': '1.5rem', // 24px
        pill: '9999px', // Pill shape
      },

      boxShadow: {
        xs: '0 1px 2px rgba(255, 153, 102, 0.05)',
        sm: '0 1px 3px rgba(255, 153, 102, 0.08)',
        DEFAULT:
          '0 4px 6px rgba(255, 153, 102, 0.06), 0 1px 3px rgba(255, 153, 102, 0.04)',
        md: '0 10px 15px rgba(255, 153, 102, 0.05), 0 4px 6px rgba(255, 153, 102, 0.03)',
        lg: '0 20px 25px rgba(255, 153, 102, 0.05), 0 10px 10px rgba(255, 153, 102, 0.03)',
        xl: '0 25px 50px rgba(255, 153, 102, 0.06)',
        inner: 'inset 0 2px 4px rgba(255, 153, 102, 0.05)',
        none: 'none',
        primary: '0 4px 14px rgba(255, 153, 102, 0.25)',
        secondary: '0 4px 14px rgba(255, 155, 102, 0.25)',
        coral: '0 4px 14px rgba(255, 133, 102, 0.25)',
        hover: '0 6px 20px rgba(255, 153, 102, 0.15)',
        card: '0 8px 24px rgba(255, 153, 102, 0.12)',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        smooth: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      transitionDuration: {
        DEFAULT: '250ms',
        fast: '150ms',
        slow: '400ms',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-subtle': 'pulseSubtle 3s infinite',
        'scale-subtle': 'scaleSubtle 0.3s ease-out',
        'glow-subtle': 'glowSubtle 2s infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'rank-change': 'rankChange 0.5s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0.7' },
          '50%': { transform: 'translateY(-5px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0.7' },
          '50%': { transform: 'translateY(5px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scaleSubtle: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        glowSubtle: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 153, 102, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 153, 102, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        rankChange: {
          '0%': {
            backgroundColor: 'rgba(255, 153, 102, 0.1)',
            transform: 'translateX(0)',
          },
          '25%': {
            backgroundColor: 'rgba(255, 153, 102, 0.2)',
            transform: 'translateX(5px)',
          },
          '50%': {
            backgroundColor: 'rgba(255, 153, 102, 0.3)',
            transform: 'translateX(-5px)',
          },
          '75%': {
            backgroundColor: 'rgba(255, 153, 102, 0.2)',
            transform: 'translateX(5px)',
          },
          '100%': {
            backgroundColor: 'rgba(255, 153, 102, 0)',
            transform: 'translateX(0)',
          },
        },
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF9966 0%, #FF8033 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #FF9B66 0%, #FFD44D 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFD44D 0%, #FF9966 100%)',
        'gradient-neutral': 'linear-gradient(135deg, #FFFAF5 0%, #F2EFE9 100%)',
        'gradient-ranking': 'linear-gradient(135deg, #FF8033 0%, #FF6600 100%)',
        'gradient-coral': 'linear-gradient(135deg, #FF8566 0%, #FF5128 100%)',
        'gradient-dishes': 'linear-gradient(135deg, #FF9966 0%, #FF8033 100%)',
        'gradient-reviewers':
          'linear-gradient(135deg, #FF9B66 0%, #FF8742 100%)',
        'gradient-restaurants':
          'linear-gradient(135deg, #FF8566 0%, #FF6B47 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
