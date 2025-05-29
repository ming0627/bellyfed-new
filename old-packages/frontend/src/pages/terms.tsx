import { Button } from '@/components/ui/button';
import { NextPage } from 'next';

import React from 'react';

import Head from 'next/head';
import Link from 'next/link';

import TermsOfServiceContent from '@/components/TermsOfServiceContent';

const TermsOfServicePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - BellyFed</title>
        <meta name="description" content="BellyFed Terms of Service" />
      </Head>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <Link href="/" passHref>
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          <div className="prose max-w-none">
            <TermsOfServiceContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;
