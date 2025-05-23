import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';
import { CountryProvider, AuthProvider } from '../contexts/index';
import { TRPCProvider } from '../utils/trpc-provider';
import AuthStateManagerWrapper from '../components/AuthStateManagerWrapper';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        <CountryProvider>
          <AuthProvider>
            <TRPCProvider>
              <AuthStateManagerWrapper>
                <Component {...pageProps} />
                <Toaster position="bottom-right" />
              </AuthStateManagerWrapper>
            </TRPCProvider>
          </AuthProvider>
        </CountryProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
