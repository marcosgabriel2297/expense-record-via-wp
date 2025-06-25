import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Twilio } from 'twilio';

import {
  categories,
  invalidFormatMessage,
  mapperDepositCategory,
  mapperExpensesCategory,
  parseMessage,
  savedRecordMessage,
} from 'src/utils/messages.util';

@Injectable()
export class BotService {
  private readonly myphone: string;
  private readonly sender: string;
  private readonly twilioClient: Twilio;
  private logger: Logger = new Logger(BotService.name);

  constructor(configService: ConfigService) {
    this.myphone = configService.get('MY_PHONE');

    const sid = configService.get('MESSAGING_ACCOUNT_ID');
    const authToken = configService.get('MESSAGING_AUTH_TOKEN');
    const sender = configService.get('MESSAGING_SENDER');

    this.twilioClient = new Twilio(sid, authToken);
    this.sender = sender;
  }

  async handleIncomingMessage(payload: { from: string; message }) {
    const { from, message } = payload;
    if (!from.includes(this.myphone)) {
      return 'ok';
    }

    const categoriesMessages = {
      'categorias de ingreso': () => this.sendMessage(categories('deposit')),
      'categorias de egreso': () => this.sendMessage(categories('expenses')),
    };

    if (categoriesMessages[message]) {
      return categoriesMessages[message]();
    }

    const data = parseMessage(message);
    if (!data) {
      //TODO: send message to user
      await this.sendMessage(invalidFormatMessage());
      return 'Invalid message format';
    }

    const { type, amount, category, detail } = data;

    if (type === 'deposit') {
      const mappedCategory = mapperDepositCategory(category);

      //TODO: save in Google sheets

      await this.sendMessage(savedRecordMessage('deposit', amount, mappedCategory, detail));
      return;
    }

    const mappedCategory = mapperExpensesCategory(category);

    //TODO: save in Google sheets
    await this.sendMessage(savedRecordMessage('expenses', amount, mappedCategory, detail));
  }

  async sendMessage(message: string) {
    const response = await this.twilioClient.messages.create({
      from: `whatsapp:+${this.sender}`,
      body: message,
      to: `whatsapp:+549${this.myphone}`,
    });
    this.logger.log(`Message sent to ${this.myphone}, body: ${JSON.stringify(response)}`);
  }
}
