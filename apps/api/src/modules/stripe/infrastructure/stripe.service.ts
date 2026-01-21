import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { loadConfig } from 'src/shared/config';
import stripeConfig from '../stripe.config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(stripeConfig().secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  async createCheckoutSession(data: {
    amount: number;
    projectId: string;
    userId: string;
  }) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            unit_amount: data.amount * 100,
            product_data: {
              name: 'CSR Donation',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${loadConfig().FRONTEND_URL}/success`,
      cancel_url: `${loadConfig().FRONTEND_URL}/cancel`,
      metadata: {
        userId: data.userId,
        projectId: data.projectId,
        amount: data.amount.toString(),
      },
    });
  }

  constructEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig().webhookSecret,
    );
  }
}
