# Local LLM Chat Application

A modern web application that allows users to interact with various Large Language Models (LLMs) locally in their browser. Built with Next.js, TypeScript, and TailwindCSS, this application provides a seamless chat interface with support for multiple LLM providers and features like code highlighting and markdown rendering.

Live Demo: https://local-llm-chat-ochre.vercel.app/

You may need to enable WebGPU explicitly to run it in your browser (chrome://flags/#enable-unsafe-webgpu)

## Features

- 🤖 Multiple LLM Support:
  - Local LLM inference using `@mlc-ai/web-llm`
  - Google's Generative AI integration
  - OpenAI API integration
- 💬 Modern Chat Interface
- 📝 Markdown Rendering with Code Highlighting
- ⚡ Built with Next.js 15 and React 19
- 🎨 UI with TailwindCSS and Radix UI

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- A Supabase account (for authentication)
- Google API Key (for Google's Generative AI)

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/local-llm-chat.git
   cd local-llm-chat
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables:
     ```
     GOOGLE_API_KEY=your_google_api_key
     ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Push your code to a GitHub repository.

2. Install the Vercel CLI (optional):

   ```bash
   npm install -g vercel
   ```

3. Deploy using one of these methods:

   **Method 1: Using Vercel Dashboard**

   1. Go to [Vercel](https://vercel.com)
   2. Import your GitHub repository
   3. Configure your environment variables in the Vercel dashboard
   4. Deploy!

   **Method 2: Using Vercel CLI**

   ```bash
   vercel
   ```

   Follow the prompts to deploy your application.

4. After deployment, Vercel will provide you with a URL where your application is live.

## Environment Variables

Make sure to set up the following environment variables in your Vercel deployment:

- `GOOGLE_API_KEY`
