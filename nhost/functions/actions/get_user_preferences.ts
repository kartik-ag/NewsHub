import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import { hasuraClient } from '../utils/hasuraClient';

// Define the payload structure
interface ActionPayload {
  action: {
    name: string;
  };
  input: Record<string, unknown>;
  session_variables: {
    'x-hasura-user-id': string;
  };
}

// Define the GraphQL query
const GET_PREFERENCES = gql`
  query GetUserPreferences($userId: uuid!) {
    user_preferences(where: { user_id: { _eq: $userId } }) {
      topics
      keywords
      sources
    }
  }
`;

export default async (req: Request, res: Response) => {
  try {
    // Parse the request body
    const payload = req.body as ActionPayload;
    const userId = payload.session_variables['x-hasura-user-id'];

    if (!userId) {
      return res.status(400).json({
        message: 'User ID not found in session variables',
      });
    }

    // Execute the GraphQL query
    const result = await hasuraClient.request(GET_PREFERENCES, {
      userId,
    });

    // Check if we got preferences back
    if (result.user_preferences && result.user_preferences.length > 0) {
      const userPrefs = result.user_preferences[0];
      
      // Parse JSON fields if they're stored as strings
      const preferences = {
        topics: typeof userPrefs.topics === 'string' ? JSON.parse(userPrefs.topics) : userPrefs.topics,
        keywords: typeof userPrefs.keywords === 'string' ? JSON.parse(userPrefs.keywords) : userPrefs.keywords,
        sources: typeof userPrefs.sources === 'string' ? JSON.parse(userPrefs.sources) : userPrefs.sources,
      };

      return res.json({
        preferences,
      });
    } else {
      // Return default preferences if none found
      return res.json({
        preferences: {
          topics: [],
          keywords: [],
          sources: [],
        },
      });
    }
  } catch (error: any) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({
      message: `Failed to fetch preferences: ${error.message}`,
    });
  }
} 