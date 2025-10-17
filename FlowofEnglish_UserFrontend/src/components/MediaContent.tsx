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
import Tesseract from 'tesseract.js';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Types
interface UserData {
  userId: string;
  unitId: string;
  programId: string;
  stageId: string;
  sessionId: string;
  cohortId: string;
  subconceptId: string;
  userAttemptStartTimestamp: string;
  API_BASE_URL: string;
}

interface SubconceptData {
  subconceptType: string;
  subconceptLink: string;
  subconceptId: string;
  subconceptMaxscore: number;
  completionStatus?: string;
}

interface MediaContentProps {
  subconceptData: SubconceptData;
  currentUnitId: string;
}

interface AssignmentData {
  status?: string;
  submittedFile?: {
    name: string;
    downloadUrl: string;
  };
  correctedFile?: {
    name: string;
    downloadUrl: string;
  };
  score?: number;
  remarks?: string;
}

interface AudioEvaluationResult {
  scores: {
    image_relevance: number;
    content_accuracy: number;
    grammar_pronunciation: number;
    vocabulary: number;
    communication_clarity: number;
    creativity: number;
    completeness: number;
    total: number;
    max_possible_score: number;
    weight_distribution: Record<string, number>;
  };
  feedback: Record<string, string>;
  suggestions: string[];
  transcription: string;
  image_description: string;
  instructions: string;
}

// Helper: Extract instructions from image using OCR
async function extractInstructionsFromImage(imageUrl: string): Promise<string> {
  try {
    console.log(imageUrl)
    const result = await Tesseract.recognize(imageUrl, 'eng');
    return result.data.text;
  } catch (err) {
    console.error('OCR failed:', err);
    return '';
  }
}

// Helper: Parse instructions and determine rubric weights
function getDynamicRubricWeights(instructions: string) {
  const weights = {
    completeness: 3,
    image_relevance: 2,
    content_accuracy: 1.5,
    grammar_pronunciation: 1,
    vocabulary: 1,
    communication_clarity: 1,
    creativity: 1,
  };

  if (/(\d+)\s+sentences?/i.test(instructions)) {
    weights.completeness += 2;
  }
  if (/describe|explain|tell about/i.test(instructions)) {
    weights.image_relevance += 1;
    weights.vocabulary += 0.5;
  }
  if (/list|mention|identify/i.test(instructions)) {
    weights.content_accuracy += 1;
    weights.completeness += 1;
  }
  if (/details|specific/i.test(instructions)) {
    weights.content_accuracy += 1;
    weights.image_relevance += 0.5;
  }
  if (/speak clearly|pronounce/i.test(instructions)) {
    weights.grammar_pronunciation += 1;
    weights.communication_clarity += 0.5;
  }
  return weights;
}

// Browser-style PDF Viewer Component
const PDFBrowserViewer = ({ pdfUrl, onContentLoaded }: { pdfUrl: string; onContentLoaded?: () => void }) => {
  const { images, totalPages, loading, error, progress } = usePdfToImages(pdfUrl);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.2);
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
                  imageRendering: 'auto',
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

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-gray-800 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
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

          <div className="text-gray-400 text-xs hidden lg:block">
            Use arrow keys or swipe to navigate
          </div>
        </div>
      </div>

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

const MediaContent: React.FC<MediaContentProps> = ({ subconceptData, currentUnitId }) => {
  const [playedPercentage, setPlayedPercentage] = useState(0);
  const userData: UserData = JSON.parse(localStorage.getItem("userData") || "{}");
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
  const contentRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorCountdown, setErrorCountdown] = useState(3);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isAssignmentUploadSuccesfull, setIsAssignmentUploadSuccesfull] = useState(false);
  const [isAssessmentIntegrityChecked, setIsAssessmentIntegrityChecked] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const [scorePercentage, setScorePercentage] = useState<null | number>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [assignmentData, setAssignmentData] = useState<{
    not_corrected?: AssignmentData;
    corrected?: AssignmentData;
    corrected_with_file?: AssignmentData;
  }>({});
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [isAssignmentStatusModalOpen, setIsAssignmentStatusModalOpen] = useState(false);

  // Audio evaluation states
  const [isEvaluatingAudio, setIsEvaluatingAudio] = useState(false);
  const [audioEvaluationResult, setAudioEvaluationResult] = useState<AudioEvaluationResult | null>(null);
  const [showAudioEvaluationModal, setShowAudioEvaluationModal] = useState(false);
  const [audioEvaluationError, setAudioEvaluationError] = useState<string | null>(null);
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const appendParamsToUrl = (url: string, userId: string, cohortId: string): string => {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      const keys = [...params.keys()];
      
      if (keys.length < 2) {
        console.error("URL does not have enough entry parameters.");
        return url;
      }

      params.set(keys[0], userId);
      params.set(keys[1], cohortId);

      return urlObj.toString();
    } catch (error) {
      console.error("Invalid URL:", error);
      return url;
    }
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
    
    console.log('Raw API response:', data);
    
    // If no assignment found, don't proceed
    if (!data || data.status === 'not_found' || data.message === 'No assignment found for this user and subconcept') {
      console.log("No assignment found for this user and subconcept");
      return; // DON'T open the modal
    }

    // Safe data extraction
    const formattedData: AssignmentData = {
      status: data.status || 'not_submitted',
      submittedFile: data.submittedFile ? {
        name: data.submittedFile.fileName || data.submittedFile.name || 'Unknown file',
        downloadUrl: data.submittedFile.downloadUrl || data.submittedFile.url || ''
      } : undefined,
      correctedFile: data.correctedFile ? {
        name: data.correctedFile.fileName || data.correctedFile.name || 'Corrected file',
        downloadUrl: data.correctedFile.downloadUrl || data.correctedFile.url || ''
      } : undefined,
      score: data.score || data.marks || 0,
      remarks: data.remarks || data.feedback || ''
    };

    console.log('Formatted assignment data:', formattedData);

    // Update assignment data based on status
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
    
    // Only open modal if there's actual assignment data with valid status
    if (data.status && data.status !== 'not_found' && data.status !== 'not_submitted') {
      setIsAssignmentStatusModalOpen(true);
    }
  } catch (error) {
    console.error("Error fetching assignment:", error);
    // Don't show error for 404 - it just means no assignment submitted yet
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log("No assignment found for this user and subconcept");
      } else {
        console.error("Assignment fetch error:", error.response?.data);
      }
    }
  }
};
    if (
      userData?.userId &&
      subconceptData?.subconceptType?.toLowerCase().startsWith("assignment")
    ) {
      fetchAssignment();
    }
  }, [userData?.userId, subconceptData?.subconceptId, subconceptData?.subconceptType]);

  useEffect(() => {
    if (isAssignmentUploadSuccesfull) {
      setShowSuccessPopup(true);
      setSuccessCountdown(3);
    }
  }, [isAssignmentUploadSuccesfull]);

  useEffect(() => {
    if (showErrorPopup && errorCountdown > 0) {
      const interval = setInterval(() => {
        setErrorCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (errorCountdown <= 0) {
      setShowErrorPopup(false);
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
      if (contentElement) {
        contentElement.addEventListener("timeupdate", handleTimeUpdate);
        return () => {
          contentElement.removeEventListener("timeupdate", handleTimeUpdate);
        };
      }
    }
  }, [subconceptData]);

  const handleTimeUpdate = () => {
    const contentElement = contentRef.current;
    if (contentElement) {
      const playedTime = contentElement.currentTime;
      const totalTime = contentElement.duration;
      if (totalTime > 0) {
        const percentage = (playedTime / totalTime) * 100;
        setPlayedPercentage(percentage);

        if (percentage > 80 && isComplete) {
          setIsComplete(false);
        }
      }
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
      contentRef.current?.pause();
    }
    sendAttemptData(userData);
  };

  const handleGoBack = () => {
    navigate(`/subconcepts/${userData?.unitId}`);
  };

  const sendAttemptData = (userData: UserData) => {
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
        setSuccessCountdown(3);
      })
      .catch((error) => {
        console.error("Error:", error);
        setShowErrorPopup(true);
        setErrorCountdown(5);
        setIsComplete(false);
      });
  };

  const handleUploadSuccess = () => {
    setIsAssignmentUploadSuccesfull(true);
  };

  // Audio evaluation helper functions
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      // Add cache busting to avoid CORS issues
      const urlWithCacheBust = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      
      const response = await fetch(urlWithCacheBust, {
        mode: 'cors',
        headers: {
          'Accept': 'image/*',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      return blobToBase64(blob);
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const evaluateImageAudio = async (audioBlob: Blob, imageUrl: string, subconceptData: SubconceptData): Promise<AudioEvaluationResult> => {
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      
      // FIX: Use the actual assessment image URL passed as parameter
      const imageBase64 = await imageUrlToBase64(imageUrl);

      // FIX: Use the same assessment image URL for OCR extraction
      const instructions = await extractInstructionsFromImage(imageUrl);
      const rubricWeights = getDynamicRubricWeights(instructions);

      const prompt = `You are an English language teacher who wants to evaluate creativity, conciseness, completeness, 
      correctness in the response. Analyze the student's audio response in relation to the provided image and its instructions.

EVALUATION CONTEXT:
- Student was given an image to observe
- The image contains instructions: "${instructions.trim()}"
- Student recorded an audio response describing or responding to this image
- Evaluate how well the audio response relates to the image content and instructions
- Evaluate how creative and interesting the user response was

SCORING CRITERIA (1-10 each, weighted by importance):
1. Completeness (${rubricWeights.completeness}x): Did the student fully follow ALL instructions? This is the most critical criterion.
2. Image Relevance (${rubricWeights.image_relevance}x): How well does the response relate to what's shown in the image?
3. Content Accuracy (${rubricWeights.content_accuracy}x): Are the details mentioned accurate and specific to the image?
4. Grammar & Pronunciation (${rubricWeights.grammar_pronunciation}x): Quality of English grammar and pronunciation
5. Vocabulary (${rubricWeights.vocabulary}x): Appropriate and varied use of vocabulary
6. Communication Clarity (${rubricWeights.communication_clarity}x): Overall clarity and fluency of communication
7. Creativity (${rubricWeights.creativity}x, out of 15): How original and engaging was the response?

Important Note: Prioritize checking if ALL instructions were followed before evaluating other aspects.

Return in valid JSON format:
{
  "scores": {
    "image_relevance": [1-10],
    "content_accuracy": [1-10],
    "grammar_pronunciation": [1-10],
    "vocabulary": [1-10],
    "communication_clarity": [1-10],
    "creativity": [1-15],
    "completeness": [1-10],
    "total": [weighted sum calculated as: (completeness_score * completeness_weight + image_relevance_score * image_relevance_weight + content_accuracy_score * content_accuracy_weight + grammar_pronunciation_score * grammar_pronunciation_weight + vocabulary_score * vocabulary_weight + communication_clarity_score * communication_clarity_weight + creativity_score * creativity_weight) / sum of all weights],
    "max_possible_score": [maximum possible weighted score],
    "weight_distribution": {
      "completeness_weight": ${rubricWeights.completeness},
      "image_relevance_weight": ${rubricWeights.image_relevance},
      "content_accuracy_weight": ${rubricWeights.content_accuracy},
      "grammar_pronunciation_weight": ${rubricWeights.grammar_pronunciation},
      "vocabulary_weight": ${rubricWeights.vocabulary},
      "communication_clarity_weight": ${rubricWeights.communication_clarity},
      "creativity_weight": ${rubricWeights.creativity}
    }
  },
  "feedback": {
    "image_relevance": "feedback on image relevance",
    "content_accuracy": "feedback on content accuracy",
    "grammar_pronunciation": "feedback on grammar and pronunciation",
    "vocabulary": "feedback on vocabulary",
    "communication_clarity": "feedback on clarity",
    "completeness": "feedback on completeness",
    "creativity": "feedback on creativity"
  },
  "suggestions": [
    "improvement tip 1",
    "improvement tip 2",
    "improvement tip 3"
  ],
  "transcription": "transcribed audio content if possible",
  "image_description": "brief description of what you see in the image",
  "instructions": "the instructions extracted from the image"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                },
                {
                  inline_data: {
                    mime_type: "audio/ogg",
                    data: audioBase64
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 4096,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error('Image-Audio evaluation failed:', error);
      throw error;
    }
  };

  const handleImageAudioEvaluation = async (audioBlob: Blob): Promise<boolean> => {
    // Only trigger for assignment_image type
    if (subconceptData?.subconceptType !== "assignment_image") {
      return true;
    }

    setIsEvaluatingAudio(true);
    setShowAudioEvaluationModal(true);
    setAudioEvaluationError(null);
    
    // FIX: Use the actual current assessment image URL from subconceptData
    const currentAssessmentImageUrl = subconceptData?.subconceptLink;
    setCurrentImageUrl(currentAssessmentImageUrl);
    
    try {
      // FIX: Pass the actual current assessment image URL to the evaluation function
      const evaluation = await evaluateImageAudio(audioBlob, currentAssessmentImageUrl, subconceptData);
      setIsEvaluatingAudio(false);
      setAudioEvaluationResult(evaluation);
      
      const audioFile = new File([audioBlob], `audio-response-${Date.now()}.ogg`, {
        type: audioBlob.type
      });
      setCurrentAudioFile(audioFile);
      
      return true;
      
    } catch (error: any) {
      setIsEvaluatingAudio(false);
      setAudioEvaluationError(error.message || "Evaluation failed");
      return false;
    }
  };

  const handleCloseAudioEvaluation = () => {
    setShowAudioEvaluationModal(false);
    setAudioEvaluationResult(null);
    setAudioEvaluationError(null);
    setCurrentAudioFile(null);
  };

  const handleRetryAudioEvaluation = () => {
    setShowAudioEvaluationModal(false);
    setAudioEvaluationResult(null);
    setAudioEvaluationError(null);
  };

  const handleSubmitAudioEvaluation = (): boolean => {
    try {
      if (!audioEvaluationResult) {
        return false;
      }

      const evaluationPercentage = ((audioEvaluationResult.scores.total / audioEvaluationResult.scores.max_possible_score) * 100);
      const actualScore = (evaluationPercentage * Number(subconceptData?.subconceptMaxscore)) / 100;
      const roundedScore = Math.round(actualScore);
      
      localStorage.setItem('audioEvaluationScore', roundedScore.toString());
      
      setShowAudioEvaluationModal(false);
      return true;
    } catch (error) {
      console.error('Error in handleSubmitAudioEvaluation:', error);
      return false;
    }
  };

  const renderOverlay = (type: "success" | "error") => {
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
            ref={contentRef}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="border-2 border-black rounded-md shadow-md w-full h-[300px]"
          >
            <source src={subconceptLink} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
      case "assignment_video":
        return (
          <video
            ref={contentRef}
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="border-2 border-black rounded-md shadow-md max-h-[60vh]"
          >
            <source src={subconceptLink} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        );
      case "image":
      case "assignment_image":
        return (
          <div className="flex flex-col items-center">
            <img
              src={subconceptLink}
              alt="Image content"
              style={{
                maxWidth: "100%",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
              onContextMenu={(e) => e.preventDefault()}
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
        return (
          <div className="w-full">
              <PDFBrowserViewer
                pdfUrl={subconceptLink}
                onContentLoaded={() => {}}
              />
            </div>
          );
      case "pdfAsPpt":
        return (
          <div className="w-full">
            <PDFSlideViewer
              pdfUrl={subconceptLink}
              onContentLoaded={() => {}}
            />
          </div>
        );
      case "youtube":
        return (
          <div
            onContextMenu={(e) => e.preventDefault()}
            className="w-11/12 iframe-wrapper"
            style={{ position: "relative" }}
          >
            <iframe
              className="h-[calc(100vh-300px)]"
              src={`${subconceptLink}#toolbar=0`}
              width="100%"
              title="YouTube Video"
              style={{
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
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
            src={updatedUrl}
            width="100%"
            height="600px"
            title="PDF Document"
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
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

      {showSuccessPopup && (
        <ActivityCompletionModal
          countdownDuration={3}
          onClose={() => navigate(`/subconcepts/${currentUnitId}`)}
          scorePercentage={
            ["assignment", "assessment"].some((type) =>
              subconceptData?.subconceptType?.toLowerCase().startsWith(type)
            )
              ? 100
              : scorePercentage || 0
          }
          subconceptType={subconceptData?.subconceptType}
        />
      )}
      
      {showErrorPopup && renderOverlay("error")}

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
                <FileUploaderRecorder 
                  onUploadSuccess={handleUploadSuccess}
                  onImageAudioEvaluation={handleImageAudioEvaluation}
                  subconceptType={subconceptData?.subconceptType}
                />
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

            <Button
              onClick={handleGoBack}
              className="bg-[#00A66B] hover:bg-green-600 text-white px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base md:text-lg max-w-[150px] sm:max-w-[200px] rounded-[5px]"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Evaluation Loading Modal */}
      {showAudioEvaluationModal && isEvaluatingAudio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="w-full h-full border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Evaluating Your Response</h3>
              <p className="text-gray-600">Analyzing your audio response with the image context...</p>
            </div>
            <button
              onClick={handleCloseAudioEvaluation}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Audio Evaluation Result Modal */}
      {showAudioEvaluationModal && !isEvaluatingAudio && audioEvaluationResult && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="bg-gray-50 rounded-t-2xl p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Audio Response Evaluation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Assignment Image</h4>
                  <img src={currentImageUrl || ''} alt="Assignment" className="w-full h-48 object-cover rounded-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Your Audio Response</h4>
                  {currentAudioFile && (
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(currentAudioFile)} type="audio/ogg" />
                    </audio>
                  )}
                  {audioEvaluationResult.transcription && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Transcription:</strong> {audioEvaluationResult.transcription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {((audioEvaluationResult.scores.total / audioEvaluationResult.scores.max_possible_score) * 100).toFixed(1)}%
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Overall Score</p>
                  <p className="text-sm text-gray-500">
                    Based on weighted criteria with emphasis on completion and relevance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Detailed Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'completeness', label: 'Completeness (Primary)' },
                    { key: 'image_relevance', label: 'Image Relevance (Secondary)' },
                    { key: 'content_accuracy', label: 'Content Accuracy' },
                    { key: 'grammar_pronunciation', label: 'Grammar & Pronunciation' },
                    { key: 'vocabulary', label: 'Vocabulary' },
                    { key: 'communication_clarity', label: 'Communication Clarity' },
                    { key: 'creativity', label: 'Creativity' }
                  ].map(({ key, label }) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{label}</span>
                        <span className="text-lg font-bold text-blue-600">
                          {audioEvaluationResult.scores[key]}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {audioEvaluationResult.feedback[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {audioEvaluationResult.suggestions && audioEvaluationResult.suggestions.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Suggestions for Improvement</h4>
                  <div className="space-y-3">
                    {audioEvaluationResult.suggestions.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 leading-relaxed">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {audioEvaluationResult.image_description && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">What AI Sees in the Image</h4>
                  <div className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400">
                    <p className="text-green-800 leading-relaxed">{audioEvaluationResult.image_description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-b-2xl p-6 border-t border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={handleSubmitAudioEvaluation}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Evaluation Error Modal */}
      {showAudioEvaluationModal && !isEvaluatingAudio && audioEvaluationError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Evaluation Failed</h3>
              <p className="text-gray-600 mb-4">We couldn't evaluate your audio response. Please try again.</p>
              <p className="text-sm text-red-600">{audioEvaluationError}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRetryAudioEvaluation}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleCloseAudioEvaluation}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaContent;