"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import Image from "next/image";
import { ArrowLeft, ArrowRight, Loader2, Volume2, VolumeX } from "lucide-react";
import { questionsData } from "@/constants/questions";

// XML parser types
interface XMLQuestion {
  id: string
  word: string
  correctOption: string
}

interface XMLActivity {
  activityid: string
  questions: XMLQuestion[]
}

interface XMLData {
  headertext: string
  activities: XMLActivity[]
}

// Transformed question types for our component
interface Keyword {
  id: string
  content: string
}

interface Definition {
  id: string
  text: string
  correctKeywordId: string
}

interface Question {
  id: string
  time: string
  keywords: Keyword[]
  definitions: Definition[]
}

// Sound effects hook
const useSoundEffects = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [soundsLoaded, setSoundsLoaded] = useState(false);

  // Create refs for audio elements
  const dragStartSound = useRef(
    typeof Audio !== "undefined" ? new Audio() : null
  );
  const dropSound = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const correctSound = useRef(
    typeof Audio !== "undefined" ? new Audio() : null
  );
  const wrongSound = useRef(typeof Audio !== "undefined" ? new Audio() : null);
  const allCorrectSound = useRef(
    typeof Audio !== "undefined" ? new Audio() : null
  );

  // Initialize sounds
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set sources
      if (dragStartSound.current)
        dragStartSound.current.src = "/sounds/cloudstilepickup1.ogg";
      if (dropSound.current) dropSound.current.src = "/sounds/cloudstiledrop2.ogg";
      if (correctSound.current)
        correctSound.current.src = "/sounds/correct.ogg";
      if (wrongSound.current) wrongSound.current.src = "/sounds/wrong.ogg";
      if (allCorrectSound.current)
        allCorrectSound.current.src = "/sounds/correct.ogg";

      // Preload sounds
      const loadPromises = [
        dragStartSound.current?.load(),
        dropSound.current?.load(),
        correctSound.current?.load(),
        wrongSound.current?.load(),
        allCorrectSound.current?.load(),
      ];

      // Mark sounds as loaded
      Promise.all(loadPromises)
        .then(() => setSoundsLoaded(true))
        .catch((err) => console.error("Error loading sounds:", err));

      // Clean up
      return () => {
        [
          dragStartSound,
          dropSound,
          correctSound,
          wrongSound,
          allCorrectSound,
        ].forEach((sound) => {
          if (sound.current) {
            sound.current.pause();
            sound.current.src = "";
          }
        });
      };
    }
  }, []);

  // Play sound function
  const playSound = (type: "dragStart" | "drop" | "correct" | "wrong" | "allCorrect") => {
    if (!isSoundEnabled || !soundsLoaded) return;

    let sound;
    switch (type) {
      case "dragStart":
        sound = dragStartSound.current;
        break;
      case "drop":
        sound = dropSound.current;
        break;
      case "correct":
        sound = correctSound.current;
        break;
      case "wrong":
        sound = wrongSound.current;
        break;
      case "allCorrect":
        sound = allCorrectSound.current;
        break;
    }

    if (sound) {
      // Reset and play
      sound.currentTime = 0;
      sound.play().catch((err) => {
        console.warn(`Failed to play ${type} sound:`, err);
      });
    }
  };

  const toggleSound = () => setIsSoundEnabled((prev) => !prev);

  return { playSound, toggleSound, isSoundEnabled };
};

// XML parser function
const parseXML = async (xmlUrl: string): Promise<XMLData> => {
  try {
    const response = await fetch(xmlUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch XML: ${response.status} ${response.statusText}`)
    }

    const xmlText = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, "text/xml")

    // Parse the header text
    const activitiesElement = xmlDoc.getElementsByTagName("activities")[0]
    const headerText = activitiesElement.getAttribute("headertext") || "Vocabulary Activity"

    // Parse activities
    const activityElements = xmlDoc.getElementsByTagName("activity")
    const activities: XMLActivity[] = []

    for (let i = 0; i < activityElements.length; i++) {
      const activityElement = activityElements[i]
      const activityId = activityElement.getAttribute("activityid") || `activity-${i + 1}`

      // Parse questions
      const questionElements = activityElement.getElementsByTagName("question")
      const questions: XMLQuestion[] = []

      for (let j = 0; j < questionElements.length; j++) {
        const questionElement = questionElements[j]
        questions.push({
          id: questionElement.getAttribute("id") || `question-${j + 1}`,
          word: questionElement.getAttribute("word") || "",
          correctOption: questionElement.getAttribute("correctOption") || "",
        })
      }

      activities.push({
        activityid: activityId,
        questions: questions,
      })
    }

    return {
      headertext: headerText,
      activities: activities,
    }
  } catch (error) {
    console.error("Error parsing XML:", error)
    throw error
  }
}

// Transform XML data to our component format
const transformXMLToQuestions = (xmlData: XMLData): Question[] => {
  return xmlData.activities.map((activity, activityIndex) => {
    const keywords: Keyword[] = []
    const definitions: Definition[] = []

    // Create keywords and definitions from questions
    activity.questions.forEach((question, questionIndex) => {
      const keywordId = `keyword-${activity.activityid}-${question.id}`

      // Add keyword
      keywords.push({
        id: keywordId,
        content: question.word,
      })

      // Add definition
      definitions.push({
        id: `def-${activity.activityid}-${question.id}`,
        text: question.correctOption,
        correctKeywordId: keywordId,
      })
    })

    // Create a question object
    return {
      id: `question-${activity.activityid}`,
      time: `${activityIndex + 1}:00`, // Simple time format for each activity
      keywords: keywords,
      definitions: definitions,
    }
  })
}

// Draggable keyword component
const DraggableKeyword = ({
  id,
  content,
  isDisabled = false,
}: {
  id: string;
  content: string;
  isDisabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { content },
      disabled: isDisabled,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {/* Cloud Image as Background */}
      <img
        src="/images/cloud_bg.webp" // Adjust this to your responsive cloud images
        alt="Cloud"
        className="w-full h-auto max-w-[120px] sm:max-w-[150px] md:max-w-[200px] object-contain"
      />

      {/* Content on top of Cloud */}
      <span className="absolute text-gray-800 font-semibold text-center px-2">
        {content}
      </span>
    </div>
  );
};


// Droppable zone component
const DroppableZone = ({
  id,
  definition,
  placedKeyword,
  isCorrect,
  isSubmitted,
  showResult,
}: {
  id: string;
  definition: string;
  placedKeyword: { id: string; content: string } | null;
  isCorrect: boolean | null;
  isSubmitted: boolean;
  showResult: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex items-center gap-4 mb-4">
      <div
        ref={setNodeRef}
        className={`w-48 h-14 rounded-full flex items-center justify-center transition-colors 
      ${
        placedKeyword
          ? isOver
            ? "bg-green-200 border-2 border-green-400"
            : ""
          : "bg-gray-200 border-2 border-transparent"
      }
      ${
        placedKeyword && isSubmitted && isCorrect !== null && showResult
          ? isCorrect
            ? "bg-green-100"
            : "bg-red-100"
          : ""
      }`}
      >
        {placedKeyword && (
          <div className="relative flex items-center justify-center">
            {/* Background Image */}
            <img
              src="/images/cloud_bg.webp" // Adjust to the correct path of your cloud image
              alt="Cloud Background"
              className="w-full h-auto max-w-[120px] sm:max-w-[150px] md:max-w-[200px] object-contain"
            />

            {/* Content on top of the image */}
            <div className="absolute flex items-center gap-2">
              {placedKeyword.content.includes("/images/") ? (
                <img
                  src={placedKeyword.content || "/placeholder.svg"}
                  width={32}
                  height={32}
                  alt="Punctuation mark"
                />
              ) : (
                <span className="font-semibold">{placedKeyword.content}</span>
              )}

              {/* Show result only if submitted and evaluated */}
              {isSubmitted && isCorrect !== null && showResult && (
                <span className="ml-1 text-xl">{isCorrect ? "✅" : "❌"}</span>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="text-xl font-medium text-gray-800">{definition}</p>
    </div>
  );
};

// Timer component
const Timer = ({ time }: { time: string }) => {
  return (
    <div className="absolute top-4 left-4 text-4xl font-bold text-white">
      {time}
    </div>
  );
};

// Page score indicator component
const PageScoreIndicator = ({ isAllCorrect }: { isAllCorrect: boolean | null }) => {
  if (isAllCorrect === null) return null

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md">
      <span className="font-bold text-lg">Page Score:</span>
      <span className="text-xl">{isAllCorrect ? "1/1 ✅" : "0/1 ❌"}</span>
    </div>
  )
}

// Loading component
const LoadingState = ({ headerText }: { headerText: string }) => {
  return (
    <div className="relative w-full max-w-3xl h-[600px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-white mb-8">{headerText}</h2>
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
        <p className="text-white text-lg">Loading questions...</p>
      </div>
    </div>
  )
}

// Error component
const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="relative w-full max-w-3xl h-[600px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold text-center text-red-600 mb-4">Error</h3>
        <p className="text-center text-gray-600 mb-8">{message}</p>
        <Button className="w-full" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

interface VocabularyActivityProps {
  xmlUrl: string;
  onSubmitScore?: (score: number) => void; // Parent's handleSubmit function
}

// Main component
export default function VocabularyActivity({
  xmlUrl,
  onSubmitScore,
}: VocabularyActivityProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [placedKeywords, setPlacedKeywords] = useState<
    Record<string, { id: string; content: string } | null>
  >({});
  const [keywordPositions, setKeywordPositions] = useState<
    Record<string, string | null>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [pageResults, setPageResults] = useState<boolean[]>([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});
  const [isPageCorrect, setIsPageCorrect] = useState<boolean | null>(null);

  // XML data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [headerText, setHeaderText] = useState<string>("Vocabulary Activity");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the sound effects hook
  const { playSound, toggleSound, isSoundEnabled } = useSoundEffects();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch and parse XML data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const xmlData = await parseXML(xmlUrl);
        setHeaderText(xmlData.headertext);

        const transformedQuestions = transformXMLToQuestions(xmlData);
        setQuestions(transformedQuestions);

        // Initialize page results array
        setPageResults(new Array(transformedQuestions.length).fill(false));

        // Set total questions to the number of pages/activities
        setTotalQuestions(transformedQuestions.length);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching or parsing XML:", error);
        setError(
          "Failed to load questions. Please check the XML URL and try again."
        );
        setIsLoading(false);
      }
    };

    fetchData();
  }, [xmlUrl]);

  useEffect(() => {
    if (questions.length === 0) return;
    // Initialize placedKeywords and keywordPositions for the current question
    const initialPlacedKeywords: Record<
      string,
      { id: string; content: string } | null
    > = {};
    const initialKeywordPositions: Record<string, string | null> = {};
    const initialShowResults: Record<string, boolean> = {};

    questions[currentQuestionIndex].definitions.forEach((def) => {
      initialPlacedKeywords[def.id] = null;
      initialShowResults[def.id] = false;
    });

    questions[currentQuestionIndex].keywords.forEach((keyword) => {
      initialKeywordPositions[keyword.id] = "keywordArea";
    });

    setPlacedKeywords(initialPlacedKeywords);
    setKeywordPositions(initialKeywordPositions);
    setIsSubmitted(false);
    setResults({});
    setShowResults(initialShowResults);
    setIsPageCorrect(null);
  }, [currentQuestionIndex, questions]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    playSound("dragStart");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const keywordId = active.id as string;
      const keywordContent = event.active.data.current?.content || "";
      const dropZoneId = over.id as string;

      // Play drop sound
      playSound("drop");

      // If dragging from a definition to another definition
      if (
        Object.keys(placedKeywords).includes(keywordPositions[keywordId] || "")
      ) {
        // Remove the keyword from its previous position
        const previousDropZone = keywordPositions[keywordId];
        if (previousDropZone) {
          setPlacedKeywords((prev) => ({
            ...prev,
            [previousDropZone]: null,
          }));
        }
      }

      // If dropping on a definition
      if (Object.keys(placedKeywords).includes(dropZoneId)) {
        // If there's already a keyword in this drop zone, move it back to the keyword area
        const existingKeyword = placedKeywords[dropZoneId];
        if (existingKeyword) {
          setKeywordPositions((prev) => ({
            ...prev,
            [existingKeyword.id]: "keywordArea",
          }));
        }

        // Place the dragged keyword in the drop zone
        setPlacedKeywords((prev) => ({
          ...prev,
          [dropZoneId]: { id: keywordId, content: keywordContent },
        }));

        // Update the keyword's position
        setKeywordPositions((prev) => ({
          ...prev,
          [keywordId]: dropZoneId,
        }));
      }
      // If dropping back to the keyword area
      else if (dropZoneId === "keywordArea") {
        // Find which definition this keyword was in
        const definitionId = Object.entries(placedKeywords).find(
          ([_, value]) => value?.id === keywordId
        )?.[0];

        // Remove it from that definition
        if (definitionId) {
          setPlacedKeywords((prev) => ({
            ...prev,
            [definitionId]: null,
          }));
        }

        // Update the keyword's position
        setKeywordPositions((prev) => ({
          ...prev,
          [keywordId]: "keywordArea",
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;
    // Check if all definitions have a keyword placed
    const allPlaced = Object.values(placedKeywords).every(
      (value) => value !== null
    );

    if (!allPlaced) {
      alert("Please place all keywords before submitting.");
      return;
    }

    // Check correctness and update results
    const newResults: Record<string, boolean> = {};
    let allCorrect = true;

    questions[currentQuestionIndex].definitions.forEach((def) => {
      const placedKeyword = placedKeywords[def.id];
      const correctKeywordId = def.correctKeywordId;

      const isCorrect = placedKeyword?.id === correctKeywordId;
      newResults[def.id] = isCorrect;

      // If any placement is incorrect, the whole page is incorrect
      if (!isCorrect) {
        allCorrect = false;
      }
    });

    setResults(newResults);
    setIsSubmitted(true);

    setIsPageCorrect(allCorrect);

    // Update page results
    const newPageResults = [...pageResults];
    newPageResults[currentQuestionIndex] = allCorrect;
    setPageResults(newPageResults);

    // Only increment score if all placements on the page are correct
    if (allCorrect) {
      setScore((prev) => prev + 1);
    }

    // Reveal results one by one with animation
    const definitionIds = questions[currentQuestionIndex].definitions.map(
      (def) => def.id
    );

    definitionIds.forEach((defId, index) => {
      setTimeout(() => {
        setShowResults((prev) => ({
          ...prev,
          [defId]: true,
        }));

        // Play sound based on correctness
        if (newResults[defId]) {
          playSound("correct");
        } else {
          playSound("wrong");
        }

        // If this is the last result, play the all correct sound if applicable
        if (index === definitionIds.length - 1 && allCorrect) {
          setTimeout(() => {
            playSound("allCorrect");
          }, 500);

          // If this is the last question, show the final score
          if (currentQuestionIndex === questions.length - 1) {
            setTimeout(() => {
              setShowFinalScore(true);
              // Submit score to API
              // Calculate final score based on page results
              const finalScore = newPageResults.filter(
                (result) => result
              ).length;

              // Call parent's onSubmitScore function if provided
              if (onSubmitScore) {
                onSubmitScore(finalScore);
              }
            }, 1500);
          }
        } else if (
          index === definitionIds.length - 1 &&
          currentQuestionIndex === questions.length - 1
        ) {
          // If this is the last question but not all correct
          setTimeout(() => {
            setShowFinalScore(true);
            // Submit score to API
            // Calculate final score based on page results
            const finalScore = newPageResults.filter((result) => result).length;

            // Call parent's onSubmitScore function if provided
            if (onSubmitScore) {
              onSubmitScore(finalScore);
            }
          }, 1500);
        }
      }, index * 800); // Show each result with a 800ms delay
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // const submitScore = async (finalScore: number, totalQuestions: number) => {
  //   try {
  //     const response = await fetch("/api/submit-score", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         total_score: finalScore,
  //         total_questions: totalQuestions,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to submit score");
  //     }

  //     console.log("Score submitted successfully");
  //   } catch (error) {
  //     console.error("Error submitting score:", error);
  //   }
  // };

  // Show loading state
  if (isLoading) {
    return <LoadingState headerText={headerText} />;
  }

  // Show error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // If no questions loaded
  if (questions.length === 0) {
    return <ErrorState message="No questions found in the XML file." />;
  }

  // Current question data
  const currentQuestion = questions[currentQuestionIndex];

  if (showFinalScore) {
    // Calculate final score based on page results
    const finalScore = pageResults.filter((result) => result).length;
    return (
      <div className="relative w-full max-w-3xl h-[600px] bg-gradient-to-b from-blue-400 to-blue-600 rounded-xl shadow-xl p-8 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          Activity Complete!
        </h2>
        <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
          <h3 className="text-2xl font-bold text-center mb-4">Your Score</h3>
          <div className="text-5xl font-bold text-center text-blue-600 mb-6">
            {finalScore} / {totalQuestions}
          </div>
          <p className="text-center text-gray-600 mb-8">
            You got {finalScore} out of {totalQuestions} pages correct!
          </p>
          <Button
            className="w-full"
            onClick={() => {
              setCurrentQuestionIndex(0);
              setScore(0);
              setPageResults(new Array(questions.length).fill(false));
              setShowFinalScore(false);
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[90%] mx-auto h-[600px] bg-gradient-to-b from-[#b8eea5] to-white rounded-xl shadow-xl p-8 mt-[120px]">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        {headerText}
      </h2>
      <Timer time={currentQuestion.time} />
      <PageScoreIndicator isAllCorrect={isPageCorrect} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="mb-8 mt-10 max-w-4xl mx-auto">
          <Card className="p-4 bg-[#64CE80] bg-opacity-50 backdrop-blur-sm rounded-3xl sm:min-h-[100px] content-center">
            <div
              id="keywordArea"
              className="grid grid-cols-3 md:grid-cols-5 gap-3"
            >
              {currentQuestion.keywords.map(
                (keyword) =>
                  keywordPositions[keyword.id] === "keywordArea" && (
                    <DraggableKeyword
                      key={keyword.id}
                      id={keyword.id}
                      content={keyword.content}
                      isDisabled={isSubmitted}
                    />
                  )
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {currentQuestion.definitions.map((definition) => (
            <DroppableZone
              key={definition.id}
              id={definition.id}
              definition={definition.text}
              placedKeyword={placedKeywords[definition.id]}
              isCorrect={isSubmitted ? results[definition.id] : null}
              isSubmitted={isSubmitted}
              showResult={showResults[definition.id]}
            />
          ))}
        </div>
      </DndContext>

      <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-8">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitted}
          className="bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <Button
          onClick={isSubmitted ? handleNextQuestion : handleSubmit}
          className="px-8"
          disabled={
            isSubmitted && Object.values(showResults).some((value) => !value)
          }
        >
          {isSubmitted
            ? currentQuestionIndex === questions.length - 1
              ? "Finish"
              : "Next"
            : "Submit Answers"}
          {isSubmitted && currentQuestionIndex !== questions.length - 1 && (
            <ArrowRight className="ml-2 h-4 w-4" />
          )}
        </Button>

        <Button variant="outline" className="bg-white" onClick={toggleSound}>
          {isSoundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
