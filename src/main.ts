import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(bodyParser.urlencoded({ extended: false }));
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
