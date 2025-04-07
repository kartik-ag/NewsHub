import { NhostClient } from '@nhost/nhost-js';

// Initialize Nhost client with environment variables
export const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'kjylbhmoyyflvttydrpo',
  region: process.env.NEXT_PUBLIC_NHOST_REGION || 'ap-south-1',
});

// Helper function to get the auth token
export const getAuthToken = async () => {
  const session = nhost.auth.getSession();
  return session?.accessToken;
};

// Helper function to check if the user's email is verified
export const isEmailVerified = async () => {
  const user = nhost.auth.getUser();
  return user?.emailVerified === true;
}; 