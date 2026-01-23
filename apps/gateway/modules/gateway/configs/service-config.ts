import { config } from 'dotenv';
config();
export const ServicesConfig = {
  auth: process.env.AUTH_SERVICE_URL,
  api: process.env.API_SERVICE_URL,
};
