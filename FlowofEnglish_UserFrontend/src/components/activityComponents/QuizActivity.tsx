import { useEffect, useState } from 'react';
import { Question as QuestionType, QuizState } from '@/types/types';
import { parseQuestionsFromXML } from '@/utils/XmlParser';
import Question from '@/components/Question';
import Options from '@/components/Options';
import Navigation from '@/components/Navigation';
import Timer from '@/components/Timer';
import ScoreDisplay from '@/components/ScoreDisplay';
// import xmlData from '../data/questions.xml?raw';
import xmlData from '@/constants/questions.xml?raw';

const QuizActivity: React.FC = () => {
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    questions: [],
    selectedOptions: {},
    isChecked: false,
    score: 0,
    timeRemaining: 15 * 60, // 15 minutes in seconds
    totalMarks: 0
  });
  
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  
  useEffect(() => {
    const questions = parseQuestionsFromXML(xmlData);
    console.log(questions)
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    
    setState(prev => ({
      ...prev,
      questions,
      totalMarks
    }));
  }, []);
  
  const currentQuestion = state.questions[state.currentQuestionIndex] || null;
  
  const handleOptionSelect = (optionId: string) => {
    if (state.isChecked) return;
    
    const questionId = currentQuestion?.id || '';
    const isMultiple = currentQuestion?.type === 'multiple';
    const selectedOptions = { ...state.selectedOptions };
    
    if (isMultiple) {
      // For multiple-choice questions, toggle the selection
      if (!selectedOptions[questionId]) {
        selectedOptions[questionId] = [];
      }
      
      if (selectedOptions[questionId].includes(optionId)) {
        selectedOptions[questionId] = selectedOptions[questionId].filter(id => id !== optionId);
      } else {
        selectedOptions[questionId] = [...selectedOptions[questionId], optionId];
      }
    } else {
      // For single-choice questions, replace the selection
      selectedOptions[questionId] = [optionId];
    }
    
    setState(prev => ({
      ...prev,
      selectedOptions
    }));
  };
  
  const handleCheck = () => {
    if (!currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const selectedIds = state.selectedOptions[questionId] || [];
    const correctOptionIds = currentQuestion.options.filter(opt => opt.isCorrect).map(opt => opt.id);
    
    // For single-choice questions or if all selections are correct in multiple-choice
    let isCorrect = false;
    
    if (currentQuestion.type === 'single') {
      isCorrect = selectedIds.length === 1 && correctOptionIds.includes(selectedIds[0]);
    } else {
      // For multiple-choice, all correct options must be selected and no incorrect ones
      const allCorrectSelected = correctOptionIds.every(id => selectedIds.includes(id));
      const noIncorrectSelected = selectedIds.every(id => correctOptionIds.includes(id));
      isCorrect = allCorrectSelected && noIncorrectSelected;
    }
    
    const scoreIncrease = isCorrect ? currentQuestion.marks : 0;
    
    setState(prev => ({
      ...prev,
      isChecked: true,
      score: prev.score + scoreIncrease
    }));
  };
  
  const handleNext = () => {
    if (state.currentQuestionIndex >= state.questions.length - 1) return;
    
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      isChecked: false
    }));
  };
  
  const handlePrevious = () => {
    if (state.currentQuestionIndex <= 0) return;
    
    setState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex - 1,
      isChecked: false
    }));
  };
  
  const handleSubmit = () => {
    setIsQuizCompleted(true);
  };
  
  const handleTimeUp = () => {
    setIsQuizCompleted(true);
  };
  
  if (state.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg text-gray-600">Loading quiz...</div>
      </div>
    );
  }
  
  if (isQuizCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 w-full">
          <h1 className="text-xl font-bold text-center mb-6">Quiz Completed</h1>
          <div className="flex justify-center mb-6">
            <ScoreDisplay score={state.score} total={state.totalMarks} />
          </div>
          <p className="text-center text-lg mb-4">
            Your final score: <span className="font-bold">{state.score}</span> out of {state.totalMarks}
          </p>
          <p className="text-center text-gray-600">
            {state.score === state.totalMarks 
              ? 'Perfect score! Excellent work!' 
              : state.score >= state.totalMarks * 0.7 
                ? 'Great job!' 
                : 'Keep practicing!'}
          </p>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion) return null;
  
  const questionId = currentQuestion.id;
  const selectedOptions = state.selectedOptions[questionId] || [];
  const canCheck = selectedOptions.length > 0;
  
  return (
    <div className="bg-gray-50">
      <div className=" bg-white rounded-xl p-6 md:p-8 w-full transition-all duration-300 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Question {state.currentQuestionIndex + 1} of{" "}
            {state.questions.length}
          </h2>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all ${
              !(state.currentQuestionIndex === state.questions.length - 1) && 'hidden'
            }`}
          >
            Submit
          </button>
        </div>

        {/* <div className="flex justify-between items-center mb-6">
          <Timer initialTime={state.timeRemaining} onTimeUp={handleTimeUp} />
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-800 text-white rounded-md hover:bg-green-700 transition-all"
          >
            Submit
          </button>
        </div> */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Score on top for small, right for md+ */}
          <div className="block md:hidden">
            <ScoreDisplay score={state.score} total={state.totalMarks} />
          </div>

          <div className="flex flex-col flex-grow">
            <Question
              question={currentQuestion}
              currentIndex={state.currentQuestionIndex}
              totalQuestions={state.questions.length}
            />

            <Options
              options={currentQuestion.options}
              selectedOptions={selectedOptions}
              isMultiple={currentQuestion.type === "multiple"}
              isChecked={state.isChecked}
              onSelect={handleOptionSelect}
            />

            <Navigation
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCheck={handleCheck}
              onSubmit={handleSubmit}
              isFirstQuestion={state.currentQuestionIndex === 0}
              isLastQuestion={
                state.currentQuestionIndex === state.questions.length - 1
              }
              isChecked={state.isChecked}
              canCheck={canCheck}
            />
          </div>

          {/* Score on right for md+ */}
          <div className="hidden md:flex md:items-center md:justify-center">
            <ScoreDisplay score={state.score} total={state.totalMarks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizActivity;