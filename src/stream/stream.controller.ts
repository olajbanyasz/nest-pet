import {
  Controller,
  Get,
  Headers,
  Res,
  HttpStatus,
  Logger,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface VideoItem {
  filename: string;
  url: string;
}

@Controller('stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  private readonly mediaDir = path.join(process.cwd(), 'media');

  @Get('video/:filename')
  streamVideo(
    @Param('filename') filename: string,
    @Headers('range') range: string | undefined,
    @Res() res: Response,
  ): void {
    const videoPath = path.join(this.mediaDir, filename);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('File not found');
    }

    if (!range) {
      throw new BadRequestException('Range header required');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = Number(startStr);
    const end = endStr ? Number(endStr) : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(HttpStatus.PARTIAL_CONTENT, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  }

  @Delete('video/:filename')
  deleteVideo(@Param('filename') filename: string): {
    message: string;
    filename: string;
  } {
    if (!filename) {
      throw new BadRequestException('Filename is required');
    }

    const safeFilename = path.basename(filename);
    const videoPath = path.join(this.mediaDir, safeFilename);

    if (!fs.existsSync(videoPath)) {
      throw new NotFoundException('File not found');
    }

    fs.unlinkSync(videoPath);

    this.logger.log(`Deleted video: ${safeFilename}`);

    return {
      message: 'Video deleted',
      filename: safeFilename,
    };
  }

  @Get('videos')
  getVideoList(): VideoItem[] {
    if (!fs.existsSync(this.mediaDir)) {
      this.logger.warn('Media directory does not exist');
      return [];
    }

    const videoExtensions = new Set(['.mp4', '.webm', '.mov', '.mkv']);

    return fs
      .readdirSync(this.mediaDir)
      .filter((file) => videoExtensions.has(path.extname(file).toLowerCase()))
      .map((file) => ({
        filename: file,
        url: `/api/stream/video/${file}`,
      }));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(@UploadedFile() file: Express.Multer.File): {
    message: string;
    filename: string;
  } {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!fs.existsSync(this.mediaDir)) {
      fs.mkdirSync(this.mediaDir);
    }

    const targetPath = path.join(this.mediaDir, file.originalname);
    fs.writeFileSync(targetPath, file.buffer);

    this.logger.log(`Uploaded video: ${file.originalname}`);

    return {
      message: 'Upload successful',
      filename: file.originalname,
    };
  }
}
