/** @type {import('next').NextConfig} */
/* eslint-disable */
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bundleAnalyzer from '@next/bundle-analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'].filter(
    (ext) => !ext.includes('test'),
  ),
  reactStrictMode: true,
  images: {
    domains: [
      'bellyfed-assets.s3.ap-southeast-1.amazonaws.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'ui-avatars.com',
      'maps.googleapis.com',
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Enable TypeScript and ESLint error checking during build
  // This ensures code quality and type safety
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    // We're using the flat config format (eslint.config.mjs)
    // Next.js 15 has a different ESLint configuration approach
    ignoreDuringBuilds: true,
  },

  // Disable experimental features for better compatibility
  experimental: {},

  webpack: (config, { dev, isServer }) => {
    // Add alias for @/ to point to src/
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    // Fix "self is not defined" error
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Add support for TypeScript enums
    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
              isolatedModules: true,
            },
          },
        },
      ],
    });

    return config;
  },

  // Configure output for production builds
  output: 'standalone',

  // Ensure proper error handling
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default withBundleAnalyzer(nextConfig);
