import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // Explicitly enable body parser
  });

  // Configure CORS
  app.enableCors({
    origin: ['http://localhost:3002', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalInterceptors();
  app.useGlobalFilters();

  await app.listen(process.env.PORT ?? 3006);
  console.log(`🚀 Gateway running on port ${process.env.PORT ?? 3006}`);
}
bootstrap();
