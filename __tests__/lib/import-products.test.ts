import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { MAX_IMPORT_ROWS, parseProductImportSheet } from "@/lib/import-products";

async function workbookBuffer(rows: Array<Array<string | number | boolean | null>>) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");
  rows.forEach((row) => sheet.addRow(row));
  return workbook.xlsx.writeBuffer();
}

async function emptyWorkbookBuffer() {
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("Products");
  return workbook.xlsx.writeBuffer();
}

describe("parseProductImportSheet", () => {
  it("parses valid rows", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images", "description", "isActive"],
      ["SKU-001", "Binh gom", 100000, "Decor", "https://a.com/1.jpg, https://a.com/2.jpg", "Mo ta", "true"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      externalId: "SKU-001",
      name: "Binh gom",
      price: 100000,
      category: "Decor",
      images: ["https://a.com/1.jpg", "https://a.com/2.jpg"],
      description: "Mo ta",
      isActive: true,
    });
  });

  it("accepts case-insensitive headers", async () => {
    const buffer = await workbookBuffer([
      ["EXTERNAL_ID", "NAME", "PRICE", "CATEGORY", "IMAGES"],
      ["SKU-002", "Binh", 120000, "Decor", "https://a.com/1.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows[0].externalId).toBe("SKU-002");
  });

  it("reports duplicate external_id in file", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["SKU-003", "A", 1000, "Decor", "https://a.com/1.jpg"],
      ["SKU-003", "B", 2000, "Decor", "https://a.com/2.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(1);
    expect(result.errors[0].messages[0]).toMatch(/duplicate/i);
  });

  it("errors on empty worksheet", async () => {
    const buffer = await emptyWorkbookBuffer();

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/header/i);
  });

  it("errors on corrupted file", async () => {
    const buffer = new Uint8Array([1, 2, 3]).buffer;

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/corrupted|invalid/i);
  });

  it("enforces max row limit", async () => {
    const rows = Array.from({ length: MAX_IMPORT_ROWS + 1 }, (_, index) => [
      `SKU-${index}`,
      "Name",
      1000,
      "Decor",
      "https://a.com/1.jpg",
    ]);

    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ...rows,
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/max/i);
  });

  it("reports validation errors with row numbers", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["", "", -1, "", "not-a-url"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].row).toBe(2);
    expect(result.errors[0].messages.length).toBeGreaterThan(0);
  });

  it("parses images separated by newline", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["SKU-004", "Product", 50000, "Category", "https://a.com/1.jpg\nhttps://a.com/2.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows[0].images).toEqual(["https://a.com/1.jpg", "https://a.com/2.jpg"]);
  });

  it("parses boolean values correctly", async () => {
    const testCases = [
      { input: "false", expected: false },
      { input: "0", expected: false },
      { input: "no", expected: false },
      { input: "n", expected: false },
      { input: "true", expected: true },
      { input: "1", expected: true },
      { input: "yes", expected: true },
      { input: "y", expected: true },
    ];

    for (const { input, expected } of testCases) {
      const buffer = await workbookBuffer([
        ["external_id", "name", "price", "category", "images", "isActive"],
        [`SKU-${input}`, "Product", 50000, "Category", "https://a.com/1.jpg", input],
      ]);

      const result = await parseProductImportSheet(buffer);
      expect(result.rows[0]?.isActive).toBe(expected);
    }
  });

  it("defaults isActive to true when not provided", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["SKU-005", "Product", 50000, "Category", "https://a.com/1.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows[0].isActive).toBe(true);
  });

  it("rejects HTTP URLs (requires HTTPS)", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images"],
      ["SKU-006", "Product", 50000, "Category", "http://a.com/1.jpg"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/https/i);
  });

  it("handles missing required columns", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name"],
      ["SKU-007", "Product"],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.rows).toHaveLength(0);
    expect(result.errors[0].messages[0]).toMatch(/missing required/i);
  });

  it("handles optional description field", async () => {
    const buffer = await workbookBuffer([
      ["external_id", "name", "price", "category", "images", "description"],
      ["SKU-008", "Product", 50000, "Category", "https://a.com/1.jpg", ""],
    ]);

    const result = await parseProductImportSheet(buffer);

    expect(result.errors).toEqual([]);
    expect(result.rows[0].description).toBe("");
  });
});
