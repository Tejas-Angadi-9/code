import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  const configService = app.get(ConfigService);
  const PORT: number = configService.get('PORT') ?? 3000;
  app.setGlobalPrefix('/api/v1');
  await app.listen(PORT);
  console.log(`Server is running on http://localhost:${PORT}/api/v1`);
}
bootstrap();
