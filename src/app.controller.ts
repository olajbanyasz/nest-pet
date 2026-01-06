import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('*')
  serveReactApp(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'client', 'build', 'index.html'));
  }
}
