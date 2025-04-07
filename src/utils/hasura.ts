// Helper functions for Hasura admin operations

/**
 * Makes a GraphQL request to the Hasura API with admin privileges
 * To be used only for server-side operations that require admin access
 */
export const adminGraphQLRequest = async (
  query: string,
  variables: Record<string, any> = {}
) => {
  const adminSecret = process.env.HASURA_ADMIN_SECRET;
  
  if (!adminSecret) {
    throw new Error('HASURA_ADMIN_SECRET not found in environment variables');
  }
  
  const endpoint = `https://${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}.hasura.${process.env.NEXT_PUBLIC_NHOST_REGION}.nhost.run/v1/graphql`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': adminSecret,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed: ${errorText}`);
  }
  
  return response.json();
};

/**
 * IMPORTANT: Only use this on server-side code, never in client components
 * This should be used in Nhost serverless functions or API routes
 */ 