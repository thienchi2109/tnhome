import ExcelJS from "exceljs";

const columns: { header: string; key: string; width: number }[] = [
  { header: "external_id", key: "external_id", width: 15 },
  { header: "name", key: "name", width: 30 },
  { header: "price", key: "price", width: 12 },
  { header: "category", key: "category", width: 20 },
  { header: "images", key: "images", width: 40 },
  { header: "description", key: "description", width: 40 },
  { header: "isActive", key: "isActive", width: 10 },
];

const exampleRow: Record<string, string | number | boolean> = {
  external_id: "SP001",
  name: "\u00C1o thun basic tr\u1EAFng",
  price: 199000,
  category: "\u00C1o",
  images: "https://example.com/image1.jpg",
  description: "\u00C1o thun cotton 100%",
  isActive: true,
};

export async function createProductImportTemplate(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Products");

  sheet.columns = columns;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD6E4F0" },
  };

  sheet.addRow(exampleRow);

  return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}
