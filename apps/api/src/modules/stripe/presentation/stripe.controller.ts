import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  UseGuards,
  Param,
} from '@nestjs/common';
import { StripeService } from '../infrastructure/stripe.service';
import type { Request, Response } from 'express';
import { HandeledWebhookUsecase } from '../application/handeled_webhook.usecase';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';

@Controller('stripe')
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private webhookUsecase: HandeledWebhookUsecase,
  ) {}

  @Post('checkout/:id')
  @UseGuards(AuthGuard)
  async checkout(
    @Req() req: Request,
    @CurrentUser('userId') userId: string,
    @Param('id') projectId: string,
  ) {
    const { amount } = req.body;

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
      const rawBody = req.body as Buffer;
      console.log('Received webhook payload');
      const event = this.stripeService.constructEvent(rawBody, signature);
      await this.webhookUsecase.execute(event);
      return res.json({ received: true });
    } catch (err) {
      console.log(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
