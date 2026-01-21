import { loadConfig } from 'src/shared/config';

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

const stripeConfig = (): StripeConfig => ({
  secretKey: loadConfig().STRIPE_SECRET_KEY,
  webhookSecret: loadConfig().STRIPE_WEBHOOK_SECRET,
});

export default stripeConfig;
