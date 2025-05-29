import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import React from 'react';
import Link from 'next/link';

import Head from 'next/head';

export default function XmlErrorPage(): JSX.Element {
  return (
    <>
      <Head>
        <title>XML Error - BellyFed</title>
        <meta name="description" content="XML error" />
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              XML Error
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              There was an issue processing the XML content. Please try again or
              contact support if the issue persists.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/" passHref>
                <Button>Go to Homepage</Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// This ensures the page is pre-rendered at build time
export async function getStaticProps(): Promise<any> {
  return {
    props: {},
  };
}
