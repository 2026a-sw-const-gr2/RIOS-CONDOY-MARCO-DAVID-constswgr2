import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export function createWinstonLogger() {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const msg =
              message === null || message === undefined
                ? ''
                : typeof message === 'object'
                  ? JSON.stringify(message)
                  : (message as string);
            const rest = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${String(timestamp)} ${String(level)}: ${msg} ${rest}`;
          }),
        ),
      }),
    ],
  });
}
