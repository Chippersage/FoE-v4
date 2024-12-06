import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import MediaContent from "@/components/MediaContent";

const SuccessOverlay = ({ countdown = 3, onRedirect }) => {

  console.log("triggered")
  const [timer, setTimer] = useState(countdown);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      console.log("redirecting...")
      onRedirect();
    }
  }, [timer, onRedirect]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fadeIn">
      <div className="bg-[#375368] p-6 rounded-lg text-center shadow-lg animate-slideDown max-w-sm w-full">
        <p className="text-white text-sm font-bold mb-2">
          Next Activity Unlocked
        </p>
        <hr className="border-t border-gray-500" />
        <h4 className="text-green-400 text-2xl font-bold mt-4">Hurrah! 😄</h4>
        <p className="text-white text-lg font-bold mt-4">
          You have unlocked the next activity.
        </p>
        <p className="text-gray-300 text-sm mt-2">
          Redirecting to activities page in{" "}
          <span className="font-bold">{timer}</span> seconds.
        </p>
      </div>
    </div>
  );
};

const ErrorOverlay = ({ countdown = 3, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      onClose();
    }, countdown * 1000);

    return () => clearTimeout(timeout);
  }, [countdown, onClose]);

  return (
    visible && (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-[#375368] p-6 rounded-lg text-center shadow-lg animate-slideDown max-w-sm w-full">
          <p className="text-white text-sm font-bold mb-2">
            Oops! Something went wrong
          </p>
          <hr className="border-t border-gray-500" />
          <h4 className="text-red-400 text-2xl font-bold mt-4">Try again 😥</h4>
          <p className="text-white text-lg font-bold mt-4">
            You need to attempt this activity again.
          </p>
        </div>
      </div>
    )
  );
};

const SingleSubconcept = () => {
  console.log("rendered");
  const { user } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showGoBack, setShowGoBack] = useState(false); // State to control Submit button visibility
  const [successOverlay, setSuccessOverlay] = useState(false);
  const [errorOverlay, setErrorOverlay] = useState(false);
  const [onFrameLoad, setOnFrameLoad] = useState(false);
  const sessionId = localStorage.getItem("authToken");
  const subconcept = location.state?.subconcept;
  const [showIframe, setShowIframe] = useState(
    !["video", "audio", "pdf", "image"].includes(subconcept?.subconceptType)
  );
const [showSubmit, setShowSubmit] = useState(
  subconcept?.subconceptType?.startsWith('passage')
);
  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;

  useEffect(() => {
    if (user) {
      const userData = {
        userAttemptStartTimestamp: new Date().toISOString(),
        unitId: currentUnitId,
        programId: user.program.programId,
        stageId: stageId,
        userId: user.userId,
        sessionId: sessionId,
        subconceptId: subconcept?.subconceptId,
        subconceptMaxscore: subconcept?.subconceptMaxscore,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        cohortId: user.cohort.cohortId,
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
    // Send a message to the iframe when Submit is clicked
    const iframe = document.getElementById("embeddedContent");
    if (iframe && iframe.tagName === "IFRAME") {
      (iframe as HTMLIFrameElement).contentWindow?.postMessage(
        "submitClicked",
        "*"
      );
    }
  };

  const handlePostScore = (payload: any) => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (!userData) {
      console.error("No user data available for POST request.");
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalPayload),
    })
      .then((response) => {
        if (response.ok) {
          console.log("submitted and postSuccess message sent");
          // Notify the iframe about the successful request
          const iframe = document.getElementById(
            "embeddedContent"
          ) as HTMLIFrameElement;
          if (iframe && iframe.tagName === "IFRAME") {
            iframe.contentWindow?.postMessage("postSuccess", "*");
          }
        } else {
          setErrorOverlay(true); // Show error overlay on failure
        }
        return response.json();
      })
      .then((data) => {
        console.log("Score submitted successfully:", data);
      })
      .catch((error) => {
        console.error("Error submitting score:", error);
        setErrorOverlay(true);
      });
  };

  const handleGoBack = () => {
    navigate(`/subconcepts/${currentUnitId}`); // Navigate to the previous page
  };

  return (
    <>
      {successOverlay && (
        <SuccessOverlay countdown={3} onRedirect={() => navigate(`/subconcepts/${currentUnitId}`)} />
      )}
      {errorOverlay && (
        <ErrorOverlay countdown={3} onClose={() => setErrorOverlay(false)} />
      )}
      <div className="flex flex-col md:flex-row w-full">
        {/* Iframe Container */}
        {/* md:border-r-2 md:border-r-slate-300 */}
        <div className="flex-1 m-[2px]">
          {showIframe ? (
            <iframe
              id="embeddedContent"
              src={subconcept.subconceptLink}
              // src={"/Sentences/readAndRespond/stage3/airPressure.html"}
              // src={"/Learner-v4/Sentences/readAndRespond/stage0/bird.html"}
              title="Embedded Content"
              className={`w-full h-[800px] mt-[65px] ${onFrameLoad && ""}`}
              onLoad={() => {
                setShowGoBack(true);
                setOnFrameLoad(true);
              }}
            />
          ) : (
            <MediaContent subconceptData={subconcept} />
          )}
        </div>
        {/* <hr className="w-[1px] border-0 bg-white h-full" /> */}

        {/* Buttons Container */}
        {showIframe && (
          <div className="sticky border-t-2 border-t-white bg-[#D5DEE7] h-[865px] bottom-0 flex md:flex-col flex-row items-center md:justify-start justify-end p-1 md:mr-0 gap-4 ,d:w-16 w-auto md:w-[150px] ">
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
      </div>
    </>
  );
};

export default SingleSubconcept;
