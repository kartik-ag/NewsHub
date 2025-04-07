# NewsHub - Personalized News Digest

A personalized news digest web application with AI-powered summaries and sentiment analysis, built with modern web technologies.

## Features

- **User Authentication**: Secure authentication with email verification using Nhost
- **Personalized News Feed**: Curated news based on user preferences (topics, keywords, sources)
- **AI Summaries**: Concise article summaries powered by OpenRouter AI
- **Sentiment Analysis**: Understand the tone and perspective of each article
- **Responsive Design**: Modern UI built with Next.js and Tailwind CSS
- **Automated Workflow**: n8n integration for fetching and processing news articles

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) with [Bolt.new](https://bolt.new)
- **Backend**: [Nhost](https://nhost.io/) (BaaS with Hasura GraphQL and PostgreSQL)
- **Authentication**: Nhost Auth with email verification
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Headless UI](https://headlessui.com/) for accessible components
- **Icons**: [Heroicons](https://heroicons.com/)
- **Workflow Automation**: [n8n](https://n8n.io/) for news fetching and processing
- **AI Services**: [OpenRouter](https://openrouter.ai/) for article summarization and sentiment analysis

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Nhost account
- n8n account
- OpenRouter API key
- News API key (or another news data source)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd newshub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file at the root of the project with your Nhost configuration:
   ```
   NEXT_PUBLIC_NHOST_SUBDOMAIN=your-nhost-subdomain
   NEXT_PUBLIC_NHOST_REGION=your-nhost-region
   ```

4. Set up your Nhost project:
   - Create a new project in the Nhost dashboard
   - Import the database schema from `nhost/schema.sql`
   - Configure authentication settings to require email verification

5. Set up your n8n workflow:
   - Create a new n8n workflow
   - Import the workflow configuration from `n8n-workflow.json`
   - Update the API keys and endpoints as needed

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) to see the application

## Project Structure

```
newshub/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── auth/             # Authentication pages
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Signup page
│   │   ├── dashboard/        # Protected dashboard pages
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   └── utils/                # Utility functions
├── nhost/                    # Nhost configuration
│   └── schema.sql            # Database schema
├── n8n-workflow.json         # n8n workflow configuration
└── public/                   # Static assets
```

## Authentication Flow

1. User signs up with email and password
2. Email verification is required before login
3. Only verified users can access protected routes
4. Auth token is passed with every Hasura Action

## Database Schema

- `user_preferences`: Stores user's news preferences
- `news_articles`: Stores fetched and processed news articles
- `saved_articles`: Links users to their saved articles
- `article_comments`: Stores user comments on articles
- `n8n_workflow_results`: Stores results from n8n workflows

## n8n Workflow

The n8n workflow performs the following steps:
1. Periodically fetches news articles from a news API
2. Processes each article using OpenRouter AI:
   - Generates concise summaries
   - Performs sentiment analysis
3. Formats the data and stores it in the Nhost database

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting platform (Vercel, Netlify, etc.)

3. Make sure to set the environment variables in your hosting platform

## License

This project is licensed under the MIT License - see the LICENSE file for details.
