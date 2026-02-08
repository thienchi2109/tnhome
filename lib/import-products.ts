import ExcelJS from "exceljs";
import { z } from "zod";

export const MAX_IMPORT_ROWS = 1000;

const importRowSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  category: z.string().min(1),
  images: z
    .array(
      z
        .string()
        .url()
        .refine((url) => url.startsWith("https://"), "Image URLs must use https")
    )
    .min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ImportRowError = {
  row: number;
  messages: string[];
};

const headerMap: Record<string, keyof ImportRow> = {
  external_id: "externalId",
  externalid: "externalId",
  name: "name",
  price: "price",
  category: "category",
  images: "images",
  description: "description",
  isactive: "isActive",
  stock: "stock",
  low_stock_threshold: "lowStockThreshold",
  lowstockthreshold: "lowStockThreshold",
  "ton kho": "stock",
  tonkho: "stock",
  "tồn kho": "stock",
  "tồnkho": "stock",
  "nguong canh bao": "lowStockThreshold",
  "ngưỡng cảnh báo": "lowStockThreshold",
};

const requiredHeaders: Array<keyof ImportRow> = [
  "externalId",
  "name",
  "price",
  "category",
  "images",
];

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function parseImages(value: unknown): string[] {
  return String(value ?? "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value: unknown): boolean {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return true;
}

export async function parseProductImportSheet(buffer: ArrayBuffer): Promise<{
  rows: ImportRow[];
  errors: ImportRowError[];
}> {
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return {
      rows: [],
      errors: [{ row: 0, messages: ["Invalid or corrupted .xlsx file"] }],
    };
  }

  const sheet = workbook.worksheets[0];

  if (!sheet) {
    return { rows: [], errors: [{ row: 0, messages: ["Missing worksheet"] }] };
  }

  const headerRow = sheet.getRow(1);
  const rawValues = headerRow.values;
  const headerCells = Array.isArray(rawValues) ? rawValues.slice(1) : [];

  if (headerCells.length === 0) {
    return { rows: [], errors: [{ row: 1, messages: ["Missing header row"] }] };
  }

  const headers = headerCells
    .map((cell: unknown) => headerMap[normalizeHeader(cell)] ?? null);

  const presentHeaders = headers.filter(Boolean) as Array<keyof ImportRow>;
  const missingHeaders = requiredHeaders.filter(
    (header) => !presentHeaders.includes(header)
  );
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          messages: [`Missing required columns: ${missingHeaders.join(", ")}`],
        },
      ],
    };
  }

  const dataRowCount = Math.max(0, sheet.actualRowCount - 1);
  if (dataRowCount > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 0,
          messages: [`Max ${MAX_IMPORT_ROWS} rows allowed`],
        },
      ],
    };
  }

  const rows: ImportRow[] = [];
  const errors: ImportRowError[] = [];
  const seen = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const values = row.values as Array<unknown>;
    const record: Record<string, unknown> = {};

    headers.forEach((key, index) => {
      if (!key) return;
      const cellValue = values[index + 1];
      if (key === "images") record.images = parseImages(cellValue);
      else if (key === "price") record.price = Number(cellValue);
      else if (key === "isActive") record.isActive = parseBoolean(cellValue);
      else if (key === "stock" || key === "lowStockThreshold") record[key] = cellValue != null ? Number(cellValue) : undefined;
      else record[key] = String(cellValue ?? "").trim();
    });

    const parsed = importRowSchema.safeParse(record);
    if (!parsed.success) {
      errors.push({
        row: rowNumber,
        messages: parsed.error.issues.map((issue) => issue.message),
      });
      return;
    }

    if (seen.has(parsed.data.externalId)) {
      errors.push({ row: rowNumber, messages: ["Duplicate external_id in file"] });
      return;
    }

    seen.add(parsed.data.externalId);
    rows.push(parsed.data);
  });

  return { rows, errors };
}
