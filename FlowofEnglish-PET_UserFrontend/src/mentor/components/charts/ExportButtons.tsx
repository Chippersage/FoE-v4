// @ts-nocheck
import React from "react";

type ExportButtonsProps = {
  componentRef: React.RefObject<HTMLDivElement> | any;
  filename: string;
  exportType: "chart" | "table";
  tableData?: any[];
};

const ExportButtons: React.FC<ExportButtonsProps> = ({
  componentRef,
  filename,
  exportType,
  tableData,
}) => {
  const handleDownloadCSV = () => {
    if (!tableData || !tableData.length) {
      console.warn("No table data to export");
      return;
    }

    const keys = Object.keys(tableData[0]);
    const header = keys.join(",");
    const rows = tableData.map((row) =>
      keys
        .map((k) => {
          const value = row[k] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!componentRef?.current) {
      window.print();
      return;
    }
    const printContents = componentRef.current.innerHTML;
    const win = window.open("", "", "height=600,width=800");
    if (!win) return;
    win.document.write("<html><head><title>Print</title></head><body>");
    win.document.write(printContents);
    win.document.write("</body></html>");
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="flex gap-2">
      {exportType === "table" && (
        <button
          type="button"
          onClick={handleDownloadCSV}
          className="px-3 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        >
          Export CSV
        </button>
      )}
      <button
        type="button"
        onClick={handlePrint}
        className="px-3 py-1 text-xs rounded-md border border-gray-300 bg-white hover:bg-gray-50"
      >
        Print
      </button>
    </div>
  );
};

export default ExportButtons;
