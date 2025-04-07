'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { getAuthToken } from '@/utils/nhost';
import { updateUserPreferences } from '@/utils/actions';
import { useDarkMode } from '@/context/DarkModeContext';

type NewsPreferences = {
  topics: string[];
  keywords: string[];
  sources: string[];
};

type NewsPreferencesFormProps = {
  preferences: NewsPreferences;
  setPreferences: (preferences: NewsPreferences) => void;
};

export default function NewsPreferencesForm({ preferences, setPreferences }: NewsPreferencesFormProps) {
  const { darkMode } = useDarkMode();
  const [newTopic, setNewTopic] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSource, setNewSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTopics = ['technology', 'business', 'sports', 'entertainment', 'health', 'science', 'politics', 'world'];
  const availableSources = ['bbc-news', 'cnn', 'the-verge', 'wired', 'the-wall-street-journal', 'the-guardian', 'reuters'];

  const addTopic = (topic: string) => {
    if (!topic) return;
    if (preferences.topics.includes(topic)) {
      toast.error('Topic already added');
      return;
    }
    setPreferences({
      ...preferences,
      topics: [...preferences.topics, topic],
    });
    setNewTopic('');
  };

  const removeTopic = (topic: string) => {
    setPreferences({
      ...preferences,
      topics: preferences.topics.filter((t) => t !== topic),
    });
  };

  const addKeyword = (keyword: string) => {
    if (!keyword) return;
    if (preferences.keywords.includes(keyword)) {
      toast.error('Keyword already added');
      return;
    }
    setPreferences({
      ...preferences,
      keywords: [...preferences.keywords, keyword],
    });
    setNewKeyword('');
  };

  const removeKeyword = (keyword: string) => {
    setPreferences({
      ...preferences,
      keywords: preferences.keywords.filter((k) => k !== keyword),
    });
  };

  const addSource = (source: string) => {
    if (!source) return;
    if (preferences.sources.includes(source)) {
      toast.error('Source already added');
      return;
    }
    setPreferences({
      ...preferences,
      sources: [...preferences.sources, source],
    });
    setNewSource('');
  };

  const removeSource = (source: string) => {
    setPreferences({
      ...preferences,
      sources: preferences.sources.filter((s) => s !== source),
    });
  };

  const savePreferences = async () => {
    setIsSubmitting(true);
    try {
      // Call the updateUserPreferences action to save preferences
      const result = await updateUserPreferences(preferences);
      
      if (result.success) {
        toast.success('Preferences saved successfully');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      
      // Show more specific error message if available
      const errorMessage = error.message || 'Failed to save preferences';
      
      // Handle common errors
      if (errorMessage.includes('Authentication required')) {
        toast.error('Authentication error. Please log in again.');
      } else if (errorMessage.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Topics */}
      <div>
        <label htmlFor="topics" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
          Topics of Interest
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.topics.map((topic) => (
            <div
              key={topic}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {topic}
              <button
                type="button"
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                onClick={() => removeTopic(topic)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <select
            id="topics"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="">Select a topic</option>
            {availableTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addTopic(newTopic)}
            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label htmlFor="keywords" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
          Keywords
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.keywords.map((keyword) => (
            <div
              key={keyword}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {keyword}
              <button
                type="button"
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                onClick={() => removeKeyword(keyword)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            id="keywords"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'
            }`}
            placeholder="Enter a keyword"
          />
          <button
            type="button"
            onClick={() => addKeyword(newKeyword)}
            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* Sources */}
      <div>
        <label htmlFor="sources" className={`block text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
          News Sources
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {preferences.sources.map((source) => (
            <div
              key={source}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {source}
              <button
                type="button"
                className="ml-1 text-indigo-600 hover:text-indigo-800"
                onClick={() => removeSource(source)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <select
            id="sources"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            className={`block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="">Select a source</option>
            {availableSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => addSource(newSource)}
            className="ml-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={savePreferences}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
} 