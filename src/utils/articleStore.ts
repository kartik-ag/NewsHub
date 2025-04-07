// In-memory storage for saved articles in development
// In production, you would use a database

export type SavedArticle = {
  id: string; // This is the saved_id
  articleId: string;
  userId: string;
  createdAt: string;
};

// Shared storage that persists across API calls
const articleStore = {
  savedArticles: [] as SavedArticle[],
};

export default articleStore; 