import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PdfPageImage {
  pageNumber: number;
  imageData: string;
  width: number;
  height: number;
}

export function usePdfToImages(pdfUrl: string) {
  const [images, setImages] = useState<PdfPageImage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!pdfUrl) return;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
          disableAutoFetch: false,
          disableStream: false,
          disableRange: false,
        });

        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);

        const pageImages: PdfPageImage[] = [];

        // Process each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          try {
            const page = await pdf.getPage(pageNum);
            
            // Calculate high-quality scale based on device pixel ratio and target resolution
            const devicePixelRatio = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: 1 });
            
            // Calculate scale for high quality (aim for at least 1920px width or 2x device pixel ratio)
            const targetWidth = Math.max(1920, viewport.width * devicePixelRatio);
            const scale = Math.min(targetWidth / viewport.width, 4); // Cap at 4x for performance
            const scaledViewport = page.getViewport({ scale });

            // Create high-quality canvas for rendering
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", {
              alpha: false, // PDF pages don't need transparency
              willReadFrequently: false, // Optimize for one-time rendering
            });
            
            if (!context) {
              throw new Error("Failed to get canvas context");
            }

            // Set canvas dimensions
            canvas.width = scaledViewport.width;
            canvas.height = scaledViewport.height;
            
            // Configure context for high quality rendering
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            
            // Set white background for better contrast
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Render page to canvas with high quality settings
            const renderContext = {
              canvasContext: context,
              viewport: scaledViewport,
              enableWebGL: true, // Enable WebGL acceleration if available
              renderInteractiveForms: false, // Skip forms for better performance
            };

            await page.render(renderContext).promise;

            // Convert to high-quality base64 image
            const imageData = canvas.toDataURL("image/png", 1.0); // Maximum quality PNG

            pageImages.push({
              pageNumber: pageNum,
              imageData,
              width: scaledViewport.width,
              height: scaledViewport.height,
            });

            // Update progress
            setProgress(Math.round((pageNum / pdf.numPages) * 100));

            // Clean up canvas
            canvas.remove();

          } catch (pageError) {
            console.error(`Error processing page ${pageNum}:`, pageError);
            // Continue with other pages even if one fails
          }
        }

        setImages(pageImages);
        setLoading(false);

      } catch (err) {
        console.error("Error loading PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to load PDF");
        setLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  return {
    images,
    totalPages,
    loading,
    error,
    progress,
  };
}