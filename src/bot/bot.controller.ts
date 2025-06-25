import { Controller, Post, Body } from '@nestjs/common';
import { BotService } from './bot.service';

@Controller('events')
export class BotController {
  constructor(private readonly service: BotService) {}

  @Post()
  handleIncomingMessage(@Body() body: any) {
    const { From, Body: messageBody } = body;
    const payload = {
      from: From,
      message: messageBody,
    };
    return this.service.handleIncomingMessage(payload);
  }
}
