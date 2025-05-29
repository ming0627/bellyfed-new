import { Clock, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
// Import removed to avoid type conflicts

// Define the Certificate interface locally to avoid namespace conflicts
interface Certificate {
  id: string;
  name: string;
  issuingAuthority: string;
  description?: string;
  expiryDate?: string;
  type?: string;
  status?: string;
  image?: string;
  [key: string]: any;
}

const DEFAULT_IMAGE =
  'https://bellyfed-assets.s3.ap-southeast-1.amazonaws.com/restaurants/bellyfed.png';

interface CertificateCardProps {
  certificate: Certificate;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => (
  <Card className="flex flex-col">
    <CardHeader className="flex-row items-center gap-4">
      <div className="relative h-16 w-16">
        <Image
          alt={certificate.name}
          className="rounded-lg object-cover"
          fill
          src={certificate.image || DEFAULT_IMAGE}
        />
      </div>
      <div className="space-y-1">
        <CardTitle className="text-base">
          {certificate.name}
          <Badge
            variant={
              certificate.status === 'ACTIVE' ? 'default' : 'destructive'
            }
            className="ml-2"
          >
            {certificate.status}
          </Badge>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {certificate.issuingAuthority}
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-sm text-muted-foreground mb-2">
        {certificate.description}
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Valid until:{' '}
          {new Date(certificate.expiryDate || '').toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4" />
          {certificate.type}
        </div>
      </div>
    </CardContent>
  </Card>
);

const CertificateCardSkeleton = () => (
  <Card className="flex flex-col">
    <CardHeader className="flex-row items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-lg" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </CardContent>
  </Card>
);

interface CertificatesSectionProps {
  certificates: Certificate[];
  isLoading?: boolean;
  error?: string;
}

export function CertificatesSection({
  certificates,
  isLoading,
  error,
}: CertificatesSectionProps): JSX.Element {
  if (error) {
    return (
      <div className="col-span-2 text-center py-8 text-red-500">
        Error loading certificates: {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <CertificateCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="col-span-2 text-center py-8 text-muted-foreground">
        No certificates available for this establishment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {certificates?.map((cert) => (
        <CertificateCard key={cert.id} certificate={cert} />
      ))}
    </div>
  );
}
