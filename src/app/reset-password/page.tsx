import { Suspense } from 'react';
import ResetPasswordClient from './client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>}>
      <ResetPasswordClient />
    </Suspense>
  );
} 