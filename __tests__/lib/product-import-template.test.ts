import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { createProductImportTemplate } from "@/lib/product-import-template";

describe("createProductImportTemplate", () => {
  it("generates a valid XLSX with correct headers and example row", async () => {
    const buffer = await createProductImportTemplate();

    // Should return a buffer (exceljs writeBuffer returns a Node.js Buffer)
    expect(Buffer.isBuffer(buffer) || buffer instanceof ArrayBuffer).toBe(true);
    expect(buffer.byteLength).toBeGreaterThan(0);

    // Parse the generated XLSX
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];
    expect(sheet).toBeDefined();

    // Verify headers (row 1)
    const headerRow = sheet.getRow(1);
    const headers = (headerRow.values as unknown[]).slice(1).map(String);
    expect(headers).toEqual([
      "external_id",
      "name",
      "price",
      "category",
      "images",
      "description",
      "isActive",
      "stock",
      "low_stock_threshold",
    ]);

    // Verify example data row exists (row 2)
    const dataRow = sheet.getRow(2);
    const firstCell = dataRow.getCell(1).value;
    expect(firstCell).toBeTruthy();
  });
});
