# 🥗 NutriFlow - Personalized Nutrition Platform

**Your personalized nutrition mapped out, effortlessly.**

NutriFlow is a subscription-based platform offering hyper-personalized diet plans and meal prep guidance, tailored to individual users' bodies and goals. Built as a Next.js Base Mini App with comprehensive backend services and modern UI/UX.

## 🌟 Features

### Core Features
- **🎯 Hyper-Personalized Diet Generation**: Science-backed diet plans tailored to unique physiology, preferences, and health goals
- **🍳 Recipe & Meal Prep Integration**: Curated recipes with clear instructions and practical meal prep guidance
- **📊 Nutritional Progress Tracking**: Visualize progress over time and see how diet impacts health goals

### Technical Features
- **🔐 Secure Authentication**: User authentication via Supabase
- **💳 Subscription Management**: Stripe integration for payment processing
- **🤖 AI-Powered Insights**: OpenAI integration for personalized recommendations
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **⚡ Real-time Updates**: Live data synchronization
- **🔍 Recipe Search**: Edamam API integration for nutrition data

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15.3.3, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Nutrition Data**: Edamam API
- **Deployment**: Vercel

### Project Structure
```
├── app/
│   ├── api/                    # API routes
│   │   ├── users/             # User management
│   │   ├── diet-plans/        # Diet plan generation
│   │   ├── progress/          # Progress tracking
│   │   ├── subscriptions/     # Subscription management
│   │   └── webhooks/          # Stripe webhooks
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── UserOnboardingForm.tsx # Multi-step onboarding
│   ├── DashboardView.tsx      # Main dashboard
│   ├── UserProfileCard.tsx    # User profile display
│   ├── HealthGoalsCard.tsx    # Health goals tracking
│   ├── TodaysMealsCard.tsx    # Daily meal planning
│   ├── ProgressChart.tsx      # Progress visualization
│   ├── NutritionStatsCard.tsx # Nutrition statistics
│   ├── QuickActionsCard.tsx   # Quick action buttons
│   └── SubscriptionCard.tsx   # Subscription management
├── lib/
│   ├── services/              # Service layer
│   │   ├── database.ts        # Database operations
│   │   ├── edamam.ts          # Nutrition API
│   │   ├── openai.ts          # AI services
│   │   └── stripe.ts          # Payment processing
│   ├── types.ts               # TypeScript definitions
│   └── utils.ts               # Utility functions
├── supabase/
│   └── migrations/            # Database migrations
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Stripe account
- OpenAI API key
- Edamam API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutriflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Edamam API Configuration
   EDAMAM_APP_ID=your_edamam_app_id
   EDAMAM_APP_KEY=your_edamam_app_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_BASIC_PRICE_ID=price_basic_monthly
   STRIPE_PREMIUM_PRICE_ID=price_premium_monthly

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Run the database migrations
   npx supabase db push
   ```

5. **Configure Stripe**
   - Create products and prices in your Stripe dashboard
   - Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Add webhook events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `checkout.session.completed`

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Tables
- **users**: User profiles and preferences
- **diet_plans**: Generated nutrition plans
- **meals**: Individual meal entries
- **recipes**: Recipe database with nutrition info
- **progress_logs**: User progress tracking

### Key Relationships
- Users have many diet plans and progress logs
- Diet plans contain multiple meals
- Meals reference recipes for detailed information

## 🔌 API Endpoints

### User Management
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user profile
- `PUT /api/users/[id]` - Update user profile

### Diet Plans
- `GET /api/diet-plans` - Get user's diet plans
- `POST /api/diet-plans` - Generate new diet plan

### Progress Tracking
- `GET /api/progress` - Get progress data
- `POST /api/progress` - Log progress entry

### Subscriptions
- `GET /api/subscriptions` - Get subscription info
- `POST /api/subscriptions` - Create checkout session
- `PUT /api/subscriptions` - Manage subscription

## 💳 Subscription Tiers

### Free Tier ($0/month)
- Basic meal logging
- Simple progress tracking
- Limited recipe access

### Basic Tier ($9/month)
- Personalized diet plans
- Advanced meal logging
- Progress analytics
- Recipe recommendations
- Email support

### Premium Tier ($19/month)
- AI-powered meal planning
- Advanced progress tracking
- Unlimited recipe access
- Community access
- Priority support
- Custom meal prep guides
- Nutritionist consultations

## 🎨 Design System

### Colors
- **Background**: `hsl(220, 20%, 95%)`
- **Accent**: `hsl(160, 70%, 45%)`
- **Primary**: `hsl(210, 80%, 50%)`
- **Surface**: `hsl(0,0%,100%)`

### Typography
- **Body**: `text-base font-normal leading-7`
- **Display**: `text-4xl font-bold`

### Components
- Responsive grid system (12-col fluid, 16px gutter)
- Consistent spacing and border radius
- Smooth animations with cubic-bezier easing

## 🔒 Security Features

- Row Level Security (RLS) in Supabase
- Secure API key management
- Input validation with Zod schemas
- CSRF protection
- Secure webhook verification

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup
- Configure production environment variables
- Set up Stripe webhook endpoints
- Configure Supabase production settings

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring & Analytics

- Error tracking and logging
- Performance monitoring
- User analytics
- Subscription metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@nutriflow.com or join our community Discord.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for backend services
- [Stripe](https://stripe.com/) for payment processing
- [OpenAI](https://openai.com/) for AI capabilities
- [Edamam](https://www.edamam.com/) for nutrition data
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Built with ❤️ for better nutrition and healthier lives.**

