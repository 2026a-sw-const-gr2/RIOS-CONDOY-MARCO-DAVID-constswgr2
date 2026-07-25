import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWinstonLogger } from './infrastructure/logging/winston.factory';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<void> {
  const logger = createWinstonLogger();

  const app = await NestFactory.create(AppModule, { logger });
  const config = app.get(ConfigService);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = Number(config.get('PORT')) || 3000;
  await app.listen(port);

  console.log(`Server listening on port ${port}`);
}
