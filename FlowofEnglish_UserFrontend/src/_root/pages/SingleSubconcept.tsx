import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUserContext } from "../../context/AuthContext";
import MediaContent from "@/components/MediaContent";

const SingleSubconcept = () => {
  const { user } = useUserContext();
  const location = useLocation();
  // @ts-ignore
  const sessionId = localStorage.getItem("authToken");
  const subconcept = location.state?.subconcept;
  const currentUnitId = location.state?.currentUnitId;
  const stageId = location.state?.stageId;
  console.log("subconcept", subconcept);
  console.log("currentUnitId", currentUnitId);
  console.log("stageId", stageId);
  console.log(user);
  console.log("sessionId", sessionId);


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
    // Listen for message events from the iframe
    window.addEventListener("message", function (event) {
      // Ensure that the event comes from the S3 domain
      // console.log("Received message request for userData from html file", event)
      // if (event.origin !== subconcept.subconceptLink) return;

      if (event.data === "requestUserData") {
        // Send userData back to the iframe
        const userData = localStorage.getItem("userData");
        // console.log("userData", userData);
        // @ts-ignore
        event.source.postMessage(userData, event.origin);
      }
    });
  }, []);

  // Function to check if an element is an IFrame
  const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
    input !== null && input.tagName === "IFRAME";

  // Function to send userData to the iframe
  const sendSubconcept = () => {
      const iframe = document.getElementById("embeddedContent");

      if (
        iframe &&
        subconcept &&
        isIFrame(iframe) &&
        iframe.contentWindow
      ) {
        iframe.contentWindow.postMessage(subconcept, "*"); // Send message to iframe
      }
    }
  

  return (
    <>
      {subconcept?.subconceptType === "html" ||
      subconcept?.subconceptType === "passage" ? (
        <iframe
          id="embeddedContent"
          src={subconcept.subconceptLink}
          // src={"/Sentences/readAndRespond/stage0/bird.html"}
          title="Embedded Content"
          width="100%"
          height="800px"
          style={{ border: "none", overflow: "scroll" }}
          scrolling="no"
          onLoad={
            subconcept?.subconceptType !== "html" ? sendSubconcept : () => {}
          }
        />
       ) : ( 
         <MediaContent subconceptData={subconcept}/> 
       )}
    </>
  );
};

export default SingleSubconcept;
