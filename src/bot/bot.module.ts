import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { GoogleModule } from '../google/google.module';
import { BotController } from './bot.controller';

@Module({
  controllers: [BotController],
  imports: [GoogleModule],
  providers: [BotService],
})
export class BotModule {}
