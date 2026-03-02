import { Global, Module } from '@nestjs/common';

import { AppEventBusService } from './app-event-bus.service';

@Global()
@Module({
  providers: [AppEventBusService],
  exports: [AppEventBusService],
})
export class EventsModule {}
