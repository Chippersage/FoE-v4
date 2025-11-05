// components/ContentRenderer.tsx
import React, { useState, useEffect } from 'react';
import QuizActivity from "./ActivityComponents/QuizActitivy";
import PDFRenderer from './PDFRenderer';
import { BookOpen, Mic,  FileText } from 'lucide-react';
// import { BookOpen, Mic, ExternalLink, Clock, CheckCircle, FileText } from 'lucide-react';

interface ContentRendererProps {
  type: string;
  url: string;
  title?: string;
  className?: string;
}

// Configuration for different content types (only for redirect types)
// const contentConfig = {
//   medium: {
//     icon: BookOpen,
//     title: 'Medium Article',
//     defaultDescription: 'Read this insightful article',
//     bgGradient: 'from-emerald-50 to-green-100',
//     borderColor: 'border-emerald-100',
//     iconColor: 'text-emerald-600',
//     buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
//     loadingColor: 'border-emerald-600'
//   },
//   toastmasters: {
//     icon: Mic,
//     title: 'Toastmasters Content',
//     defaultDescription: 'Explore this Toastmasters resource',
//     bgGradient: 'from-blue-50 to-indigo-100',
//     borderColor: 'border-blue-100',
//     iconColor: 'text-blue-600',
//     buttonColor: 'bg-blue-600 hover:bg-blue-700',
//     loadingColor: 'border-blue-600'
//   },
//   assessment: {
//     icon: FileText,
//     title: 'Assessment',
//     defaultDescription: 'Complete this assessment',
//     bgGradient: 'from-purple-50 to-violet-100',
//     borderColor: 'border-purple-100',
//     iconColor: 'text-purple-600',
//     buttonColor: 'bg-purple-600 hover:bg-purple-700',
//     loadingColor: 'border-purple-600'
//   }
// };


const handleTriggerSubmit = () => {
  console.log("Quiz submitted");
};

const handleSetSubmissionPayload = (payload: {
  userAttemptFlag: boolean;
  userAttemptScore: number;
} | null) => {
  console.log("Submission payload:", payload);
};

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  type, 
  url, 
  title, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scorePercentage, setScorePercentage] = useState<number>(0);
    useEffect(() => {
    console.log("Rendering content:", url);
  }, [url]);

  useEffect(() => {
    setIsLoading(true);
  }, [url]);

  const handleContentLoaded = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  if (!url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <p>No content available</p>
      </div>
    );
  }

  const renderLoading = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-5">
      <div className="text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );

  switch (type) {
    case 'youtube':
    case 'ted':
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            src={url}
            className="w-full h-full rounded-xl"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title || 'Embedded video'}
            frameBorder="0"
            onLoad={handleContentLoaded}
            onError={handleError}
            loading="lazy"
          />
        </div>
      );

    case 'pdf':
      return (
        <div className={`w-full h-full ${className}`}>
          <PDFRenderer
            pdfUrl={url}
            title={title}
          />
        </div>
      );

case "assignment_image":
case "image":
  return (
    <div className={`relative w-full h-full bg-white ${className}`}>
      {isLoading && renderLoading()}

      <img
        src={url}
        alt={title || "Image content"}
        className="w-full h-full object-contain relative z-10"
        onLoad={() => {
          setIsLoading(false);
          console.log("✅ Image loaded:", url);
        }}
        onError={() => setIsLoading(false)}
      />
    </div>
  );



    case 'googleform':
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            src={url}
            className="w-full h-full rounded-xl bg-white"
            title={title || 'Google Form'}
            frameBorder="0"
            onLoad={handleContentLoaded}
            onError={handleError}
            loading="lazy"
          />
        </div>
      );

    case 'medium':
    case 'toastmasters':
    case 'assessment':
      // These types will use the redirect logic (if you still want to keep it for these)
      // For now, let's just show a simple iframe like googleform
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <iframe
            src={url}
            className="w-full h-full rounded-xl bg-white"
            title={title || 'External Content'}
            frameBorder="0"
            onLoad={handleContentLoaded}
            onError={handleError}
            loading="lazy"
          />
        </div>
      );
    
    case "mcq":
      return (
        <div className={`relative w-full h-full ${className}`}>
          <QuizActivity
            triggerSubmit={handleTriggerSubmit}
            xmlUrl={url}
            key={url}
            setScorePercentage={setScorePercentage}
            subconceptMaxscore={10} // ✅ You can pass actual total marks from parent
            setSubmissionPayload={handleSetSubmissionPayload}
          />
        </div>
      );

    case 'video':
    default:
      return (
        <div className={`relative w-full h-full ${className}`}>
          {isLoading && renderLoading()}
          <video 
            controls 
            autoPlay
            className="w-full h-full bg-black rounded-xl"
            src={url}
            onLoadStart={handleContentLoaded}
            onLoadedData={handleContentLoaded}
            onError={handleError}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
  }
};

export default ContentRenderer;