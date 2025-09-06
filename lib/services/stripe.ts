import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic nutrition tracking',
    price: 0,
    interval: 'month',
    features: [
      'Basic meal logging',
      'Simple progress tracking',
      'Limited recipe access',
    ],
    stripePriceId: '', // No Stripe price for free plan
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Personalized nutrition plans',
    price: 9,
    interval: 'month',
    features: [
      'Personalized diet plans',
      'Advanced meal logging',
      'Progress analytics',
      'Recipe recommendations',
      'Email support',
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Complete nutrition coaching',
    price: 19,
    interval: 'month',
    features: [
      'AI-powered meal planning',
      'Advanced progress tracking',
      'Unlimited recipe access',
      'Community access',
      'Priority support',
      'Custom meal prep guides',
      'Nutritionist consultations',
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  },
];

class StripeService {
  private validateConfig() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not configured');
    }
  }

  async createCustomer(email: string, name: string, userId: string): Promise<Stripe.Customer> {
    this.validateConfig();

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    userId: string
  ): Promise<Stripe.Checkout.Session> {
    this.validateConfig();

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        subscription_data: {
          metadata: {
            userId,
          },
        },
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    this.validateConfig();

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.validateConfig();

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    this.validateConfig();

    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error);
      throw new Error('Failed to retrieve subscriptions');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.validateConfig();

    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.validateConfig();

    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return subscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('Failed to reactivate subscription');
    }
  }

  async constructWebhookEvent(body: string, signature: string): Promise<Stripe.Event> {
    this.validateConfig();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionChange(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  private async handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Determine subscription status based on Stripe subscription
    let subscriptionStatus: 'free' | 'basic' | 'premium' = 'free';
    
    if (subscription.status === 'active') {
      const priceId = subscription.items.data[0]?.price.id;
      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);
      subscriptionStatus = (plan?.id as 'basic' | 'premium') || 'free';
    }

    // Update user subscription status in database
    // This would typically be done through your database service
    console.log(`Updating user ${userId} subscription to ${subscriptionStatus}`);
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata.userId;
    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Update user subscription status to free
    console.log(`Canceling subscription for user ${userId}`);
  }

  private async handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    console.log(`Payment succeeded for customer ${customerId}`);
    
    // You might want to send a confirmation email or update payment history
  }

  private async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    console.log(`Payment failed for customer ${customerId}`);
    
    // You might want to send a notification email or update payment status
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  getPlanByPriceId(priceId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId);
  }

  getAllPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  async getUsageBasedPricing(customerId: string): Promise<{
    currentUsage: number;
    limit: number;
    overage: number;
  }> {
    // This is a placeholder for usage-based pricing
    // You would implement this based on your specific usage metrics
    return {
      currentUsage: 0,
      limit: 100,
      overage: 0,
    };
  }
}

export const stripeService = new StripeService();
