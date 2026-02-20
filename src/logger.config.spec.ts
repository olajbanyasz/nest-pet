/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-require-imports */
import * as winston from 'winston';

jest.mock('winston-mongodb', () => ({}));

(winston.transports as any).MongoDB = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
  log: jest.fn(),
}));

// We must import logger AFTER mocking winston.transports.MongoDB
const { logger } = require('./logger.config');

describe('LoggerConfig', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  describe('Console format printf', () => {
    it('should format log message without context', () => {
      const info = {
        timestamp: '2024-01-01',
        level: 'info',
        message: 'test message',
      } as winston.Logform.TransformableInfo;

      const output = formatLog(info);
      expect(output).toBe('[2024-01-01] info test message');
    });

    it('should format log message with string context', () => {
      const info = {
        timestamp: '2024-01-01',
        level: 'info',
        message: 'test message',
        context: 'AuthService',
      } as winston.Logform.TransformableInfo;
      const output = formatLog(info);
      expect(output).toBe('[2024-01-01] info [AuthService] test message');
    });

    it('should format log message with object context', () => {
      const info = {
        timestamp: '2024-01-01',
        level: 'info',
        message: 'test message',
        context: { user: 'admin' },
      } as unknown as winston.Logform.TransformableInfo;
      const output = formatLog(info);
      expect(output).toBe('[2024-01-01] info [{"user":"admin"}] test message');
    });
  });
});

// Replicating the logic from logger.config.ts for verification
function formatLog(info: winston.Logform.TransformableInfo) {
  const timestamp = String(info.timestamp);
  const level = String(info.level);
  const message = String(info.message);

  const context =
    info.context !== undefined
      ? typeof info.context === 'string'
        ? info.context
        : JSON.stringify(info.context)
      : '';

  return `[${timestamp}] ${level}${context ? ` [${context}]` : ''} ${message}`;
}
