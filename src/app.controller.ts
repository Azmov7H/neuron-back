import { Controller, Get, Header } from '@nestjs/common';
import { SERVICE_NAME } from './app.constants';

@Controller()
export class AppController {
  @Get()
  @Header('Cache-Control', 'no-store')
  describe(): { service: string; status: 'ok' } {
    return { service: SERVICE_NAME, status: 'ok' };
  }
}
