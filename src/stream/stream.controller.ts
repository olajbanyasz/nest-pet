import {
  Controller,
  Get,
  Headers,
  Res,
  HttpStatus,
  Logger,
  Post,
  Param,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);

  @Get('video')
  streamSampleVideo(@Headers('range') range: string, @Res() res: Response) {
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

  @Get('video/:filename')
  streamVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string,
    @Res() res: Response,
  ) {
    const videoPath = path.join(process.cwd(), 'media', filename);

    if (!fs.existsSync(videoPath)) {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
      return;
    }

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

  @Get('videos')
  getVideoList(@Res() res: Response) {
    const mediaDir = path.join(process.cwd(), 'media');

    if (!fs.existsSync(mediaDir)) {
      this.logger.warn('Media directory does not exist');
      return res.status(HttpStatus.OK).json([]);
    }

    const videoExtensions = ['.mp4', '.webm', '.mov', '.mkv'];

    const files = fs.readdirSync(mediaDir);

    const videos = files
      .filter((file) =>
        videoExtensions.includes(path.extname(file).toLowerCase()),
      )
      .map((file) => ({
        filename: file,
        url: `/api/stream/video/${file}`,
      }));

    return res.status(HttpStatus.OK).json(videos);
  }

  @Post('upload/:filename')
  uploadVideo(
    @Param('filename') filename: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const mediaDir = path.join(process.cwd(), 'media');
    const filePath = path.join(mediaDir, filename);

    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(filePath);

    (req as unknown as NodeJS.ReadableStream).pipe(writeStream);

    writeStream.on('finish', () => {
      this.logger.log(`Upload completed: ${filename}`);
      res.status(HttpStatus.CREATED).json({
        message: 'Upload complete',
        filename,
      });
    });

    writeStream.on('error', (err) => {
      this.logger.error(`Upload failed: ${err.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Upload failed',
        error: err.message,
      });
    });
  }
}
