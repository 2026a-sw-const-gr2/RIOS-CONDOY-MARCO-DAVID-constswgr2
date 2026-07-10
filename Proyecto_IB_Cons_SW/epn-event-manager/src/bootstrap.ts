import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';

export async function bootstrap(): Promise<void> {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const msg = typeof message === 'string' ? message : JSON.stringify(message);
  const rest = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `${String(timestamp)} ${String(level)}: ${msg} ${rest}`;
}),
        ),
      }),
    ],
  });

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
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
}
