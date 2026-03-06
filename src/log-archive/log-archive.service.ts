import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnyBulkWriteOperation, Collection, Document, ObjectId } from 'mongodb';
import { Connection } from 'mongoose';

type SourceLogDocument = Document & {
  _id: ObjectId;
  level?: string;
  timestamp?: string | Date;
};

type ArchivedLogDocument = Document & {
  originalLogId: ObjectId;
  archivedAt: Date;
  originalTimestamp?: Date;
};

@Injectable()
export class LogArchiveService implements OnModuleInit {
  private readonly logger = new Logger(LogArchiveService.name);
  private readonly batchSize = 500;
  private isRunning = false;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit(): Promise<void> {
    await this.ensureArchiveIndexes();
    await this.archiveOldInfoLogs('startup');
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async handleScheduledArchive(): Promise<void> {
    await this.archiveOldInfoLogs('schedule');
  }

  private async ensureArchiveIndexes(): Promise<void> {
    const archiveCollection = this.getArchiveCollection();
    await archiveCollection.createIndex({ originalLogId: 1 }, { unique: true });
    await archiveCollection.createIndex({ archivedAt: 1 });
    await archiveCollection.createIndex({ originalTimestamp: 1 });
  }

  private async archiveOldInfoLogs(
    trigger: 'startup' | 'schedule',
  ): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(`Log archive already running, skipping (${trigger})`);
      return;
    }

    this.isRunning = true;
    const startedAt = Date.now();
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      let totalArchived = 0;

      while (true) {
        const batch = await this.getLogsCollection()
          .find({
            level: 'info',
            $expr: {
              $lte: [
                {
                  $convert: {
                    input: '$timestamp',
                    to: 'date',
                    onError: new Date('9999-12-31T23:59:59.999Z'),
                    onNull: new Date('9999-12-31T23:59:59.999Z'),
                  },
                },
                cutoffDate,
              ],
            },
          })
          .limit(this.batchSize)
          .toArray();

        if (batch.length === 0) {
          break;
        }

        const operations: AnyBulkWriteOperation<ArchivedLogDocument>[] =
          batch.map((entry) => {
            const archivedDoc = { ...entry } as unknown as ArchivedLogDocument;
            archivedDoc.originalLogId = entry._id;
            archivedDoc.archivedAt = new Date();
            archivedDoc.originalTimestamp = this.parseTimestamp(
              entry.timestamp,
            );
            delete (archivedDoc as Partial<SourceLogDocument>)._id;

            return {
              updateOne: {
                filter: { originalLogId: entry._id },
                update: { $setOnInsert: archivedDoc },
                upsert: true,
              },
            };
          });

        await this.getArchiveCollection().bulkWrite(operations, {
          ordered: false,
        });
        await this.getLogsCollection().deleteMany({
          _id: { $in: batch.map((entry) => entry._id) },
        });

        totalArchived += batch.length;
      }

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `Log archiving finished (${trigger}): ${totalArchived} entries moved in ${durationMs}ms`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Log archiving failed (${trigger}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    } finally {
      this.isRunning = false;
    }
  }

  private getLogsCollection(): Collection<SourceLogDocument> {
    return this.connection.collection<SourceLogDocument>('logs');
  }

  private getArchiveCollection(): Collection<ArchivedLogDocument> {
    return this.connection.collection<ArchivedLogDocument>('logs_archive');
  }

  private parseTimestamp(value: string | Date | undefined): Date | undefined {
    if (!value) {
      return undefined;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
}
