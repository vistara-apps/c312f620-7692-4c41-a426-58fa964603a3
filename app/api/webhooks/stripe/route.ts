import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/services/stripe';
import { databaseService } from '@/lib/services/database';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Construct and verify the webhook event
    const event = await stripeService.constructWebhookEvent(body, signature);

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as any);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as any);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object as any);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object as any);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleSubscriptionChange(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Determine subscription status based on Stripe subscription
    let subscriptionStatus: 'free' | 'basic' | 'premium' = 'free';
    
    if (subscription.status === 'active') {
      const priceId = subscription.items.data[0]?.price.id;
      
      // Map Stripe price ID to our subscription tiers
      if (priceId === process.env.STRIPE_BASIC_PRICE_ID) {
        subscriptionStatus = 'basic';
      } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
        subscriptionStatus = 'premium';
      }
    }

    // Update user subscription status in database
    await databaseService.updateUser(userId, {
      subscription_status: subscriptionStatus,
    });

    console.log(`Updated user ${userId} subscription to ${subscriptionStatus}`);
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('No userId found in subscription metadata');
      return;
    }

    // Update user subscription status to free
    await databaseService.updateUser(userId, {
      subscription_status: 'free',
    });

    console.log(`Canceled subscription for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(invoice: any) {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    console.log(`Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`);

    // You could add logic here to:
    // - Send a confirmation email
    // - Update payment history
    // - Trigger any post-payment actions
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(invoice: any) {
  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;

    console.log(`Payment failed for customer ${customerId}, subscription ${subscriptionId}`);

    // You could add logic here to:
    // - Send a payment failure notification
    // - Update payment status
    // - Implement retry logic
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    const userId = session.metadata?.userId;
    const customerId = session.customer;

    if (!userId) {
      console.error('No userId found in checkout session metadata');
      return;
    }

    console.log(`Checkout completed for user ${userId}, customer ${customerId}`);

    // Update user with Stripe customer ID if not already set
    const user = await databaseService.getUserById(userId);
    if (user && !user.stripe_customer_id) {
      await databaseService.updateUser(userId, {
        stripe_customer_id: customerId,
      });
    }

    // You could add logic here to:
    // - Send a welcome email
    // - Trigger onboarding flow
    // - Update user permissions
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}
