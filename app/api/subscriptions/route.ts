import { NextRequest, NextResponse } from 'next/server';
import { stripeService, SUBSCRIPTION_PLANS } from '@/lib/services/stripe';
import { databaseService } from '@/lib/services/database';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  planId: z.enum(['basic', 'premium']),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Get user data
    const user = await databaseService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Get current subscription status from database
    const currentPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === user.subscription_status);

    // If user has a Stripe customer ID, get their active subscriptions
    let stripeSubscriptions = [];
    if (user.stripe_customer_id) {
      try {
        stripeSubscriptions = await stripeService.getCustomerSubscriptions(user.stripe_customer_id);
      } catch (error) {
        console.error('Error fetching Stripe subscriptions:', error);
        // Continue without Stripe data
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: currentPlan ? {
          id: currentPlan.id,
          name: currentPlan.name,
          description: currentPlan.description,
          price: currentPlan.price,
          interval: currentPlan.interval,
          features: currentPlan.features,
        } : null,
        availablePlans: SUBSCRIPTION_PLANS.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          features: plan.features,
        })),
        stripeSubscriptions: stripeSubscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching subscription info:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription information',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createCheckoutSchema.parse(body);

    // Get user data
    const user = await databaseService.getUserById(validatedData.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Find the requested plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === validatedData.planId);
    if (!plan || !plan.stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan or plan not available for subscription',
        },
        { status: 400 }
      );
    }

    // Ensure user has a Stripe customer ID
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      try {
        const customer = await stripeService.createCustomer(
          user.email,
          user.name,
          user.user_id
        );
        customerId = customer.id;

        // Update user with Stripe customer ID
        await databaseService.updateUser(user.user_id, {
          stripe_customer_id: customerId,
        });
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create customer account',
          },
          { status: 500 }
        );
      }
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      plan.stripePriceId,
      validatedData.successUrl,
      validatedData.cancelUrl,
      validatedData.userId
    );

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, subscriptionId } = body;

    if (!userId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId and action are required',
        },
        { status: 400 }
      );
    }

    // Get user data
    const user = await databaseService.getUserById(userId);
    if (!user || !user.stripe_customer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found or no payment account',
        },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'cancel':
        if (!subscriptionId) {
          return NextResponse.json(
            {
              success: false,
              error: 'subscriptionId is required for cancel action',
            },
            { status: 400 }
          );
        }
        result = await stripeService.cancelSubscription(subscriptionId);
        break;

      case 'reactivate':
        if (!subscriptionId) {
          return NextResponse.json(
            {
              success: false,
              error: 'subscriptionId is required for reactivate action',
            },
            { status: 400 }
          );
        }
        result = await stripeService.reactivateSubscription(subscriptionId);
        break;

      case 'portal':
        const portalSession = await stripeService.createPortalSession(
          user.stripe_customer_id,
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        );
        return NextResponse.json({
          success: true,
          data: {
            portalUrl: portalSession.url,
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Supported actions: cancel, reactivate, portal',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          id: result.id,
          status: result.status,
          cancelAtPeriodEnd: result.cancel_at_period_end,
          currentPeriodEnd: result.current_period_end,
        },
      },
    });
  } catch (error) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage subscription',
      },
      { status: 500 }
    );
  }
}
