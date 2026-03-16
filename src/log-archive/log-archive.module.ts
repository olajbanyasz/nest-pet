import { Module } from '@nestjs/common';

import { LogArchiveService } from './log-archive.service';

@Module({
  providers: [LogArchiveService],
})
export class LogArchiveModule {}
