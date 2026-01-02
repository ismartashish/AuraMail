import fs from "fs";
import csv from "csv-parser";

export function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          name: data.name || data.Name || "",
          email: data.email || data.Email || "",
          event: data.event || data.Event || "",
          date: data.date || data.Date || "",
        });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
