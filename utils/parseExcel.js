import XLSX from "xlsx";

export function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const data = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  return data.map(row => ({
    name: row.name || row.Name || "",
    email: row.email || row.Email || "",
    event: row.event || row.Event || "",
    date: row.date || row.Date || "",
  }));
}
