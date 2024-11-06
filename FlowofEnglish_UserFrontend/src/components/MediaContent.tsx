import { useState, useEffect, useRef } from "react";
// @ts-ignore
const MediaContent = ({ subconceptData }) => {
  const [playedPercentage, setPlayedPercentage] = useState(0);
//   const [userData, setUserData] = useState(null);
// @ts-ignore
  const userData = JSON.parse(localStorage.getItem("userData"))
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // @ts-ignore
    if (showPopup && countdown > 0) {
      // Start countdown if popup is visible
      const countdownInterval = setInterval(() => {
        // @ts-ignore
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      // Clear interval on cleanup
      return () => clearInterval(countdownInterval);
      // @ts-ignore
    } else if (countdown <= 0) {
      // Redirect when countdown reaches zero
      window.history.back();
    }
  }, [showPopup,countdown]);

  const handleOpenPopup = () => {
    setCountdown(10); // Reset countdown if needed
    setShowPopup(true); // Show popup
  };

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
            sendAttemptData(userData);
  }

  
// @ts-ignore
  const sendAttemptData = (userData) => {
    const finalScore = 
    (subconceptData.subconceptType === "video" || subconceptData.subconceptType === "audio") 
        ? playedPercentage >= 80 
          ? subconceptData?.subconceptMaxscore 
          : 0
        : subconceptData?.subconceptMaxscore
    // IST TIME FORMATTING
    const date = new Date();

    // Calculate IST offset (UTC+5:30)
    const ISTOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

    // Convert to IST by adding the offset
    const ISTTime = new Date(date.getTime() + ISTOffset);

    // Format IST time to "YYYY-MM-DDTHH:mm:ss"
    const formattedISTTimestamp = ISTTime.toISOString().slice(0, 19);
    const payload = {
      userAttemptFlag: true,
      userAttemptScore: finalScore,
      userAttemptStartTimestamp: userData.userAttemptStartTimestamp,
      userAttemptEndTimestamp: formattedISTTimestamp,
      unitId: userData.unitId ,
      programId: userData.programId ,
      stageId: userData.stageId ,
      userId: userData.userId ,
      sessionId: userData.sessionId ,
      subconceptId: userData.subconceptId,
      cohortId: userData.cohortId,
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
          <p>Something went wrong!</p>
        );
    }
  };

  return (
    <>
      {/* Redirect message start */}
      {showPopup && (
        <div
          id="overlay"
          style={{
            zIndex: 1,
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.5s forwards",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#375368",
              padding: "20px 10px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              maxWidth: "400px",
              width: "90%",
              animation: "slideDown 0.6s ease-out",
            }}
          >
            <p
              style={{
                color: "#fff",
                fontSize: "15px",
                margin: "0",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Next Activity Unlocked
            </p>
            <hr />
            <h4
              style={{
                color: "#4CAF50",
                fontSize: "2em",
                margin: "0",
                fontWeight: "bold",
              }}
            >
              Hurrah! 😄
            </h4>
            <p
              style={{
                fontSize: "1.5em",
                color: "#fff",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              You have unlocked the next activity.
            </p>
            <p
              id="redirectMessage"
              style={{ fontSize: "1em", color: "#cbcbcb" }}
            >
              Redirecting to activities page in{" "}
              <span id="countdown">{countdown}</span> seconds.
            </p>
          </div>
        </div>
      )}
      {/* @ts-ignore */}
      <div style={styles.container}>
        <h1 style={styles.heading}>Complete the activity</h1>
        {/* @ts-ignore */}
        <div id="contentArea" style={styles.contentArea}>
          {renderContent()}
        </div>
        {/* @ts-ignore */}
        <div className="buttons" style={styles.buttons}>
          <button
            onClick={() => {
              handleComplete();
              handleOpenPopup();
            }}
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
