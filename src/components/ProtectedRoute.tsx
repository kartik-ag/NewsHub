'use client';

import { useEffect, useState } from 'react';
import { useAuthenticationStatus } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';
import { isEmailVerified } from '@/utils/nhost';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProtectedRoute({ 
  children 
}: { 
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkVerification = async () => {
      if (isAuthenticated) {
        const verified = await isEmailVerified();
        setIsVerified(verified);
        
        if (!verified) {
          router.push('/auth/login');
        }
      } else if (!isLoading) {
        router.push('/auth/login');
      }
    };

    checkVerification();
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isVerified === null) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !isVerified) {
    return null;
  }

  return <>{children}</>;
} 