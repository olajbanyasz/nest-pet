import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

type EventHandler<TPayload> = (payload: TPayload) => Promise<void> | void;

@Injectable()
export class AppEventBusService {
  private readonly logger = new Logger(AppEventBusService.name);
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(100);
  }

  emitAsync<TPayload>(eventName: string, payload: TPayload): void {
    setImmediate(() => {
      this.emitter.emit(eventName, payload);
    });
  }

  subscribe<TPayload>(
    eventName: string,
    handler: EventHandler<TPayload>,
  ): () => void {
    const wrappedHandler = (payload: TPayload) => {
      Promise.resolve(handler(payload)).catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : 'Unknown handler error';
        this.logger.error(
          `Event handler failed for "${eventName}": ${message}`,
        );
      });
    };

    this.emitter.on(eventName, wrappedHandler as (payload: unknown) => void);

    return () => {
      this.emitter.off(eventName, wrappedHandler as (payload: unknown) => void);
    };
  }
}
