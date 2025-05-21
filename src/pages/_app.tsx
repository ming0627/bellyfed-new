import type { AppProps } from 'next/app';
import { TRPCProvider } from '../utils/trpc-provider.js';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TRPCProvider>
      <Component {...pageProps} />
    </TRPCProvider>
  );
}
