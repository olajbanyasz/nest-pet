import {
  BadGatewayException,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
  ServiceUnavailableException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

interface VideoItem {
  filename: string;
  url: string;
}

interface RadioStation {
  id: string;
  name: string;
  sourcePage: string;
  streamUrl: string;
}

@UseGuards(JwtAuthGuard)
@Controller('stream')
export class StreamController {
  private readonly logger = new Logger(StreamController.name);
  private readonly mediaDir = path.join(process.cwd(), 'media');
  private readonly radioStations: RadioStation[] = [
    {
      id: 'radio-1',
      name: 'Radio 1',
      sourcePage: 'https://netradio.online/radio-1',
      streamUrl: 'https://icast.connectmedia.hu/5201/live.mp3',
    },
  ];

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

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
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

  @Get('radio/stations')
  getRadioStations(): Array<{
    id: string;
    name: string;
    streamUrl: string;
  }> {
    return this.radioStations.map((station) => ({
      id: station.id,
      name: station.name,
      streamUrl: `/api/stream/radio/${station.id}`,
    }));
  }

  @Get('radio/:stationId')
  async proxyRadioStream(
    @Param('stationId') stationId: string,
    @Res() res: Response,
  ): Promise<void> {
    const station = this.radioStations.find((item) => item.id === stationId);

    if (!station) {
      throw new NotFoundException('Radio station not found');
    }

    try {
      const upstream = await fetch(station.streamUrl, {
        headers: {
          Accept: 'audio/*,*/*;q=0.8',
        },
      });

      if (!upstream.ok || !upstream.body) {
        throw new BadGatewayException('Unable to connect to radio stream');
      }

      const contentType = upstream.headers.get('content-type') ?? 'audio/mpeg';
      res.setHeader('Content-Type', contentType);

      const icyName = upstream.headers.get('icy-name');
      if (icyName) {
        res.setHeader('Icy-Name', icyName);
      }

      const icyGenre = upstream.headers.get('icy-genre');
      if (icyGenre) {
        res.setHeader('Icy-Genre', icyGenre);
      }

      const icyBr = upstream.headers.get('icy-br');
      if (icyBr) {
        res.setHeader('Icy-Br', icyBr);
      }

      res.status(upstream.status);
      const reader = upstream.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          res.write(Buffer.from(value));
        }
      }

      res.end();
    } catch (error: unknown) {
      this.logger.error(
        `Radio stream proxy failed for "${station.id}"`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new ServiceUnavailableException('Radio stream unavailable');
    }
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
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
