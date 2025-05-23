import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { CountryProvider } from '../contexts/CountryContext.js';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <CountryProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-right" />
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
