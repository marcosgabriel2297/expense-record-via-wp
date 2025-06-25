import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from 'src/bot/bot.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BotModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
