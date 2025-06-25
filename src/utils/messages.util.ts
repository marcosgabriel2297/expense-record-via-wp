import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ParsedMessage {
  type: 'expenses' | 'deposit';
  category: string;
  detail: string;
  amount: number;
}

const expensesCategories = {
  'sueldo alephee': 'SUPERMERCADO',
  'sueldo mood': 'CARNICERIA',
  delivery: 'DELIVERY',
  luz: 'LUZ',
  internet: 'INTERNET | CABLE',
  cable: 'INTERNET | CABLE',
  vacaciones: 'VACACIONES',
  futbol: 'FUTBOL',
  tenis: 'TENIS / PADEL',
  padel: 'TENIS / PADEL',
  ingles: 'INGLES',
  salida: 'SALIDA',
  hotel: 'HOTEL',
  uber: 'UBER',
  reparaciones: 'REPARACIONES',
  gym: 'GIMNASIO',
  farmacia: 'FARMACIA',
  monotributo: 'MONOTRIBUTO',
  'pago de tarjeta': 'PAGO TARJETA',
  'pago de credito': 'PAGO CREDITO MP',
  plataformas: 'PLATAFORMAS',
  'pago de prestamo': 'PAGO PRESTAMO',
  'prestar plata': 'PRESTAR PLATA',
  impuestos: 'IMPUESTOS',
  ropa: 'ROPA',
  gustos: 'GUSTOS',
  veterinaria: 'VETERINARIA',
};

const depositCategories = {
  'sueldo alephee': 'SUELDO ALEPHEE',
  'sueldo mood': 'SUELDO MOOD',
  'venta de usd': 'VENTA DE USD',
};

export const parseMessage = (message: string): ParsedMessage | null => {
  const expensesRegex = /^gaste\s+(\d+)\s+en\s+([^\.,]+)[\.,]?\s*(.*)$/i;
  const depositRegex = /^recibi\s+(\d+)[\.,]?\s*(.*)$/i;

  const expensesMatch = message.match(expensesRegex);
  if (expensesMatch) {
    const amount = parseInt(expensesMatch[1]);
    const category = expensesMatch[2].trim();
    const detail = expensesMatch[3]?.trim() || category;

    return {
      type: 'expenses',
      amount,
      category,
      detail,
    };
  }

  const depositMatch = message.match(depositRegex);
  if (depositMatch) {
    const amount = parseInt(depositMatch[1]);
    const detail = depositMatch[2]?.trim();
    const category = detail;

    return {
      type: 'deposit',
      amount,
      category,
      detail,
    };
  }

  return null;
};

export const mapperDepositCategory = (category: string): string => depositCategories[category.toLowerCase()] || 'otro';

export const mapperExpensesCategory = (category: string): string =>
  expensesCategories[category.toLowerCase()] || 'otros';

export const categories = (type: 'expenses' | 'deposit') => {
  let categories: any = expensesCategories;
  let messageType = 'gastos';

  if (type === 'deposit') {
    categories = depositCategories;
    messageType = 'ingreso';
  }

  const categoriesList = Object.keys(categories)
    .map((key) => `- ${key}`)
    .join('\n');

  return `📂 Categorías disponibles para *${messageType}s*:\n\n${categoriesList}`;
};

export const savedRecordMessage = (type: 'expenses' | 'deposit', amount: number, category: string, detail: string) => {
  const today = format(new Date(), 'dd/MM/yyyy', { locale: es });
  if (type === 'deposit') {
    return `✅ ¡Ingreso registrado con éxito! 🤩
        📅 Fecha: ${today}
        💰 Monto: $${amount}
        🏷️ Categoría: ${category}
        📝 Detalle: "${detail}"`;
  }

  return `✅ ¡Gasto registrado correctamente! 🤑

        📅 Fecha: ${today}
        💸 Monto: $${amount}
        🏷️ Categoría: ${category}
        📝 Detalle: "${detail}"`;
};

export const invalidFormatMessage = () =>
  '🚫 El formato del mensaje no es válido.\n\n📌 Ejemplos correctos:\n- gaste 500 en uber, ir a cenar\n- recibi 1000. Sueldo alephee\n\n😉 Si querés ver las categorías disponibles, podés enviar:\n- categorias de ingreso\n- categorias de egreso';
