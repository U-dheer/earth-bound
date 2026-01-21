import { BadRequestException, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { CreateDonationUsecase } from 'src/modules/donation/application/createDonationUsecase';

@Injectable()
export class HandeledWebhookUsecase {
  constructor(private readonly createDonationUsecase: CreateDonationUsecase) {}

  async execute(event: Stripe.Event) {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        console.log('Checkout session completed:', session);

        const userId = session.metadata?.userId;
        const projectId = session.metadata?.projectId;
        const amount = Number(session.metadata?.amount);

        if (!userId || !projectId || !amount) {
          throw new BadRequestException(
            'Missing required metadata: userId, projectId, or amount',
          );
        }

        await this.createDonationUsecase.execute(
          {
            userId: userId,
            csrId: projectId,
            amount: amount,
          },
          projectId,
        );
      } else {
        console.log(`Unhandled event type: ${event.type}`);
        return;
      }
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to handle webhook',
      );
    }
  }
}
