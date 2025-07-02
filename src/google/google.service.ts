import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { currentMonth, today } from 'src/utils/messages.util';

@Injectable()
export class GoogleService {
  private readonly sheets;
  private readonly spreadsheetId;

  constructor(configService: ConfigService) {
    const base64Credentials = configService.get('GOOGLE_CREDENTIALS');
    this.spreadsheetId = configService.get('SHEET_ID');

    const credentials = JSON.parse(Buffer.from(base64Credentials, 'base64').toString('utf8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async registerMovement(data: { type: 'INGRESO' | 'EGRESO'; category: string; detail: string; amount: number }) {
    const month = currentMonth();
    const currentDay = today();

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${month}!B14:B`,
    });

    const existingRows = response.data.values?.length || 0;
    const targetRow = 14 + existingRows;

    const sheetId = await this.getSheetIdByName(month);

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            copyPaste: {
              source: {
                sheetId,
                startRowIndex: 13,
                endRowIndex: 14,
                startColumnIndex: 1,
                endColumnIndex: 8,
              },
              destination: {
                sheetId,
                startRowIndex: targetRow - 1,
                endRowIndex: targetRow,
                startColumnIndex: 1,
                endColumnIndex: 8,
              },
              pasteType: 'PASTE_NORMAL',
            },
          },
        ],
      },
    });

    const values = [
      [
        data.type === 'INGRESO' ? 'INGRESO' : 'EGRESO',
        data.type === 'INGRESO' ? data.category : '',
        data.type === 'EGRESO' ? data.category : '',
        currentDay,
        data.detail,
        data.amount,
      ],
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${month}!B${targetRow}:H${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return { ok: true, row: targetRow };
  }

  async getTotals() {
    const month = currentMonth();
    const range = `${month}!G8:G10`;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    const [deposits = [], expenses = [], total = []] = response.data.values || [];

    return {
      deposits: deposits[0],
      expenses: expenses[0],
      total: total[0],
    };
  }

  private async getSheetIdByName(sheetName: string): Promise<number> {
    const sheetMeta = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });

    const sheet = sheetMeta.data.sheets.find((s) => s.properties.title === sheetName);
    if (!sheet) {
      throw new Error(`Hoja "${sheetName}" no encontrada`);
    }

    return sheet.properties.sheetId;
  }
}
