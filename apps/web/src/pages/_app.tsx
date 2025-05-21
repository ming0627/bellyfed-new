import type { AppProps } from 'next/app';
import { TRPCProvider } from '../utils/trpc-provider.js';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <TRPCProvider>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </TRPCProvider>
    </ThemeProvider>
  );
}
