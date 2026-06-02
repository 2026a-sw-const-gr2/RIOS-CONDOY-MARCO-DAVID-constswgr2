// @ts-nocheck
const { NestFactory } = require('@nestjs/core') as any;
const { ValidationPipe } = require('@nestjs/common') as any;
const { ConfigService } = require('@nestjs/config') as any;
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export async function bootstrap() {
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) =>
            `${timestamp} ${level}: ${typeof message === 'object' ? JSON.stringify(message) : message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`,
          ),
        ),
      }),
    ],
  });

  const app = (await NestFactory.create(AppModule, { logger })) as any;
  const config = app.get(ConfigService as any);

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
