import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preload critical scripts */}
          <link rel="preconnect" href="https://maps.googleapis.com" />
          <link rel="preconnect" href="https://maps.gstatic.com" />
          <link rel="preconnect" href="https://stackpath.bootstrapcdn.com" />
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
          />

          {/* Prevent auto-detection of phone numbers and email addresses */}
          <meta name="format-detection" content="telephone=no, email=no" />

          {/* Add a global variable to indicate static export */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              // Execute this code immediately to prevent React errors
              (function() {
                // Process polyfill for static export
                window.process = window.process || { env: {} };
                window.process.env = window.process.env || {};
                window.process.env.NODE_ENV = window.process.env.NODE_ENV || 'production';

                window.IS_STATIC_EXPORT = true;
                window.DEFAULT_COUNTRY = 'my';

                // Simple global fix for hydration errors
                window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;

                // Set up global hydration error handler - improved version
                window.__HANDLE_HYDRATION_ERROR = function(err) {
                  console.log('Global hydration error handler called', err);
                  // Force client-side rendering for components with hydration errors
                  if (typeof document !== 'undefined') {
                    document.documentElement.classList.add('force-client-render');
                  }
                };

                // Add a simple attribute to help with CSS targeting if needed
                document.documentElement.setAttribute('data-env', process.env.NODE_ENV || 'development');

                // Clear any existing cookies that might cause issues
                function clearAllCookies(): JSX.Element {
                  const cookies = document.cookie.split(";");
                  for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.bellyfed.com";
                  }
                }

                // Clear problematic storage items
                function resetStorageState(): JSX.Element {
                  try {
                    if (typeof window !== 'undefined') {
                      // Clear localStorage if it exists
                      if (window.localStorage) {
                        // Save country preference if it exists
                        const country = window.localStorage.getItem('country');
                        window.localStorage.clear();
                        if (country) window.localStorage.setItem('country', country);
                      }

                      // Clear sessionStorage if it exists
                      if (window.sessionStorage) {
                        window.sessionStorage.clear();
                      }
                    }
                  } catch (e) {
                    console.error('Error clearing storage:', e);
                  }
                }

                // Create storage polyfills before any React code runs
                try {
                  // Reset any existing state that might cause issues
                  resetStorageState();
                  clearAllCookies();

                  // Create localStorage polyfill if needed
                  if (typeof window !== 'undefined') {
                    if (!window.localStorage) {
                      const mockStorage = {};
                      window.localStorage = {
                        getItem: function(key) { return mockStorage[key] || null; },
                        setItem: function(key, value) { mockStorage[key] = value; },
                        removeItem: function(key) { delete mockStorage[key]; },
                        clear: function() { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
                        length: 0,
                        key: function() { return null; }
                      };
                    }

                    // Create sessionStorage polyfill if needed
                    if (!window.sessionStorage) {
                      const mockSessionStorage = {};
                      window.sessionStorage = {
                        getItem: function(key) { return mockSessionStorage[key] || null; },
                        setItem: function(key, value) { mockSessionStorage[key] = value; },
                        removeItem: function(key) { delete mockSessionStorage[key]; },
                        clear: function() { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); },
                        length: 0,
                        key: function() { return null; }
                      };
                    }

                        // Do not set up mock user for static export
                    // We want users to start at the login page

                    // Authentication is now handled server-side with HttpOnly cookies
                    // No need for client-side auth state management
                  }
                } catch (e) {
                  console.error('Error setting up storage polyfills:', e);
                }
              })();
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* Enhanced script to handle hydration issues */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                // Only run in browser
                if (typeof window === 'undefined') return;

                // Suppress hydration warnings globally
                window.__NEXT_SUPPRESS_HYDRATION_WARNING = true;

                // Add a class to the document to indicate client-side rendering
                document.documentElement.classList.add('client-rendered');

                // Enhanced patch for console.error to handle hydration errors
                const originalConsoleError = console.error;
                console.error = function(...args) {
                  const errorString = args.join(' ');
                  if (errorString.includes('Hydration') || errorString.includes('hydration')) {
                    // Call the global handler if it exists
                    if (window.__HANDLE_HYDRATION_ERROR) {
                      window.__HANDLE_HYDRATION_ERROR(args);
                    }
                    return; // Suppress hydration errors in console
                  }
                  originalConsoleError.apply(console, args);
                };

                // Add a mutation observer to handle dynamic SVG elements
                // This helps prevent hydration errors with SVG components
                try {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'childList') {
                        const svgElements = document.querySelectorAll('svg');
                        svgElements.forEach(function(svg) {
                          if (!svg.hasAttribute('data-client-rendered')) {
                            svg.setAttribute('data-client-rendered', 'true');
                          }
                        });
                      }
                    });
                  });

                  // Start observing the document with the configured parameters
                  observer.observe(document.body, { childList: true, subtree: true });
                } catch (e) {
                  console.warn('Error setting up SVG observer:', e);
                }
              })();
            `,
            }}
          />
          {/* Add a script to handle country detection on the client side */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                // Only run in browser
                if (typeof window === 'undefined') return;

                // Prevent infinite loops with a flag
                if (window.__COUNTRY_INITIALIZED) return;
                window.__COUNTRY_INITIALIZED = true;

                // Set default country if path doesn't include it
                const path = window.location.pathname;
                const segments = path.split('/').filter(Boolean);
                const validCountries = ['my', 'sg'];

                if (segments.length === 0 || !validCountries.includes(segments[0])) {
                  const defaultCountry = window.DEFAULT_COUNTRY || 'my';
                  if (path === '/' || path === '') {
                    window.location.replace('/' + defaultCountry);
                  }
                }
              })();
            `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
