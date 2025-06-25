import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class GoogleService {
  private sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../../credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async expense({
    monto,
    categoria,
    fecha,
  }: {
    monto: number;
    categoria: string;
    fecha: Date;
  }) {
    const month = fecha.toLocaleString('default', { month: 'long' });
    const sheetName = month.charAt(0).toUpperCase() + month.slice(1);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: 'TU_SPREADSHEET_ID',
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[fecha.toISOString(), categoria, monto]],
      },
    });
  }
}
