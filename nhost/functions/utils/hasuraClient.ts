import { GraphQLClient } from 'graphql-request';

// Nhost function environment variables are automatically available
const hasuraUrl = process.env.HASURA_GRAPHQL_GRAPHQL_URL || 'http://localhost:8080/v1/graphql';
const adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

// Create a GraphQL client with admin privileges
export const hasuraClient = new GraphQLClient(hasuraUrl, {
  headers: {
    'x-hasura-admin-secret': adminSecret,
  },
}); 