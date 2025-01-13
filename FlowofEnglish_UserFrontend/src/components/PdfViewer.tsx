// @ts-nocheck
import React from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const PdfViewer = ({ s3Link }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: () => null, // Remove toolbar (no print/download controls)
  });

  return (
    <div
      style={{
        height: "500px",
        border: "1px solid #ccc",
        position: "relative",
      }}
      onContextMenu={(e) => e.preventDefault()} // Disable right-click
    >
      <Worker
        workerUrl={`https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}
      >
        <Viewer fileUrl={s3Link} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
};

export default PdfViewer;
