// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadModal } from "./modals/UploadModal";
import AlertModal from "./modals/AlertModal";
import { RetryModal } from "./modals/RetryModal";
import { FileUploaderRecorder } from "./FileUploaderRecorder";
import ActivityCompletionModal from "./ActivityCompletionModal";
import AssignmentStatusModal from "./modals/AssignmentStatusModal";
import axios from "axios";
import { Button } from "./ui/button";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, EffectFade } from 'swiper/modules';
import { usePdfToImages } from '../hooks/usePdfToImages';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Browser-style PDF Viewer Component with Full Width and Scrolling
const PDFBrowserViewer = ({ pdfUrl, onContentLoaded }: { pdfUrl: string; onContentLoaded?: () => void }) => {
  const { images, totalPages, loading, error, progress } = usePdfToImages(pdfUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.2); // Start with slightly higher zoom for better quality
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length > 0 && !loading) {
      onContentLoaded?.();
    }
  }, [images, loading, onContentLoaded]);

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `document-${Date.now()}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const fitToWidth = () => {
    setZoom(1.0);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 animate-bounce">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Loading Failed</h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <p className="text-gray-500 mb-6 text-sm">Unable to process the document. Please try reloading the page.</p>

          {/* <button 
            onClick={handleDownload}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📥 Download PDF
          </button> */}
        </div>
      </div>
    );
  }

  if (loading || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="text-center p-8 max-w-md">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Document</h3>
          {/* <p className="text-gray-600 mb-4">Converting pages for viewing...</p> */}
          {totalPages > 0 && (
            <p className="text-gray-500 text-sm mb-4">
              Processing {totalPages} pages ({progress}% complete)
            </p>
          )}
          <div className="w-64 bg-gray-200 rounded-full h-3 mx-auto overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'w-full'
        }`}
      style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 180px)' }}
    >
      {/* Toolbar */}
      {/* <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 px-4 py-2">
        <div className="flex items-center justify-between"> */}
      {/* Left side - Document info */}
      {/* <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">{images.length} pages</span>
          </div> */}

      {/* Center - Zoom controls */}
      {/* <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Zoom Out"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            
            <span className="text-xs font-medium text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Zoom In"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <button
              onClick={fitToWidth}
              className="px-2 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 transition-colors font-medium text-gray-600"
              title="Fit to Width"
            >
              Fit
            </button>
          </div> */}

      {/* Right side - Actions */}
      {/* <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-xs font-medium text-white"
              title="Download PDF"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download</span>
            </button>

            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5M15 15h4.5m-4.5 0l5.5 5.5" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div> */}

      {/* PDF Content Area with Scrolling */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full pt-12 overflow-auto"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        <div className="flex flex-col items-center py-4 space-y-4 ">
          {images.map((page, index) => (
            <div
              key={page.pageNumber}
              className="bg-white shadow-lg border border-gray-300 max-w-[90%] md:max-w-[80%]"
              style={{
                width: `${zoom * 100}%`
              }}
            >
              <img
                src={page.imageData}
                alt={`Page ${page.pageNumber}`}
                className="w-full h-auto block"
                style={{
                  imageRendering: 'auto', // Use browser's best quality algorithm
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="auto"
                fetchPriority={index < 3 ? "high" : "auto"}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Professional PDF Slide Viewer Component
const PDFSlideViewer = ({ pdfUrl, onContentLoaded }: { pdfUrl: string; onContentLoaded?: () => void }) => {
  const { images, totalPages, loading, error, progress } = usePdfToImages(pdfUrl);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (images.length > 0 && !loading) {
      onContentLoaded?.();
    }
  }, [images, loading, onContentLoaded]);

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = pdfUrl;
  //   link.download = `document-${Date.now()}.pdf`;
  //   link.target = '_blank';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const goToSlide = (slideIndex: number) => {
    if (swiperInstance && slideIndex >= 0 && slideIndex < images.length) {
      swiperInstance.slideTo(slideIndex);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4 animate-bounce">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Loading Failed</h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <p className="text-gray-500 mb-6 text-sm">Unable to process document. Please try reloading.</p>

          {/* <button
            onClick={handleDownload}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📥 Download PDF
          </button> */}
        </div>
      </div>
    );
  }

  if (loading || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="text-center p-8 max-w-md">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Document</h3>
          {/* <p className="text-gray-600 mb-4">Converting pages to slides...</p> */}
          {totalPages > 0 && (
            <p className="text-gray-500 text-sm mb-4">
              Processing {totalPages} pages ({progress}% complete)
            </p>
          )}
          <div className="w-64 bg-gray-200 rounded-full h-3 mx-auto overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-0' : 'w-full'
        }`}
      style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 180px)' }}
    >
      {/* Minimal Header - Only Fullscreen Button */}
      <div className="absolute top-12 right-4 z-20">
        <button
          onClick={handleFullscreen}
          className="p-2 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 shadow-md border border-gray-200 hover:border-gray-300"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5M15 15h4.5m-4.5 0l5.5 5.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Slide Area */}
      <div className="relative w-full h-full pt-4 pb-16">
        <Swiper
          modules={[Navigation, Pagination, Keyboard, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          keyboard={{
            enabled: true,
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true,
          }}
          speed={300}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
          className="w-full h-full"
        >
          {images.map((page, index) => (
            <SwiperSlide key={page.pageNumber} className="flex items-center justify-center pt-4">
              <div className="relative w-full h-full flex items-center justify-center p-6">
                <div className="relative max-w-full max-h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <img
                    src={page.imageData}
                    alt={`Slide ${page.pageNumber}`}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      maxHeight: 'calc(100vh - 200px)',
                      maxWidth: 'calc(100vw - 120px)',
                    }}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev-custom absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all duration-300 group shadow-md border border-gray-200 hover:border-gray-300 z-10 cursor-pointer">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          <div className="swiper-button-next-custom absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all duration-300 group shadow-md border border-gray-200 hover:border-gray-300 z-10 cursor-pointer">
            <svg className="w-6 h-6 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Swiper>
      </div>

      {/* Bottom Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-gray-800 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Quick Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => goToSlide(currentSlide - 2)}
              disabled={currentSlide <= 1}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-gray-700 border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={currentSlide}
                onChange={(e) => {
                  const slide = parseInt(e.target.value);
                  if (slide >= 1 && slide <= images.length) {
                    goToSlide(slide - 1);
                  }
                }}
                className="w-16 px-3 py-2 text-center bg-white text-gray-700 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                min="1"
                max={images.length}
              />
              <span className="text-gray-500 text-sm">of {images.length}</span>
            </div>

            <button
              onClick={() => goToSlide(currentSlide)}
              disabled={currentSlide >= images.length}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-gray-700 border border-gray-200"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentSlide / images.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {Math.round((currentSlide / images.length) * 100)}%
            </span>
          </div>

          {/* Controls Info */}
          <div className="text-gray-400 text-xs hidden lg:block">
            Use arrow keys or swipe to navigate
          </div>
        </div>
      </div>

      {/* Custom Pagination Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet-custom {
          width: 10px;
          height: 10px;
          background: #d1d5db;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
          margin: 0 3px;
          border: 1px solid #e5e7eb;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: #3b82f6;
          transform: scale(1.2);
          border-color: #3b82f6;
        }
        
        .swiper-pagination {
          bottom: 80px !important;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};
// @ts-ignore
const MediaContent = ({ subconceptData, currentUnitId }) => {
  const [playedPercentage, setPlayedPercentage] = useState(0);
  // @ts-ignore
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isComplete, setIsComplete] = useState(
    !(
      subconceptData?.subconceptType?.startsWith("assessment") ||
      subconceptData?.subconceptType?.startsWith("assignment_image") ||
      subconceptData?.subconceptType?.startsWith("pdf") ||
      subconceptData?.subconceptType?.startsWith("assignment_pdf") ||
      subconceptData?.subconceptType?.startsWith("image") ||
      subconceptData?.subconceptType?.startsWith("youtube")
    )
  );
  const contentRef = useRef(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorCountdown, setErrorCountdown] = useState(3);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isAssignmentUploadSuccesfull, setIsAssignmentUploadSuccesfull] =
    useState(false);
  // const [isRetryPopupOpen, setIsRetryPopupOpen] = useState(false);
  const [isAssessmentIntegrityChecked, setIsAssessmentIntegrityChecked] =
    useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const [scorePercentage, setScorePercentage] = useState<null | number>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [assignmentData, setAssignmentData] = useState<{
    not_corrected?: any;
    corrected?: any;
    corrected_with_file?: any;
  }>({});
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isAssignmentStatusModalOpen, setIsAssignmentStatusModalOpen] =
    useState(false);

  // const handleContentLoaded = () => {
  //   setIsComplete(false); // Enable the "Complete" button when content is fully loaded
  // };

  const appendParamsToUrl = (url, userId, cohortId) => {
    const urlObj = new URL(url); // Parse the URL
    const params = urlObj.searchParams; // Get the query parameters

    // Dynamically find the keys for userId and cohortId
    const keys = [...params.keys()]; // Get all query parameter keys
    if (keys.length < 2) {
      console.error("URL does not have enough entry parameters.");
      return url;
    }

    // Assign userId and cohortId to the first and second keys
    params.set(keys[0], userId); // Set the first entry
    params.set(keys[1], cohortId); // Set the second entry

    // Return the modified URL
    return urlObj.toString();
  };

  const openAssessment = () => {
    window.open(
      subconceptData?.subconceptLink + "=" + userData?.userId,
      "_blank"
    );
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/assignments/user-assignment?userId=${userData?.userId}&subconceptId=${subconceptData?.subconceptId}`
        );

        const data = response.data;

        const formattedData = {
          status: data.status, // "not_corrected" | "corrected"
          submittedFile: {
            name: data.submittedFile.fileName,
            downloadUrl: data.submittedFile.downloadUrl,
          },
          correctedFile: data.correctedFile
            ? {
                name: data.correctedFile.fileName,
                downloadUrl: data.correctedFile.downloadUrl,
              }
            : undefined,
          score: data.score,
          remarks: data.remarks,
        };

        // Categorize the data based on its status
        if (data.status === "not_corrected") {
          setAssignmentData((prev) => ({
            ...prev,
            not_corrected: formattedData,
          }));
          setCurrentStatus("not_corrected");
        } else if (data.status === "corrected" && data.correctedFile) {
          setAssignmentData((prev) => ({
            ...prev,
            corrected_with_file: formattedData,
          }));
          setCurrentStatus("corrected_with_file");
        } else if (data.status === "corrected") {
          setAssignmentData((prev) => ({
            ...prev,
            corrected: formattedData,
          }));
          setCurrentStatus("corrected");
        }
        setIsAssignmentStatusModalOpen(true); // Open modal when data is ready
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    if (
      userData?.userId &&
      subconceptData?.subconceptType?.toLowerCase().startsWith("assignment")
    )
      fetchAssignment();
  }, [userData?.userId]);

  useEffect(() => {
    if (isAssignmentUploadSuccesfull) {
      // handleComplete();
      setShowSuccessPopup(true);
      setSuccessCountdown(3); // Reset success countdown
    }
  }, [isAssignmentUploadSuccesfull]);

  // useEffect(() => {
  //   if (subconceptData?.subconceptType.startsWith("assessment")) {
  //     // Show the popup after a short delay
  //     const timer = setTimeout(() => setShowAlert(true), 500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [subconceptData]);

  // Handle countdown for success overlay
  // useEffect(() => {
  //   if (
  //     showSuccessPopup &&
  //     successCountdown > 0 &&
  //     ["assessment", "assignment"].some((type) =>
  //       subconceptData?.subconceptType?.startsWith(type)
  //     )
  //   ) {
  //     const interval = setInterval(() => {
  //       setSuccessCountdown((prev) => prev - 1);
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   } else if (successCountdown <= 0) {
  //     navigate(`/subconcepts/${userData?.unitId}`);
  //   }
  // }, [showSuccessPopup, successCountdown]);

  // Handle countdown for error overlay
  useEffect(() => {
    if (showErrorPopup && errorCountdown > 0) {
      const interval = setInterval(() => {
        setErrorCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (errorCountdown <= 0) {
      setShowErrorPopup(false); // Close error overlay after countdown
    }
  }, [showErrorPopup, errorCountdown]);

  useEffect(() => {
    if (
      subconceptData.subconceptType === "audio" ||
      subconceptData.subconceptType === "video" ||
      subconceptData.subconceptType === "assignment_audio" ||
      subconceptData.subconceptType === "assignment_video"
    ) {
      const contentElement = contentRef.current;
      //@ts-ignore
      contentElement.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        // @ts-ignore
        contentElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [subconceptData]);

  const handleTimeUpdate = () => {
    const contentElement = contentRef.current;
    // @ts-ignore
    const playedTime = contentElement.currentTime;
    // @ts-ignore
    const totalTime = contentElement.duration;
    const percentage = (playedTime / totalTime) * 100;
    setPlayedPercentage(percentage);

    // Check if percentage exceeds 80 and update state
    if (percentage > 80 && isComplete) {
      setIsComplete(false);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    if (
      subconceptData.subconceptType === "audio" ||
      subconceptData.subconceptType === "video" ||
      subconceptData.subconceptType === "assignment_audio" ||
      subconceptData.subconceptType === "assignment_video"
    ) {
      // @ts-ignore
      contentRef.current.pause();
    }
    sendAttemptData(userData);
  };

  const handleGoBack = () => {
    navigate(`/subconcepts/${userData?.unitId}`);
  };
  // @ts-ignore
  const sendAttemptData = (userData) => {
    const finalScore =
      subconceptData?.subconceptType?.startsWith("assignment") ||
      subconceptData?.subconceptType?.startsWith("assessment")
        ? 0
        : subconceptData?.subconceptType === "video" ||
          subconceptData?.subconceptType === "audio"
        ? playedPercentage >= 80
          ? subconceptData?.subconceptMaxscore
          : 0
        : subconceptData?.subconceptMaxscore;

    // checking if subconceptMaxscore is 0 and setting scorePercentage to 100 otherwise low score variant of activity completion modal will be shown which is not correct

    setScorePercentage(
      subconceptData?.subconceptMaxscore == 0 ||
        ["assignment", "assessment"].some((type) =>
          subconceptData?.subconceptType?.toLowerCase().startsWith(type)
        )
        ? 100
        : (finalScore / subconceptData?.subconceptMaxscore) * 100
    );

    const date = new Date();
    const ISTOffset = 5.5 * 60 * 60 * 1000;
    const ISTTime = new Date(date.getTime() + ISTOffset);
    const formattedISTTimestamp = ISTTime.toISOString().slice(0, 19);

    const payload = {
      userAttemptFlag: true,
      userAttemptScore: finalScore,
      userAttemptStartTimestamp: userData.userAttemptStartTimestamp,
      userAttemptEndTimestamp: formattedISTTimestamp,
      unitId: userData.unitId,
      programId: userData.programId,
      stageId: userData.stageId,
      userId: userData.userId,
      sessionId: userData.sessionId,
      subconceptId: userData.subconceptId,
      cohortId: userData.cohortId,
    };

    fetch(`${userData.API_BASE_URL}/user-attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Data sent successfully", data);
        setShowSuccessPopup(true);
        setSuccessCountdown(3); // Reset success countdown
      })
      .catch((error) => {
        console.error("Error:", error);

        // if (subconceptData?.subconceptType === "assignment" && retryCount < 1) {
        //   setRetryCount((prev) => prev + 1);
        //   sendAttemptData(userData);
        // } else {
          setShowErrorPopup(true);
          setErrorCountdown(5); // Reset error countdown
          setIsComplete(false);
        // }
      });
  };

  const handleUploadSuccess = () => {
    setIsAssignmentUploadSuccesfull(true); // Trigger useEffect
  };
  // @ts-ignore
  const renderOverlay = (type) => {
    const countdown = type === "success" ? successCountdown : errorCountdown;
    const title =
      type === "success"
        ? "Next Activity Unlocked"
        : "Oops! Something went wrong";
    const message =
      type === "success"
        ? "You have unlocked the next activity."
        : "You need to attempt this activity again.";
    const color = type === "success" ? "#90EE90" : "#FF7F7F";

    return (
      <div className="fixed inset-0 bg-opacity-70 z-50 flex items-center justify-center animate-fadeIn">
        <div
          className="text-center shadow-lg max-w-sm w-full"
          style={{
            backgroundColor: "#375368",
            borderColor: "#375368",
            minWidth: "300px",
            minHeight: "180px",
            borderRadius: "4px",
            boxShadow: "0 0 12px rgba(0, 0, 0, 0.6)",
          }}
        >
          <p
            className="mb-2 tracking-wide text-gray-100"
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textShadow: "0 1px 0 #f3f3f3",
              fontFamily: "'OpenSans-Regular', sans-serif",
              lineHeight: "1.3",
              padding: "15px 0px",
              borderBottom: "1px solid #ffffff",
            }}
          >
            {title}
          </p>
          <h4
            className="mt-4 tracking-wide"
            style={{
              color: color,
              fontSize: "20px",
              fontWeight: "bold",
              textShadow: "0 1px 0 #f3f3f3",
              fontFamily: "'OpenSans-Regular', sans-serif",
            }}
          >
            {type === "success" ? "Hurrah! 😄" : "Try again 😥"}
          </h4>
          <p
            className="mt-4 text-gray-100"
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              textShadow: "0 1px 0 #f3f3f3",
              fontFamily: "'OpenSans-Regular', sans-serif",
              lineHeight: "1.3",
              padding: "0px 20px",
            }}
          >
            {message}
          </p>
          <p
            className="mt-2 mb-4"
            style={{
              color: "#B0B0B0",
              fontSize: "13px",
              fontWeight: "normal",
              fontFamily: "'OpenSans-Regular', sans-serif",
              lineHeight: "1.3",
            }}
          >
            Closing in <span style={{ fontWeight: "bold" }}>{countdown}</span>{" "}
            seconds.
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const { subconceptType, subconceptLink } = subconceptData;
    switch (subconceptType) {
      case "audio":
      case "assignment_audio":
        return (
          <audio
            // onLoadedData={handleContentLoaded}
            ref={contentRef}
            controls
            controlsList="nodownload" // Restrict download
            onContextMenu={(e) => e.preventDefault()} // Block right-click menu
            className="border-2 border-black rounded-md shadow-md w-full h-[300px] "
          >
            <source src={subconceptLink} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
      case "assignment_video":
        return (
          <video
            // onLoadedData={handleContentLoaded} // Called when video is loaded
            ref={contentRef}
            controls
            controlsList="nodownload" // Restrict download
            onContextMenu={(e) => e.preventDefault()} // Block right-click menu
            className="border-2 border-black rounded-md shadow-md max-h-[60vh]"
          >
            <source src={subconceptLink} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        );
      // In the renderContent function, modify the image case:
case "image":
case "assignment_image":
  return (
    <div className="flex flex-col items-center">
      <img
        // onLoad={handleContentLoaded}
        src={subconceptLink}
        alt="Image content"
        style={{
          maxWidth: "100%",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
        onContextMenu={(e) => e.preventDefault()} // Block right-click menu
      />
      {subconceptData?.subconceptType === "assignment_image" && (
        <Button
          onClick={() => {
            const link = document.createElement('a');
            link.href = subconceptLink;
            link.download = `assignment_${subconceptData?.subconceptId || 'image'}`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="mt-4 bg-[#00A66B] hover:bg-green-600 text-white px-4 py-2 rounded-[5px] text-sm transition-all"
        >
          Download Assignment
        </Button>
      )}
    </div>
  );
      case "pdf":
      case "assignment_pdf":
      case "youtube":
        return (
          <div
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
            className={`${
              subconceptData?.subconceptType?.toLowerCase() === "youtube" &&
              "w-11/12"
            } iframe-wrapper w-full`}
            style={{ position: "relative" }}
          >
            <iframe
              // onLoad={handleContentLoaded}
              className="h-[calc(100vh-300px)]"
              src={`${subconceptLink}#toolbar=0`} // Disable PDF toolbar
              width="100%"
              // height=""
              title="YouTube Video"
              style={{
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                // pointerEvents: "none",
              }}
              // onContextMenu={(e) => e.preventDefault()} // Block right-click menu
              // @ts-ignore
              // controlsList="nodownload" // Restrict download
            />
          </div>
        );
      case "assessment":
        const updatedUrl = appendParamsToUrl(
          subconceptData?.subconceptLink,
          userData?.userId,
          userData?.cohortId
        );
        return (
          <iframe
            src={updatedUrl} // Disable PDF toolbar
            width="100%"
            height="600px"
            title="PDF Document"
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              // pointerEvents: "none",
            }}
            // onContextMenu={(e) => e.preventDefault()} // Block right-click menu
            // @ts-ignore
            // controlsList="nodownload" // Restrict download
          />
        );
      default:
        return <p>Something went wrong!</p>;
    }
  };

  return (
    <>
      <AssignmentStatusModal
        isOpen={isAssignmentStatusModalOpen}
        onClose={() => setIsAssignmentStatusModalOpen(false)}
        assignment={
          currentStatus === "not_corrected"
            ? assignmentData.not_corrected
            : currentStatus === "corrected"
            ? assignmentData.corrected
            : assignmentData.corrected_with_file
        }
        subconceptMaxscore={subconceptData?.subconceptMaxscore}
      />

      {/* {showSuccessPopup ? (
        !["assessment", "assignment"].some((type) =>
          subconceptData?.subconceptType?.startsWith(type)
        ) ? (
          <ActivityCompletionModal
            countdownDuration={3}
            onClose={() => navigate(`/subconcepts/${currentUnitId}`)}
            scorePercentage={scorePercentage}
          />
        ) : (
          renderOverlay("success")
        )
      ) : null} */}
      {showSuccessPopup ? (
        <ActivityCompletionModal
          countdownDuration={3}
          onClose={() => navigate(`/subconcepts/${currentUnitId}`)}
          scorePercentage={
            ["assignment", "assessment"].some((type) =>
              subconceptData?.subconceptType?.toLowerCase().startsWith(type)
            )
              ? 100
              : scorePercentage
          }
          subconceptType={subconceptData?.subconceptType}
        />
      ) : null}
      {showErrorPopup && renderOverlay("error")}
      {/* Rest of the component */}
      {/* @ts-ignore */}
      <div
        className="bg-gradient-to-b from-[#CAF3BC] to-white text-center font-sans text-gray-800 w-full fixed"
        style={{
          backgroundImage: "url('/images/cohort-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <h1 className="pt-6 text-2xl md:text-3xl lg:text-4xl font-bold text-[#2C3E50]">
          {subconceptData?.subconceptType === "video" ||
          subconceptData?.subconceptType === "youtube"
            ? "Watch the video"
            : subconceptData?.subconceptType === "audio"
            ? "Listen to the audio"
            : subconceptData?.subconceptType === "pdf"
            ? "Read the PDF"
            : subconceptData?.subconceptType === "image"
            ? "Observe the image"
            : `Complete ${
                subconceptData?.subconceptType.startsWith("assignment")
                  ? "your assignment"
                  : subconceptData?.subconceptType.startsWith("assessment")
                  ? "the assessment"
                  : "the activity"
              }`}
        </h1>

        {/* <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess} // Pass callback
        /> */}
        <div
          id="contentArea"
          className={`mb-6 mt-4 mx-auto p-4 sm:p-6 md:pb-24 flex justify-center items-center ${
            ["assessment", "video", "assignment_video", "youtube"].includes(
              subconceptData?.subconceptType
            )
              ? "w-11/12 flex justify-center items-center"
              : subconceptData?.subconceptType === "pdf" || subconceptData?.subconceptType === "assignment_pdf" || subconceptData?.subconceptType === "pdfAsPpt"
              ? "w-full px-2"
              : "w-11/12 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          } rounded-lg overflow-y-auto max-h-[calc(100vh-200px)] no-scrollbar`}
        >
          {renderContent()}
        </div>
        <div
          className={` bg-white ${
            subconceptData?.subconceptType === "pdf" ||
            subconceptData?.subconceptType === "assignment_pdf"
              ? "sticky"
              : "fixed w-full"
          } flex-col bottom-0 flex justify-center gap-2 flex-wrap p-1 shadow-lg before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-b before:from-gray-300 before:to-transparent before:rounded-t-md z-10`}
        >
          {subconceptData?.subconceptType === "assessment" && (
            <div className="flex justify-center items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="agreement"
                checked={isAssessmentIntegrityChecked}
                onChange={(e) =>
                  setIsAssessmentIntegrityChecked(e.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agreement" className="text-sm text-gray-700 py-1">
                I agree that I have submitted the Google Form response for this
                activity.
              </label>
            </div>
          )}
          <div className="flex items-center justify-between sm:justify-center py-2 px-2 sm:gap-20">
            {subconceptData?.subconceptType.startsWith("assignment") ? (
              subconceptData?.completionStatus === "ignored" ? (
                <FileUploaderRecorder onUploadSuccess={handleUploadSuccess} />
              ) : (
                <Button
                  onClick={() => setIsAssignmentStatusModalOpen(true)}
                  disabled={isAssignmentStatusModalOpen}
                  className="bg-[#00A66B] hover:bg-green-600 text-white rounded-[5px]"
                >
                  View Assignment status
                </Button>
              )
            ) : (
              <Button
                onClick={() => {
                  subconceptData?.subconceptType.startsWith("assignment")
                    ? setIsUploadModalOpen(true)
                    : handleComplete();
                }}
                disabled={
                  subconceptData?.subconceptType.startsWith("assessment")
                    ? !isAssessmentIntegrityChecked
                    : isComplete
                }
                className={`${
                  (subconceptData?.subconceptType.startsWith("assessment") &&
                    !isAssessmentIntegrityChecked) ||
                  isComplete
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#00A66B] hover:bg-green-600"
                } text-white px-3 py-2 sm:px-4 sm:py-3 m-1 sm:m-2 rounded-[5px] text-sm sm:text-base md:text-lg transition-all max-w-[150px] sm:max-w-[200px]`}
              >
                {subconceptData?.subconceptType
                  ?.toLowerCase()
                  .startsWith("assignment")
                  ? "Upload assignment"
                  : "Complete"}
              </Button>
            )}

            {/* <button
              onClick={handleGoBack}
              className="bg-[#00A66B] hover:bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-3 m-1 sm:m-2 rounded-[2px] text-sm sm:text-base md:text-lg transition-all max-w-[150px] sm:max-w-[200px]"
            >
              Go Back
            </button> */}
            <Button
              onClick={handleGoBack}
              className="bg-[#00A66B] hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base md:text-lg max-w-[150px] sm:max-w-[200px] rounded-[5px]"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MediaContent;
