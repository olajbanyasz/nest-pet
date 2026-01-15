import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-mongodb';

export const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.MongoDB({
      level: 'info',
      db: process.env.MONGODB_URI || 'mongodb://localhost:27017/nest-pet',
      collection: 'logs',
      tryReconnect: true,
      options: {
        useUnifiedTopology: true,
      },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          const timestamp = String(info.timestamp);
          const level = String(info.level);
          const message = String(info.message);

          const context =
            info.context !== undefined
              ? typeof info.context === 'string'
                ? info.context
                : JSON.stringify(info.context)
              : '';

          return `[${timestamp}] ${level}${
            context ? ` [${context}]` : ''
          } ${message}`;
        }),
      ),
    }),
  ],
});
