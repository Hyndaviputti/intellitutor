import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext.jsx';
import { quizAPI } from '../services/api';
import Layout from '../components/Layout.jsx';

const Quiz = () => {
  const { toggleSidebar } = useUI();
  const [step, setStep] = useState('setup'); // setup, quiz, results
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await quizAPI.getAvailableTopics();
        if (response.data && response.data.topics) {
          setAvailableTopics(response.data.topics);
        }
      } catch (err) {
        console.error('Failed to fetch available topics:', err);
      }
    };
    fetchTopics();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // ADAPTIVE: System determines difficulty automatically
      const response = await quizAPI.generate({
        topic,
        num_questions: numQuestions
      });

      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(null));
      setStep('quiz');
    } catch (err) {
      console.error('Error generating quiz:', err);
      let errorMessage = 'Failed to generate quiz. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = `Network error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoading(true);
    try {
      // Validate all questions are answered
      if (answers.includes(null)) {
        alert('Please answer all questions before submitting.');
        setLoading(false);
        return;
      }

      // Create submission data matching backend expectations
      const submissionData = {
        quiz_id: quiz.quiz_id || quiz.id,
        answers: answers // Just send the array of selected indices
      };

      console.log('Submitting quiz with data:', submissionData);
      
      const response = await quizAPI.submit(submissionData);

      // Calculate results from response or fallback to client-side calculation
      let resultsData;
      if (response.data) {
        // Use backend results
        resultsData = {
          score: response.data.score,
          totalQuestions: response.data.total_questions,
          accuracy: response.data.accuracy,
          trainingSuggestions: response.data.training_suggestions,
          answers: answers.map((answer, index) => ({
            question: quiz.questions[index],
            userAnswer: answer,
            correctAnswer: quiz.questions[index].correct_answer,
            isCorrect: answer === quiz.questions[index].correct_answer
          }))
        };
      } else {
        // Fallback to client-side calculation
        const correctAnswers = quiz.questions.reduce((count, question, index) => {
          return count + (answers[index] === question.correct_answer ? 1 : 0);
        }, 0);

        resultsData = {
          score: correctAnswers,
          totalQuestions: quiz.questions.length,
          accuracy: (correctAnswers / quiz.questions.length) * 100,
          trainingSuggestions: null,
          answers: answers.map((answer, index) => ({
            question: quiz.questions[index],
            userAnswer: answer,
            correctAnswer: quiz.questions[index].correct_answer,
            isCorrect: answer === quiz.questions[index].correct_answer
          }))
        };
      }

      setResults(resultsData);
      // Navigate to the dedicated results page instead of showing results inline
      navigate('/quiz-results', { state: { results: resultsData, quiz, topic } });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error response:', error.response);
      
      // Better error handling
      let errorMessage = 'Failed to submit quiz. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStep('setup');
    setTopic('');
    setNumQuestions(5);
    setQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
    setError(null);
  };

  if (step === 'setup') {
    return (
      <Layout>
        <div className="relative font-body text-on-surface min-h-screen flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 py-4 border-b border-outline-variant/10">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-bright transition-colors"
                aria-label="Toggle Menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant">
                  menu
                </span>
              </button>
              <h2 className="font-headline text-base sm:text-lg font-bold tracking-tight text-on-surface truncate">Neural Quiz</h2>
            </div>
          </header>
          
          {/* Background Ambient Refraction */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Decorative Asymmetric Elements */}
          <div className="fixed top-1/4 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Main Content */}
          <main className="flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Setup Card Container */}
            <div className="w-full max-w-[500px] bg-surface-container-low p-8 rounded-[2rem] shadow-2xl relative z-10">
              {/* Header Section */}
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
                </div>
                <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">Quiz Setup</h1>
                <p className="text-on-surface-variant text-sm">Configure your AI-powered learning journey</p>
              </div>
              
              <form onSubmit={handleGenerateQuiz} className="space-y-8">
                {/* Topic Input */}
                <div className="space-y-3">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-primary ml-1">Knowledge Topic</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-surface-container-lowest border-none rounded-2xl px-6 py-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300 outline-none"
                      placeholder="Enter a topic (e.g., Java OOP, Machine Learning)"
                      required
                    />
                    <div className="absolute inset-0 rounded-2xl border border-outline-variant/15 group-hover:border-outline-variant/30 pointer-events-none transition-colors"></div>
                  </div>
                  
                  {/* Curated Admin Topics */}
                  {availableTopics.length > 0 && (
                    <div className="pt-2 animate-fade-in">
                      <p className="text-xs text-on-surface-variant mb-2 ml-1 font-medium">Recommended Topics:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableTopics.map((t) => (
                          <button
                            key={t._id}
                            type="button"
                            onClick={() => setTopic(t.title)}
                            className="text-xs px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/10 text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary transition-all active:scale-95"
                          >
                            {t.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Count Selection */}
                <div className="space-y-3">
                  <label className="font-label text-xs font-bold uppercase tracking-widest text-primary ml-1">Question Count</label>
                  <div className="grid grid-cols-4 gap-3">
                    {[3, 5, 7, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumQuestions(num)}
                        className={`py-3 px-4 rounded-xl font-semibold transition-all border border-outline-variant/15 ${
                          numQuestions === num
                            ? 'bg-primary text-on-primary rounded-xl font-bold shadow-lg shadow-primary/20 scale-105'
                            : 'bg-surface-container-highest text-on-surface hover:bg-surface-bright transition-colors'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Info Card */}
                <div className="bg-surface-container rounded-2xl p-4 flex gap-4 items-start border border-outline-variant/10">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-tertiary" style={{fontVariationSettings: '"FILL" 1'}}>auto_awesome</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface mb-1">Adaptive Mode Active</h4>
                    <p className="text-on-surface-variant text-xs leading-relaxed">Questions will automatically adjust difficulty based on your performance speed and accuracy.</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  {error && (
                    <div className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium flex gap-3 items-start animate-fade-in">
                      <span className="material-symbols-outlined text-xl shrink-0">error</span>
                      <p>{error}</p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !topic.trim()}
                    className="w-full py-5 bg-primary hover:bg-primary-container text-on-primary text-base font-bold rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                        <span>Generating Quiz...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Adaptive Quiz</span>
                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (step === 'quiz') {
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <Layout>
        <div className="relative font-body text-on-surface min-h-screen flex flex-col">
          {/* Top Progress Bar Anchor */}
          <div className="fixed top-0 left-0 w-full h-1 z-[60] bg-surface-container-low overflow-hidden">
            <div className="h-full bg-primary quiz-progress-glow transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          
          {/* Visual Polish: Background Ambient Glows */}
          <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
          <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

          {/* Main Content Canvas */}
          <main className="flex-grow flex items-start justify-center px-4 pt-12 pb-24 md:pt-20 relative z-10">
            <div className="w-full max-w-[700px] flex flex-col gap-8">
              {/* Question Header Information */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">{quiz.topic}</span>
                    <span className="h-1 w-1 rounded-full bg-outline-variant"></span>
                    <div className="bg-surface-container px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-tertiary" style={{fontVariationSettings: '"FILL" 1'}}>bolt</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{quiz.difficulty || 'Medium'}</span>
                    </div>
                  </div>
                  <h2 className="text-on-surface font-headline text-2xl md:text-3xl font-bold tracking-tight">
                    {question.question}
                  </h2>
                </div>
                <div className="flex items-baseline gap-1 self-end">
                  <span className="text-3xl font-bold font-headline text-primary">{String(currentQuestion + 1).padStart(2, '0')}</span>
                  <span className="text-on-surface-variant font-semibold">/ {String(quiz.questions.length).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/20 relative overflow-hidden">
                {/* Intelligence Pulse Decorator */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Live Analysis</span>
                </div>

                <div className="space-y-8">
                  {/* Options List */}
                  <div className="grid grid-cols-1 gap-4">
                    {question.options.map((option, index) => {
                      const isSelected = answers[currentQuestion] === index;
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(currentQuestion, index)}
                          className={`group w-full text-left rounded-2xl p-6 transition-all duration-300 flex items-center gap-4 ${
                            isSelected
                              ? 'bg-surface-bright border-2 border-primary/40'
                              : 'bg-surface-container border border-outline-variant/10 hover:border-outline-variant/40'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-variant text-on-surface-variant group-hover:bg-surface-bright'
                          }`}>
                            {optionLetter}
                          </div>
                          <span className={`font-medium text-base transition-colors ${
                            isSelected
                              ? 'text-on-surface'
                              : 'text-on-surface-variant group-hover:text-on-surface'
                          }`}>
                            {option}
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined ml-auto text-primary" style={{fontVariationSettings: '"FILL" 1'}}>check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-on-surface-variant font-semibold hover:bg-surface-container transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-4">
                  {/* Progress Indicators */}
                  <div className="hidden md:flex items-center gap-2">
                    {quiz.questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentQuestion
                            ? 'bg-primary w-6'
                            : index < currentQuestion
                            ? 'bg-secondary'
                            : 'bg-outline-variant/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNext}
                    disabled={answers[currentQuestion] === null || loading}
                    className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                    ) : (
                      <>
                        <span>{currentQuestion === quiz.questions.length - 1 ? 'Submit' : 'Continue'}</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }

  if (step === 'results') {
    const getPerformanceMessage = (accuracy) => {
      if (accuracy >= 95) return { 
        emoji: '🏆', 
        message: 'Perfect Mastery', 
        color: 'text-tertiary',
        bgGradient: 'from-tertiary/10 to-transparent',
        borderColor: 'border-tertiary/20',
        description: 'Exceptional mastery of all core concepts.'
      };
      if (accuracy >= 85) return { 
        emoji: '⭐', 
        message: 'Outstanding', 
        color: 'text-primary',
        bgGradient: 'from-primary/10 to-transparent',
        borderColor: 'border-primary/20',
        description: 'Excellent understanding of the material.'
      };
      if (accuracy >= 75) return { 
        emoji: '🎯', 
        message: 'Great Job', 
        color: 'text-emerald-400',
        bgGradient: 'from-emerald-400/10 to-transparent',
        borderColor: 'border-emerald-400/20',
        description: 'Solid performance across most topics.'
      };
      if (accuracy >= 60) return { 
        emoji: '💪', 
        message: 'Good Progress', 
        color: 'text-blue-400',
        bgGradient: 'from-blue-400/10 to-transparent',
        borderColor: 'border-blue-400/20',
        description: 'Steady progress, keep practicing.'
      };
      return { 
        emoji: '📚', 
        message: 'Keep Learning', 
        color: 'text-purple-400',
        bgGradient: 'from-purple-400/10 to-transparent',
        borderColor: 'border-purple-400/20',
        description: 'Focus on reviewing the missed areas.'
      };
    };

    const performance = getPerformanceMessage(results.accuracy);

    return (
      <Layout>
        <div className="relative font-body text-on-surface min-h-screen flex flex-col">
          {/* Background Ambient Refraction */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Decorative Asymmetric Elements */}
          <div className="fixed top-1/4 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <main className="flex-grow py-8 px-6 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Performance Header */}
              <div className={`bg-surface-container-low rounded-3xl p-8 border ${performance.borderColor} shadow-xl overflow-hidden relative`}>
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  {/* Emoji & Score Circle */}
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-full border-4 border-outline-variant/10 flex items-center justify-center relative overflow-hidden bg-surface-container-highest">
                       <div 
                         className="absolute bottom-0 left-0 w-full bg-primary/20 transition-all duration-1000"
                         style={{ height: `${results.accuracy}%` }}
                       ></div>
                       <span className="text-6xl relative z-10">{performance.emoji}</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary font-black text-sm shadow-xl border border-outline-variant/10">
                      {Math.round(results.accuracy)}%
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                       <span className="material-symbols-outlined text-primary opacity-60">emoji_events</span>
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Computation Complete</span>
                    </div>
                    <h1 className={`text-4xl font-black ${performance.color} tracking-tight`}>{performance.message}</h1>
                    <p className="text-on-surface-variant font-medium max-w-md">{performance.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/15">
                        <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                        <span className="text-xs font-bold text-on-surface">{results.score} Correct</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/15">
                        <span className="material-symbols-outlined text-rose-400 text-sm">cancel</span>
                        <span className="text-xs font-bold text-on-surface">{results.totalQuestions - results.score} Incorrect</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-highest border border-outline-variant/15">
                        <span className="material-symbols-outlined text-amber-400 text-sm">schedule</span>
                        <span className="text-xs font-bold text-on-surface">{results.timeSpent || '4:12'}m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Review Section */}
              <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-highest/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                    </div>
                    <h2 className="text-sm font-black text-on-surface uppercase tracking-widest">Neural Review</h2>
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant/40">ANALYSED BY INTELLITUTOR v4.2</p>
                </div>
                
                <div className="divide-y divide-outline-variant/10 max-h-[500px] overflow-y-auto">
                  {results.answers.map((answer, index) => (
                    <div key={index} className="p-6 hover:bg-surface-container-highest/30 transition-colors group">
                      <div className="flex gap-6">
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-sm border transition-all duration-500
                          ${answer.isCorrect 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500/20'}
                        `}>
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <h3 className="text-on-surface font-bold leading-relaxed">{answer.question.question}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              answer.isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                            }`}>
                              <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Your Response</p>
                                <p className={`text-xs font-bold ${answer.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {answer.question.options[answer.userAnswer] || 'Unanswered'}
                                </p>
                              </div>
                              {answer.isCorrect ? 
                                <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span> : 
                                <span className="material-symbols-outlined text-rose-400 text-sm">cancel</span>
                              }
                            </div>

                            {!answer.isCorrect && (
                              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between gap-3">
                                <div className="space-y-0.5">
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Correct Pattern</p>
                                  <p className="text-xs font-bold text-emerald-400">
                                    {answer.question.options[answer.correctAnswer]}
                                  </p>
                                </div>
                                <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center py-4">
                <button
                  onClick={resetQuiz}
                  className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-container text-on-primary text-sm font-bold rounded-2xl shadow-xl shadow-primary/10 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">rocket_launch</span>
                  <span>Iterate Topic</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-10 py-4 bg-surface-container text-on-surface border border-outline-variant/20 rounded-2xl font-bold text-sm hover:bg-surface-container-highest transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">bar_chart</span>
                  <span>Analytics Base</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </Layout>
    );
  }
};

export default Quiz;
