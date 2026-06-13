import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.enableCors({
    origin: '*',
  });
  const configService = app.get(ConfigService);
  const PORT: number = configService.get('PORT') ?? 3001;
  app.setGlobalPrefix('/api/v1');
  const logger = app.get(Logger);
  await app.listen(PORT);
  logger.log(`Server is running on http://localhost:${PORT}/api/v1`);
}
void bootstrap();
