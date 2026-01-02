export function generateCsvReport(rows) {
  const headers = ["email", "name", "status", "reason"];
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => `"${r[h] || ""}"`).join(",")
    ),
  ].join("\n");

  return Buffer.from(csv);
}
