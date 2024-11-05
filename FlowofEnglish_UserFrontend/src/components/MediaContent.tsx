import { useState, useEffect, useRef } from "react";
// @ts-ignore
const MediaContent = ({ subconceptData }) => {
  const [playedPercentage, setPlayedPercentage] = useState(0);
//   const [userData, setUserData] = useState(null);
// @ts-ignore
  const userData = JSON.parse(localStorage.getItem("userData"))
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (
      subconceptData.subconceptType === "audio" ||
      subconceptData.subconceptType === "video"
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
      subconceptData.subconceptType === "video"
    ) {
        // @ts-ignore
      contentRef.current.pause();
    }

    // // Fetch user data after marking as complete
    // window.parent.postMessage("requestUserData", "*");

    // window.addEventListener(
    //   "message",
    //   (event) => {
    //     try {
    //       const parsedData = JSON.parse(event.data);
    //       if (parsedData) {
    //         setUserData(parsedData);
            sendAttemptData(userData);
    //       }
    //     } catch (error) {
    //       console.error("Error parsing userData:", error);
    //     }
    //   },
    //   { once: true }
    // );
  };
// @ts-ignore
  const sendAttemptData = (userData) => {
    const finalScore = playedPercentage >= 80 ? 10 : 0;
    const payload = {
      userAttemptFlag: true,
      userAttemptScore: finalScore,
      userAttemptStartTimestamp: userData.userAttemptStartTimestamp,
      userAttemptEndTimestamp: new Date().toISOString(),
      unit: { unitId: userData.unitId },
      program: { programId: userData.programId },
      stage: { stageId: userData.stageId },
      user: { userId: userData.userId },
      session: { sessionId: userData.sessionId },
      subconcept: { subconceptId: userData.subconceptId },
    };

    fetch(`${userData.API_BASE_URL}/user-attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data sent successfully", data);
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const renderContent = () => {
    const { subconceptType, subconceptLink } = subconceptData;
    switch (subconceptType) {
      case "audio":
        return (
          <audio ref={contentRef} controls>
            <source src={subconceptLink} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        );
      case "video":
        return (
          <video ref={contentRef} controls>
            <source src={subconceptLink} type="video/mp4" />
            Your browser does not support the video element.
          </video>
        );
      case "image":
        return (
          <img
            src={subconceptLink}
            alt="Image content"
            style={{
              maxWidth: "100%",
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        );
      case "pdf":
        return (
          <iframe
            src={subconceptLink}
            width="100%"
            height="500px"
            title="PDF Document"
            style={{
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        );
      default:
        return (
          <p>Activity complete. Your data has been submitted successfully!</p>
        );
    }
  };

  return (
    // @ts-ignore
    <div style={styles.container}>
      <h1 style={styles.heading}>Complete the activity</h1>
      {/* @ts-ignore */}
      <div id="contentArea" style={styles.contentArea}>
        {renderContent()}
      </div>
      {/* @ts-ignore */}
      <div className="buttons" style={styles.buttons}>
        <button
          onClick={handleComplete}
          disabled={isComplete}
          style={isComplete ? styles.disabledButton : styles.button}
        >
          Complete
        </button>
        <button onClick={handleGoBack} style={styles.button}>
          Go Back to Activities
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(#CAF3BC, #ffff)",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    outerWidth: "100%",
    width: "100%"
  },
  heading: {
    marginTop: "80px",
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
  },
};

export default MediaContent;
