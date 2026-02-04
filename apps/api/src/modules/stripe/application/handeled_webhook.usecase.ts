import { BadRequestException, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { CreateDonationUsecase } from 'src/modules/donation/application/createDonationUsecase';

@Injectable()
export class HandeledWebhookUsecase {
  constructor(private readonly createDonationUsecase: CreateDonationUsecase) {}

  async execute(event: Stripe.Event) {
    try {
      // Only handle checkout.session.completed to avoid duplicate donations
      // payment_intent.created fires before payment is confirmed
      if (event.type === 'checkout.session.completed') {
        const eventObject = event.data.object;

        console.log(`${event.type} event received:`, eventObject);

        const metadata = eventObject.metadata;
        const userId = metadata?.userId;
        const projectId = metadata?.projectId;
        const amount = Number(metadata?.amount);

        if (!userId || !projectId || !amount) {
          console.log(
            `Skipping ${event.type}: Missing required metadata (userId, projectId, or amount)`,
          );
          return;
        }

        await this.createDonationUsecase.execute({
          userId: userId,
          csrId: projectId,
          amount: amount,
        });
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
