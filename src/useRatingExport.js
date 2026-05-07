import { useCallback } from "react";

/**
 * useRatingExport — export ratings data as CSV or JSON.
 *
 * @param {RatingRecord[]} data
 * @param {object} options
 * @param {string} options.filename   Base filename without extension (default "ratings")
 * @param {string[]} options.csvFields  Fields to include in CSV (default all)
 *
 * RatingRecord can be any object — common shape:
 *  { id, author, rating, date, category, text }
 *
 * @returns {{ exportCSV, exportJSON, copyJSON }}
 */
export function useRatingExport(data = [], {
  filename = "ratings",
  csvFields,
} = {}) {

  const exportJSON = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    download(`${filename}.json`, json, "application/json");
  }, [data, filename]);

  const exportCSV = useCallback(() => {
    if (data.length === 0) return;

    const fields = csvFields ?? Object.keys(data[0]);
    const header = fields.join(",");
    const rows = data.map(record =>
      fields
        .map(f => {
          const val = record[f] ?? "";
          const str = String(val).replace(/"/g, '""');
          return str.includes(",") || str.includes("\n") || str.includes('"')
            ? `"${str}"`
            : str;
        })
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    download(`${filename}.csv`, csv, "text/csv");
  }, [data, filename, csvFields]);

  const copyJSON = useCallback(async () => {
    const json = JSON.stringify(data, null, 2);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(json);
      return true;
    }
    return false;
  }, [data]);

  return { exportCSV, exportJSON, copyJSON };
}

function download(filename, content, mimeType) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
