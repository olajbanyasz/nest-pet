import { Controller, Get, Headers, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('stream')
export class StreamController {
  @Get('video')
  streamVideo(@Headers('range') range: string, @Res() res: Response) {
    const videoPath = path.join(process.cwd(), 'media/sample.mp4');
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (!range) {
      res.status(HttpStatus.BAD_REQUEST).send('Range header required');
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    res.writeHead(HttpStatus.PARTIAL_CONTENT, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    file.pipe(res);
  }
}
