# NutriFlow - Base Mini App

A subscription-based platform offering hyper-personalized diet plans and meal prep guidance, tailored to individual users' bodies and goals.

## Features

### Core Functionality
- **Hyper-Personalized Diet Generation**: Science-backed diet plans based on user data
- **Recipe & Meal Prep Integration**: Curated recipes with meal prep guidance
- **Nutritional Progress Tracking**: Comprehensive progress monitoring and visualization

### Key Components
- User profile management with dietary preferences
- Health goals tracking with progress visualization
- Daily meal planning and logging
- Interactive progress charts (weight, calories, adherence)
- Nutrition statistics with macro tracking
- Quick action buttons for common tasks
- Subscription management with tiered plans

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Blockchain**: Base network integration via OnchainKit
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **TypeScript**: Full type safety throughout

## Design System

### Colors
- Background: `hsl(220, 20%, 95%)`
- Accent: `hsl(160, 70%, 45%)`
- Primary: `hsl(210, 80%, 50%)`
- Surface: `hsl(0, 0%, 100%)`

### Layout
- 12-column fluid grid with 16px gutters
- Max container width: 4xl with 16px padding
- Responsive breakpoints for mobile-first design

### Components
- Glass card effects with backdrop blur
- Gradient backgrounds and buttons
- Smooth animations with cubic-bezier easing
- Progress bars and interactive charts

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with:
```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main dashboard page
│   ├── loading.tsx        # Loading UI
│   ├── error.tsx          # Error boundary
│   ├── globals.css        # Global styles
│   └── providers.tsx      # MiniKit provider setup
├── components/            # Reusable UI components
│   ├── UserProfileCard.tsx
│   ├── HealthGoalsCard.tsx
│   ├── TodaysMealsCard.tsx
│   ├── ProgressChart.tsx
│   ├── NutritionStatsCard.tsx
│   ├── QuickActionsCard.tsx
│   └── SubscriptionCard.tsx
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
└── public/               # Static assets
```

## API Integration Ready

The app is structured to integrate with:
- **Edamam Meal Planner API**: For personalized meal plans and recipes
- **OpenAI API**: For AI-powered nutrition insights
- **Supabase**: For user data and progress storage
- **Stripe**: For subscription management

## Subscription Model

- **Free Plan**: Basic meal logging and simple progress tracking
- **Basic Plan ($9/month)**: Personalized meal plans and advanced tracking
- **Premium Plan ($19/month)**: AI-powered recommendations and community access

## Mobile-First Design

Fully responsive design optimized for mobile devices with:
- Touch-friendly interface elements
- Optimized card layouts for small screens
- Smooth animations and transitions
- Accessible color contrasts and typography

## Base Mini App Features

- MiniKit integration for seamless Base network interaction
- Frame-ready architecture for social sharing
- Wallet connection with OnchainKit components
- Optimized for Farcaster frame embedding
