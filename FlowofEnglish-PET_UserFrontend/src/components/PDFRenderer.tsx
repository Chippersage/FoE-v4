// components/PDFRenderer.tsx
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PDFRendererProps {
  pdfUrl: string;
  title?: string;
  className?: string;
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

function PDFRenderer({
  pdfUrl,
  className = "",
  onLoadSuccess,
  onLoadError,
}: PDFRendererProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log("Document Loaded Successfully", numPages);
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);

    if (onLoadSuccess) onLoadSuccess();
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error);
    setError("Failed to load PDF document");
    setLoading(false);

    if (onLoadError) onLoadError();
  }

  function nextPage() {
    setPageNumber((prev) => (prev < (numPages || 1) ? prev + 1 : prev));
  }

  function prevPage() {
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  }

  if (error) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 ${className}`}
      >
        <div className="text-center p-4">
          <div className="text-gray-500 text-4xl mb-2">📄</div>
          <p className="text-gray-600 text-sm mb-2">Failed to load PDF</p>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm hover:underline"
          >
            Open PDF in new tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col bg-white ${className}`}>
      {/* PDF Content */}
      <div className="flex-1 overflow-auto w-full flex justify-center p-2">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            // Fit PDF page completely inside available height (40vh/80vh)
            height={
              window.innerWidth >= 768
                ? window.innerHeight * 0.75 // desktop : fits inside 80vh
                : window.innerHeight * 0.35 // mobile : fits inside 40vh
            }
            className="shadow-sm"
          />
        </Document>
      </div>

      {/* Page Controls */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center space-x-4 py-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ◀ Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default PDFRenderer;
