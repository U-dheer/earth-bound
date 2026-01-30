import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AuthExceptionFilter } from 'modules/gateway/auth/filters/auth-exception.filter';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // Explicitly enable body parser
  });

  // Enable cookie parsing
  app.use(cookieParser());

  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3002', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Apply global exception filter for auth errors
  app.useGlobalFilters(new AuthExceptionFilter());

  await app.listen(process.env.PORT ?? 3006);
  console.log(`🚀 Gateway running on port ${process.env.PORT ?? 3006}`);
}
bootstrap();
