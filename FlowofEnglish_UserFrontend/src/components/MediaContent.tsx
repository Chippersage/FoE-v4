import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadModal } from "./modals/UploadModal";
// @ts-ignore
const MediaContent = ({ subconceptData }) => {
  const [playedPercentage, setPlayedPercentage] = useState(0);
  // @ts-ignore
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(3);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorCountdown, setErrorCountdown] = useState(3);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  // Handle countdown for success overlay
  useEffect(() => {
    if (showSuccessPopup && successCountdown > 0) {
      const interval = setInterval(() => {
        setSuccessCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (successCountdown <= 0) {
      window.history.back();
    }
  }, [showSuccessPopup, successCountdown]);

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
    setPlayedPercentage((playedTime / totalTime) * 100);
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
      subconceptData.subconceptType === "video" ||
      subconceptData.subconceptType === "audio" ||
      subconceptData.subconceptType === "assignment_audio" ||
      subconceptData.subconceptType === "assignment_video"
        ? playedPercentage >= 80
          ? subconceptData?.subconceptMaxscore
          : 0
        : subconceptData?.subconceptMaxscore;

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
        setShowErrorPopup(true);
        setErrorCountdown(5); // Reset error countdown
        setIsComplete(false);
      });
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
    console.log(subconceptData);
    const { subconceptType, subconceptLink } = subconceptData;
    switch (subconceptType) {
      case "audio":
      case "assignment_audio":
        return (
          <audio
            ref={contentRef}
            controls
            controlsList="nodownload" // Restrict download
            onContextMenu={(e) => e.preventDefault()} // Block right-click menu
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
            controlsList="nodownload" // Restrict download
            onContextMenu={(e) => e.preventDefault()} // Block right-click menu
          >
            <source src={subconceptLink} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        );
      case "image":
      case "assignment_image":
        return (
          <img
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
        return (
          <div
            onContextMenu={(e) => e.preventDefault()} // Disable right-click
            className="iframe-wrapper"
            style={{ position: "relative" }}
          >
            <iframe
              src={`${subconceptLink}#toolbar=0`} // Disable PDF toolbar
              width="100%"
              height="500px"
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
          return (
            <div
              onContextMenu={(e) => e.preventDefault()} // Disable right-click
              className="iframe-wrapper"
              style={{ position: "relative" }}
            >
              <iframe
                src={`${subconceptLink + '=' + userData?.userId}`} // Disable PDF toolbar
                width="100%"
                height="500px"
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
      default:
        return <p>Something went wrong!</p>;
    }
  };

  return (
    <>
      {showSuccessPopup && renderOverlay("success")}
      {showErrorPopup && renderOverlay("error")}
      {/* Rest of the component */}
      {/* @ts-ignore */}
      <div style={styles.container}>
        <h1 style={styles.heading}>
          Complete{" "}
          {subconceptData?.subconceptType.startsWith("assignment")
            ? "your assignment"
            : "the activity"}
        </h1>
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
        {/* @ts-ignore */}
        <div id="contentArea" style={styles.contentArea}>
          {renderContent()}
        </div>
        {/* @ts-ignore */}
        <div className="buttons" style={styles.buttons}>
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              // subconceptData?.subconceptType.startsWith("assignment")
              //   ? setIsUploadModalOpen(true)
              //   : handleComplete();
              // handleOpenPopup();
            }}
            disabled={isComplete}
            style={isComplete ? styles.disabledButton : styles.button}
          >
            {subconceptData?.subconceptType.startsWith("assignment")
              ? "Upload your assignment"
              : "Complete"}
          </button>
          <button onClick={handleGoBack} style={styles.button}>
            Go Back to Activities
          </button>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    background: "linear-gradient(#CAF3BC, #ffff)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    outerWidth: "100%",
    width: "100%",
  },
  heading: {
    marginTop: "66px",
    fontSize: "2.2em",
    color: "#2C3E50",
    fontWeight: "bold",
  },
  contentArea: {
    margin: "30px auto",
    padding: "20px",
    width: "90%",
    maxWidth: "800px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
    maxHeight: "80vh",
  },
  buttons: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  button: {
    padding: "10px 15px",
    margin: "10px",
    backgroundColor: "#00A66B",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.1em",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    maxWidth: "200px",
  },
  disabledButton: {
    backgroundColor: "gray",
    cursor: "not-allowed",
    padding: "10px 15px",
    margin: "10px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.1em",
    transition: "background-color 0.3s ease",
    maxWidth: "200px",
  },
};

export default MediaContent;
