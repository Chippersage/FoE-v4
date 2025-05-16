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
      case "image":
      case "assignment_image":
        return (
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
            } iframe-wrapper`}
            style={{ position: "relative" }}
          >
            <iframe
              // onLoad={handleContentLoaded}
              className="h-[calc(100vh-300px)]"
              src={`${subconceptLink}#toolbar=0`} // Disable PDF toolbar
              width="100%"
              // height=""
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
          className={`mb-6 mt-4 mx-auto p-4 sm:p-6 md:pb-24 ${
            ["assessment", "video", "assignment_video", "youtube"].includes(
              subconceptData?.subconceptType
            )
              ? "w-11/12 flex justify-center items-center"
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
