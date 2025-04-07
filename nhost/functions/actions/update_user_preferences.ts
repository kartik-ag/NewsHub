import { Request, Response } from 'express';
import { gql } from 'graphql-request';
import { hasuraClient } from '../utils/hasuraClient';

// Define the payload structure
interface ActionPayload {
  action: {
    name: string;
  };
  input: {
    preferences: {
      topics: string[];
      keywords: string[];
      sources: string[];
    };
  };
  session_variables: {
    'x-hasura-user-id': string;
  };
}

// Define the GraphQL mutation
const UPDATE_PREFERENCES = gql`
  mutation UpdateUserPreferences(
    $userId: uuid!, 
    $topics: jsonb!, 
    $keywords: jsonb!, 
    $sources: jsonb!
  ) {
    update_user_preferences(
      where: { user_id: { _eq: $userId } }, 
      _set: { 
        topics: $topics, 
        keywords: $keywords, 
        sources: $sources,
        updated_at: "now()"
      }
    ) {
      affected_rows
    }
  }
`;

export default async (req: Request, res: Response) => {
  try {
    // Parse the request body
    const payload = req.body as ActionPayload;
    const { preferences } = payload.input;
    const userId = payload.session_variables['x-hasura-user-id'];

    if (!userId) {
      return res.status(400).json({
        message: 'User ID not found in session variables',
      });
    }

    // Execute the GraphQL mutation
    const result = await hasuraClient.request(UPDATE_PREFERENCES, {
      userId,
      topics: JSON.stringify(preferences.topics),
      keywords: JSON.stringify(preferences.keywords),
      sources: JSON.stringify(preferences.sources),
    });

    // Check if any rows were affected
    const affectedRows = result.update_user_preferences?.affected_rows || 0;
    
    if (affectedRows > 0) {
      return res.json({
        success: true,
      });
    } else {
      // If no rows were affected, try to insert a new record
      const INSERT_PREFERENCES = gql`
        mutation InsertUserPreferences(
          $userId: uuid!, 
          $topics: jsonb!, 
          $keywords: jsonb!, 
          $sources: jsonb!
        ) {
          insert_user_preferences_one(
            object: {
              user_id: $userId, 
              topics: $topics, 
              keywords: $keywords, 
              sources: $sources
            }
          ) {
            id
          }
        }
      `;

      const insertResult = await hasuraClient.request(INSERT_PREFERENCES, {
        userId,
        topics: JSON.stringify(preferences.topics),
        keywords: JSON.stringify(preferences.keywords),
        sources: JSON.stringify(preferences.sources),
      });

      if (insertResult.insert_user_preferences_one) {
        return res.json({
          success: true,
        });
      } else {
        throw new Error('Failed to insert preferences');
      }
    }
  } catch (error: any) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({
      message: `Failed to update preferences: ${error.message}`,
    });
  }
} 