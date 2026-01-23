import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // Explicitly enable body parser
  });

  app.useGlobalInterceptors();
  app.useGlobalFilters();

  await app.listen(process.env.PORT ?? 3006);
  console.log(`🚀 Gateway running on port ${process.env.PORT ?? 3006}`);
}
bootstrap();
