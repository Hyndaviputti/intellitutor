import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext.jsx';
import Layout from '../components/Layout.jsx';

const QuizResults = () => {
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state or use defaults
  const { results, quiz, topic } = location.state || {};

  // If no data, redirect to quiz setup
  if (!results || !quiz) {
    navigate('/quiz');
    return null;
  }

  // Process the data to match the expected format
  const processedResults = {
    score: Math.round(results.accuracy || 0),
    totalQuestions: results.totalQuestions || quiz.questions.length,
    correctAnswers: results.score || 0,
    averageTime: 4.2, // Mock data - would come from actual timing
    globalRank: Math.max(4, 100 - Math.round(results.accuracy || 0)), // Calculate based on score
    topic: topic || "Quiz Topic",
    insights: {
      strengths: ["Conceptual Understanding", "Problem Solving"],
      improvements: ["Speed", "Complex Scenarios"],
      description: `You've demonstrated strong performance in this quiz. Your accuracy of ${Math.round(results.accuracy || 0)}% shows good understanding of the material.`
    },
    questions: quiz.questions.map((question, index) => ({
      id: index + 1,
      question: question.question,
      userAnswer: results.answers[index]?.userAnswer,
      correctAnswer: question.correct_answer,
      difficulty: question.difficulty || "Medium",
      options: question.options,
      aiSuggestion: results.answers[index]?.isCorrect === false 
        ? "Review this concept and practice similar problems to improve your understanding."
        : null
    })),
    nextSteps: results.trainingSuggestions || [
      {
        type: "article",
        title: "Review: Core Concepts",
        duration: "15 min read",
        icon: "book",
        color: "secondary",
        url: "https://www.google.com/search?q=Core+Concepts"
      },
      {
        type: "video",
        title: "Practice Problems",
        duration: "8 min video",
        icon: "play_circle",
        color: "tertiary",
        url: "https://www.youtube.com/results?search_query=practice+problems"
      },
      {
        type: "practice",
        title: "Advanced Exercises",
        duration: "25 min",
        icon: "terminal",
        color: "primary",
        url: "https://www.google.com/search?q=Advanced+Exercises"
      }
    ]
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return "Exceptional Performance";
    if (score >= 80) return "Outstanding Performance";
    if (score >= 70) return "Great Performance";
    if (score >= 60) return "Good Performance";
    return "Keep Practicing";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-tertiary';
      case 'medium': return 'text-secondary';
      case 'hard': return 'text-error';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header (Mobile toggle) */}
        <header className="lg:hidden flex items-center mb-8 px-2">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-bright transition-colors"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              menu
            </span>
          </button>
          <h2 className="ml-4 font-headline text-lg font-bold text-on-surface">Quiz Results</h2>
        </header>
        {/* Hero Result Section */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-8 md:p-12 text-center score-glow mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-widest mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              AI Assessment Complete
            </div>
            <h2 className="text-on-surface-variant font-medium mb-2 font-body">Your Score</h2>
            <div className="text-7xl md:text-9xl font-bold font-headline text-tertiary tracking-tighter mb-4">
              {processedResults.score}%
            </div>
            <p className="text-2xl md:text-3xl font-bold text-on-surface font-headline mb-8">
              {getPerformanceLevel(processedResults.score)}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => navigate('/quiz')}
                className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold font-body hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined">replay</span>
                Retry Topic
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-transparent text-on-surface border border-outline-variant/30 rounded-2xl font-bold font-body hover:bg-surface-bright transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Analysis Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Insight Card */}
          <div className="md:col-span-2 bg-surface-container rounded-2xl p-6 border-l-4 border-tertiary">
            <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">psychology</span>
              AI Insight: Conceptual Mastery
            </h3>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              {processedResults.insights.description}
            </p>
            <div className="flex gap-4">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-tertiary font-bold">{processedResults.correctAnswers}/{processedResults.totalQuestions}</span>
                <span className="text-xs text-on-surface-variant">Correct</span>
              </div>
              <div className="bg-surface-container-lowest px-4 py-2 rounded-xl flex items-center gap-2">
                <span className="text-primary font-bold">{processedResults.averageTime}s</span>
                <span className="text-xs text-on-surface-variant">Avg. Pace</span>
              </div>
            </div>
          </div>

          {/* Mini Stats Card */}
          <div className="bg-surface-container rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Global Rank</h4>
              <div className="text-4xl font-bold text-secondary font-headline">Top {processedResults.globalRank}%</div>
            </div>
            <div className="h-1 w-full bg-surface-container-lowest rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[96%]"></div>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">Better than {100 - processedResults.globalRank}% of learners this week</p>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold font-headline">Question Review</h3>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface">All</button>
              <button className="text-xs px-3 py-1 rounded-full hover:bg-surface-container text-on-surface-variant">Incorrect Only</button>
            </div>
          </div>

          {/* Review Items */}
          <div className="space-y-4">
            {processedResults.questions.map((question, index) => (
              <div 
                key={question.id}
                className={`bg-surface-container rounded-2xl p-6 group hover:bg-surface-bright transition-colors cursor-pointer ${
                  question.userAnswer !== question.correctAnswer ? 'border-l-4 border-error/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    question.userAnswer === question.correctAnswer 
                      ? 'bg-tertiary/10 text-tertiary' 
                      : 'bg-error/10 text-error'
                  }`}>
                    <span className="material-symbols-outlined text-lg">
                      {question.userAnswer === question.correctAnswer ? 'check' : 'close'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        Question {String(question.id).padStart(2, '0')}
                      </span>
                      <span className={`text-xs text-on-surface-variant ${getDifficultyColor(question.difficulty)}`}>
                        Difficulty: {question.difficulty}
                      </span>
                    </div>
                    <p className="text-on-surface font-medium mb-4">{question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-3 rounded-xl border text-sm flex items-center justify-between ${
                            optionIndex === question.correctAnswer
                              ? 'border-tertiary/40 bg-tertiary/5'
                              : optionIndex === question.userAnswer && question.userAnswer !== question.correctAnswer
                              ? 'border-error/40 bg-error/5'
                              : 'border-outline-variant/10 text-on-surface-variant'
                          }`}
                        >
                          <span>{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <span className="text-[10px] font-bold text-tertiary uppercase font-headline">Correct Answer</span>
                          )}
                          {optionIndex === question.userAnswer && question.userAnswer !== question.correctAnswer && (
                            <span className="text-[10px] font-bold text-error uppercase">Your Choice</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.userAnswer !== question.correctAnswer && question.aiSuggestion && (
                      <div className="bg-surface-container-lowest p-4 rounded-xl">
                        <p className="text-xs text-on-surface-variant leading-relaxed italic">
                          <span className="text-on-surface font-bold not-italic">AI Suggestion:</span> {question.aiSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Next Steps */}
        <div className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/5">
          <h3 className="text-xl font-bold font-headline mb-6">Personalized Next Steps</h3>
          <div className="flex flex-col md:flex-row gap-4">
            {processedResults.nextSteps.map((step, index) => (
              <a 
                key={index} 
                href={step.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-surface-container p-4 rounded-xl flex gap-4 items-center group cursor-pointer hover:bg-surface-bright transition-all decoration-transparent"
              >
                <div className={`w-12 h-12 bg-${step.color}/10 rounded-lg flex items-center justify-center text-${step.color}`}>
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{step.title}</p>
                  <p className="text-xs text-on-surface-variant">{step.duration} • {step.type.charAt(0).toUpperCase() + step.type.slice(1)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizResults;
