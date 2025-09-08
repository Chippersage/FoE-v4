// @ts-nocheck
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import MediaContent from "@/components/MediaContent";
import ActivityCompletionModal from "@/components/ActivityCompletionModal";
import VocabularyActivity from "@/components/activityComponents/VocabularyActivity";
import QuizActivity from "@/components/activityComponents/QuizActivity";
import VocabularyLearning from "@/components/activityComponents/vocabulary-learning/vocabulary-learning";
import LoadingOverlay from "@/components/LoadingOverlay";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Timer } from "lucide-react";

// @ts-ignore
const ErrorOverlay = ({ countdown = 5, onClose }) => {
  const [timer, setTimer] = useState(countdown);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      // Trigger the close function once the countdown reaches 0
      onClose();
    }
  }, [timer, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl border border-red-200"
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm py-4 px-6 border-b border-red-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Activity Error
            </h2>
            <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <AlertCircle className="w-4 h-4" />
              Retry Required
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-4 text-red-700">
            Something Went Wrong
          </h3>

          {/* Message */}
          <p className="text-base leading-relaxed mb-6 text-slate-600">
            We encountered an issue while processing your activity. Please try again to continue your learning.
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Timer className="w-4 h-4" />
            <span>
              Closing in{" "}
              <span className="font-semibold text-slate-700">{timer}</span>{" "}
              seconds
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-red-200">
          <motion.div
            initial={{ width: "0%" }}
            animate={{
              width: `${((countdown - timer) / countdown) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
            className="h-full bg-red-500"
          />
        </div>
      </motion.div>
    </div>
  );
};

const SingleSubconcept = () => {
  // console.log("rendered");
  const { user, selectedCohortWithProgram } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  // State to control Submit button visibility
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [errorOverlay, setErrorOverlay] = useState(false);
  const [onFrameLoad, setOnFrameLoad] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const sessionId = localStorage.getItem("sessionId");
  const subconcept = location.state?.subconcept;
  const [showGoBack, setShowGoBack] = useState(
    subconcept?.subconceptType?.toLowerCase() === "vocab"
  );
  // @ts-ignore
  const [showIframe, setShowIframe] = useState(
    ![
      "video",
      "audio",
      "pdf",
      "image",
      "assignment_video",
      "assignment_audio",
      "assignment_pdf",
      "assignment_image",
      "assessment",
      "youtube",
      "mtf",
      "mcq",
      "word",
    ].includes(subconcept?.subconceptType)
  );
  // const [showSubmit, setShowSubmit] = useState(
  //   subconcept?.subconceptType?.toLowerCase().startsWith("assignment") ||
  //     subconcept?.subconceptType?.toLowerCase().startsWith("mtf")
  // );
  const [showSubmit, setShowSubmit] = useState(
    subconcept?.subconceptType?.toLowerCase().startsWith("assignment")
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionPayload, setSubmissionPayload] = useState<{
    userAttemptFlag: boolean;
    userAttemptScore: number;
  } | null>(null);

  // console.log("submissionPayload", submissionPayload);

  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;
  const [scorePercentage, setScorePercentage] = useState<null | number>(null);
  const [isPortrait, setIsPortrait] = useState(
    window.innerWidth < window.innerHeight
  );
  const [modalVisible, setModalVisible] = useState(false);
  const submitBtnRef = useRef(null); // 👈 ref for your styled submit button

  // useEffect(() => {
  //   // Only set showSubmit to false if it's a vocabulary activity
  //   if (subconcept?.subconceptType?.toLowerCase() === "vocab") {
  //     setShowSubmit(false);
  //   } else {
  //     setShowSubmit(true);
  //   }
  // }, [subconcept]);

  // useEffect(() => {
  //   // Clear sessionStorage when the component mounts to show modal again on revisit
  //   sessionStorage.removeItem("orientationModalDismissed");

  //   // Function to check and update orientation
  //   const handleOrientationChange = () => {
  //     const portraitMode = window.innerWidth < window.innerHeight;
  //     setIsPortrait(portraitMode);

  //     // If device is in portrait mode and hasn't been dismissed, show modal
  //     const link = subconcept.subconceptLink.toUpperCase();
  //     if (
  //       (link.includes("MTF".toUpperCase()) ||
  //       link.includes("VOCABULARY".toUpperCase()) && showIframe)
  //     ) {
  //       const hasDismissed = sessionStorage.getItem("orientationModalDismissed");
  //       if (portraitMode && !hasDismissed) {
  //         setModalVisible(true);
  //       } else {
  //         setModalVisible(false); // Auto dismiss when in landscape
  //       }
  //     }

  //   };

  //   // Initial check
  //   handleOrientationChange();

  //   // Listen for orientation changes
  //   window.addEventListener("resize", handleOrientationChange);
  //   window.addEventListener("orientationchange", handleOrientationChange);

  //   return () => {
  //     window.removeEventListener("resize", handleOrientationChange);
  //     window.removeEventListener("orientationchange", handleOrientationChange);
  //   };
  // }, [subconcept.subconceptLink]);

  const dismissModal = () => {
    setModalVisible(false);
    sessionStorage.setItem("orientationModalDismissed", "true");
  };

  useEffect(() => {
    if (user) {
      const userData = {
        userAttemptStartTimestamp: new Date().toISOString(),
        unitId: currentUnitId,
        programId: selectedCohortWithProgram?.program?.programId,
        stageId: stageId,
        userId: user.userId,
        sessionId: sessionId,
        subconceptId: subconcept?.subconceptId,
        subconceptMaxscore: subconcept?.subconceptMaxscore,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        cohortId: selectedCohortWithProgram?.cohortId,
      };
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [user]);

  useEffect(() => {
    // Listen for postMessage events from the iframe
    const handleMessage = (event: MessageEvent) => {
      // Check if the message comes from the expected iframe
      // if (event.origin === new URL(subconcept?.subconceptLink || "").origin) {
      if (event.data === "enableSubmit") {
        setShowSubmit(true); // Show the Submit button
      } else if (event.data === "disableSubmit") {
        setShowSubmit(false);
      } else if (event.data?.type === "scoreData") {
        // Handle score data from iframe
        setScorePercentage(
          (event.data.payload?.userAttemptScore /
            subconcept?.subconceptMaxscore) *
            100
        );
        handlePostScore(event.data.payload); // Process score data
      } else if (event.data === "confirmSubmission") {
        setSuccessOverlay(true); // Show success overlay upon confirmation
      }
      // }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [subconcept?.subconceptLink]);

  // const sendSubconcept = () => {
  //   const iframe = document.getElementById("embeddedContent");

  //   if (iframe && subconcept && iframe.tagName === "IFRAME") {
  //     (iframe as HTMLIFrameElement).contentWindow?.postMessage(subconcept, "*");
  //   }
  // };

  const handleSubmit = () => {
    // To uncomment for new mtf activity component

    if (
      subconcept?.subconceptType?.toLowerCase() === "mtf" ||
      subconcept?.subconceptType?.toLowerCase() === "mcq" ||
      subconcept?.subconceptType?.toLowerCase() === "word"
    ) {
      // Only proceed if we have a valid submission payload
      if (!submissionPayload) {
        console.error("No submission payload available");
        return;
      }
      console.log("submissionPayload in final call", submissionPayload);
      handlePostScore(submissionPayload);
    }
    // Send a message to the iframe when Submit is clicked
    else {
      const iframe = document.getElementById("embeddedContent");
      if (iframe && iframe.tagName === "IFRAME") {
        // Send the old format for backward compatibility
        (iframe as HTMLIFrameElement).contentWindow?.postMessage("submitClicked", "*");
        
        // Send additional data separately
        (iframe as HTMLIFrameElement).contentWindow?.postMessage(
          {
            action: "subconceptData",
            subconceptMaxscore: subconcept?.subconceptMaxscore
          },
          "*"
        );
      }
    }
  };

  const handlePostScore = (payload: any) => {
    // console.log("payload", payload);
    if (isSubmitting) return; // prevent duplicate
    setIsSubmitting(true);

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (!userData || Object.keys(userData).length === 0) {
      console.error("No user data available for POST request.");
      setIsSubmitting(false);
      return;
    }

    const finalPayload = {
      ...payload,
      userAttemptStartTimestamp: userData.userAttemptStartTimestamp,
      userAttemptEndTimestamp: new Date().toISOString(),
      unitId: userData.unitId,
      programId: userData.programId,
      stageId: userData.stageId,
      userId: userData.userId,
      sessionId: userData.sessionId,
      subconceptId: userData.subconceptId,
      cohortId: userData.cohortId,
    };

    console.log("Final Payload for POST request:", finalPayload);

    fetch(`${userData.API_BASE_URL}/user-attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalPayload),
    })
      .then((response) => {
        if (response.ok) {
          // console.log("submitted and postSuccess message sent");
          const iframe = document.getElementById(
            "embeddedContent"
          ) as HTMLIFrameElement;
          if (iframe && iframe.tagName === "IFRAME") {
            iframe.contentWindow?.postMessage("postSuccess", "*");
          } else if (
            subconcept?.subconceptType?.toLowerCase() === "mtf" ||
            subconcept?.subconceptType?.toLowerCase() === "mcq" ||
            subconcept?.subconceptType?.toLowerCase() === "word"
          ) {
            setSuccessOverlay(true);
          }
        } else {
          setErrorOverlay(true);
        }
        return response.json();
      })
      .then((data) => {
        const percentage =
          subconcept?.subconceptMaxscore === 0
            ? 100
            : (payload?.userAttemptScore / subconcept?.subconceptMaxscore) *
              100;
        setScorePercentage(percentage);
        // console.log("Score submitted successfully:", data);
      })
      .catch((error) => {
        console.error("Error submitting score:", error);
        setErrorOverlay(true);
      })
      .finally(() => {
        setIsSubmitting(false); // allow future submissions
      });
  };

  const handleGoBack = () => {
    navigate(`/subconcepts/${currentUnitId}`); // Navigate to the previous page
  };

  return (
    <>
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-2">Rotate Your Device</h2>
            <p className="text-gray-700 mb-4">
              This content is best viewed in landscape mode.
            </p>
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-md"
              onClick={dismissModal}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {successOverlay && (
        <ActivityCompletionModal
          countdownDuration={3}
          onClose={() => navigate(`/subconcepts/${currentUnitId}`)}
          scorePercentage={scorePercentage}
        />
      )}
      {errorOverlay && (
        <ErrorOverlay countdown={5} onClose={() => setErrorOverlay(false)} />
      )}
      <div className="flex flex-col md:flex-row w-full">
        {/* Iframe Container */}
        {/* md:border-r-2 md:border-r-slate-300 */}
        <div className="flex-1 m-[2px]">
          {/* To uncomment for new mtf activity component */}

          {(() => {
            if (subconcept?.subconceptType === "mtf") {
              return (
                <VocabularyActivity
                  triggerSubmit={() => {
                    // console.log("triggerSubmit parent");
                    submitBtnRef.current?.click();
                  }}
                  // setShowSubmit={setShowSubmit}
                  xmlUrl={subconcept?.subconceptLink}
                  // onSubmitScore={handlePostScore}
                  setSubmissionPayload={setSubmissionPayload}
                  setScorePercentage={setScorePercentage}
                  subconceptMaxscore={subconcept?.subconceptMaxscore}
                />
              );
            } else if (subconcept?.subconceptType === "mcq") {
              return (
                <QuizActivity
                  triggerSubmit={() => {
                    submitBtnRef.current?.click();
                  }}
                  xmlUrl={subconcept?.subconceptLink}
                  setSubmissionPayload={setSubmissionPayload}
                  setScorePercentage={setScorePercentage}
                  subconceptMaxscore={subconcept?.subconceptMaxscore}
                />
              );
            } else if (subconcept?.subconceptType === "word") {
              return (
                <VocabularyLearning
                  triggerSubmit={() => {
                    submitBtnRef.current?.click();
                  }}
                  xmlUrl={subconcept?.subconceptLink}
                  setSubmissionPayload={setSubmissionPayload}
                  setScorePercentage={setScorePercentage}
                  subconceptMaxscore={subconcept?.subconceptMaxscore}
                />
              );
            } else if (showIframe) {
              return (
                <div className="relative w-full min-h-[500px] sm:min-h-[800px]">
                  {isIframeLoading && <LoadingOverlay />}
                  {iframeError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <p className="text-red-500 text-xl mb-4">
                          Failed to load content
                        </p>
                        <button
                          onClick={() => {
                            setIframeError(false);
                            setIsIframeLoading(true);
                            // Force iframe reload by updating key
                            const iframe = document.getElementById(
                              "embeddedContent"
                            ) as HTMLIFrameElement;
                            if (iframe) {
                              iframe.src = iframe.src;
                            }
                          }}
                          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      id="embeddedContent"
                      src={subconcept?.subconceptLink}
                      // src={"/alphabet/alphabet_a.html"}
                      title="Embedded Content"
                      className={`w-full min-h-[500px] sm:min-h-[800px]`}
                      onLoad={() => {
                        setShowGoBack(true);
                        setOnFrameLoad(true);
                        setIsIframeLoading(false);
                      }}
                      onError={() => {
                        setIframeError(true);
                        setIsIframeLoading(false);
                      }}
                      allow="autoplay"
                    />
                  )}
                </div>
              );
            } else {
              return (
                <MediaContent
                  subconceptData={subconcept}
                  currentUnitId={currentUnitId}
                />
              );
            }
          })()}
        </div>
        {/* <hr className="w-[1px] border-0 bg-white h-full" /> */}

        {/* Buttons Container */}
        {showIframe && (
          <div className="fixed md:sticky border-t-2 border-t-white bg-[#D5DEE7] h-auto bottom-0 flex md:flex-col flex-row items-center md:justify-start justify-center p-1 md:mr-0 gap-10 w-full md:w-[100px] ">
            {/* Go Back Button */}
            {showGoBack && (
              <button
                onClick={handleGoBack}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white md:w-[85px] md:h-[85px] h-[60px] w-[60px] font-[700] md:text-[16px] text-xs font-['system-ui'] rounded-full flex flex-col items-center justify-center md:relative md:top-48 z-[99] gap-1"
              >
                <img
                  src="/icons/User-icons/back-white.png"
                  alt="Go Back Icon"
                  className="md:w-6 md:h-6 h-4 w-4"
                />
                Go back
              </button>
            )}

            {/* Submit Button (Shown only when showSubmit is true) */}
            {showSubmit && (
              <button
                ref={submitBtnRef}
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-[#5bc3cd] hover:bg-[#DB5788] text-white md:w-[85px] md:h-[85px] h-[60px] w-[60px] font-[700] md:text-[16px] text-xs font-['system-ui'] rounded-full flex flex-col items-center justify-center md:relative md:top-48 z-[99] gap-1"
              >
                <img
                  src="/icons/User-icons/send.png"
                  alt="Submit Icon"
                  className="md:w-6 md:h-6 h-4 w-4"
                />
                Submit
              </button>
            )}
          </div>
        )}

        {/* Hidden external Submit Button for New React Activity components type only */}
        {(subconcept?.subconceptType === "mtf" ||
          subconcept?.subconceptType === "mcq" ||
          subconcept?.subconceptType === "word") && (
          <button
            ref={submitBtnRef}
            onClick={handleSubmit}
            style={{ display: "none" }}
          >
            Hidden Submit
          </button>
        )}
      </div>
    </>
  );
};

export default SingleSubconcept;
