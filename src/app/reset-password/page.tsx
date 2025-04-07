'use client';

import { useSearchParams } from 'next/navigation';
import PasswordResetForm from '@/components/PasswordResetForm';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get ticket and hash from URL
  const ticket = searchParams?.get('ticket');
  const hash = searchParams?.get('hash');
  
  // If ticket and hash are present, render the password reset form
  // Otherwise, redirect to the request password reset page
  useEffect(() => {
    if (!ticket || !hash) {
      router.push('/auth/reset-password');
    }
  }, [ticket, hash, router]);

  // Only render the form if we have the required parameters
  if (!ticket || !hash) {
    return null; // Don't render anything while redirecting
  }

  return <PasswordResetForm />;
} 