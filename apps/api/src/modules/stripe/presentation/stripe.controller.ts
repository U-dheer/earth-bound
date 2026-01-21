import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { StripeService } from '../infrastructure/stripe.service';
import type { Request, Response } from 'express';
import { HandeledWebhookUsecase } from '../application/handeled_webhook.usecase';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private webhookUsecase: HandeledWebhookUsecase,
  ) {}

  @Post('checkout')
  async checkout(@Req() req: Request) {
    const { amount, projectId, userId } = req.body;

    const session = await this.stripeService.createCheckoutSession({
      amount,
      projectId,
      userId,
    });

    return { url: session.url };
  }

  @Post('webhook')
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    @Res() res: Response,
  ) {
    try {
      const event = this.stripeService.constructEvent(req.body, signature);
      return await this.webhookUsecase.execute(event);
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error`);
    }

    res.json({ received: true });
  }
}
