import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { progressAPI, quizAPI } from '../services/api';
import Layout from '../components/Layout.jsx';

const Progress = () => {
  const { toggleSidebar } = useUI();
  const [progressData, setProgressData] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Get user ID from auth context or localStorage
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
      
      if (!userId) {
        console.error('No user ID found');
        setProgressData(null);
        setLoading(false);
        return;
      }
      
      // Get all data in parallel for better performance
      const [attemptsResponse, weakTopicsResponse, analyticsResponse, personaResponse, predictionResponse] = await Promise.all([
        quizAPI.getAttempts(),
        progressAPI.getWeakTopics(),
        progressAPI.getAnalytics(30),
        progressAPI.getPersona().catch(() => ({ data: { persona: "Steady Learner", description: "Analyzing..." } })),
        progressAPI.getPredictedScore().catch(() => ({ data: { prediction: "N/A", message: "" } }))
      ]);

      const attempts = attemptsResponse.data?.attempts || attemptsResponse.data || [];
      const weakTopics = weakTopicsResponse.data?.weak_topics || {};
      const analytics = analyticsResponse.data || {};
      const persona = personaResponse.data || {};
      const prediction = predictionResponse.data || {};

      // Process data for charts
      const processedData = processProgressData(attempts, weakTopics, analytics, persona, prediction);
      
      setProgressData(processedData);
      setAttempts(attempts);
      setRecommendations({
        weak_topics: Object.entries(weakTopics).map(([topic, data]) => ({
          _id: topic,
          avg_accuracy: data.avg_accuracy,
          total_questions: data.total_questions,
          priority: data.priority || 'medium'
        })),
        suggested_focus: analytics.suggested_topics || Object.keys(weakTopics).slice(0, 3),
        study_plan: analytics.study_plan
      });
      
      console.log('Progress data loaded successfully:', {
        attemptsCount: attempts.length,
        weakTopicsCount: Object.keys(weakTopics).length,
        analyticsKeys: Object.keys(analytics)
      });
      
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };

  const processProgressData = (attempts, weakTopics, analytics, persona, prediction) => {
    // Calculate overall stats
    const totalAttempts = attempts.length;
    const totalQuestions = attempts.reduce((sum, attempt) => sum + (attempt.total_questions || 0), 0);
    const totalCorrect = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions * 100) : 0;

    // Use backend analytics data for performance timeline
    const performanceData = analytics?.learning_progress || getFallbackPerformanceData();

    // Process topic performance
    const topicMap = {};
    attempts.forEach(attempt => {
      const topic = attempt.topic || 'General';
      if (!topicMap[topic]) {
        topicMap[topic] = { total: 0, correct: 0, count: 0 };
      }
      topicMap[topic].total += attempt.total_questions || 0;
      topicMap[topic].correct += attempt.score || 0;
      topicMap[topic].count += 1;
    });

    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      accuracy: data.total > 0 ? (data.correct / data.total * 100) : 0,
      questions: data.total,
      attempts: data.count
    }));

    // Calculate accuracy distribution
    const accuracyRanges = [
      { name: 'Excellent (90-100%)', range: [90, 100], count: 0, color: '#10b981' },
      { name: 'Good (70-89%)', range: [70, 89], count: 0, color: '#3b82f6' },
      { name: 'Fair (50-69%)', range: [50, 69], count: 0, color: '#f59e0b' },
      { name: 'Needs Improvement (<50%)', range: [0, 49], count: 0, color: '#ef4444' }
    ];

    attempts.forEach(attempt => {
      const accuracy = attempt.accuracy || 0;
      const range = accuracyRanges.find(r => accuracy >= r.range[0] && accuracy <= r.range[1]);
      if (range) range.count++;
    });

    const accuracyDistribution = accuracyRanges.map(range => ({
      name: range.name,
      value: totalAttempts > 0 ? Math.round((range.count / totalAttempts) * 100) : 0,
      color: range.color
    }));

    return {
      total_attempts: totalAttempts,
      overall_accuracy: overallAccuracy,
      total_questions_answered: totalQuestions,
      knowledge_points: totalCorrect,
      study_streak: analytics?.study_streak || calculateStudyStreak(attempts),
      performanceData: performanceData,
      topicPerformance,
      accuracyDistribution,
      persona: persona || null,
      prediction: prediction || null
    };
  };

  const calculateStudyStreak = (attempts) => {
    if (attempts.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const hasActivity = attempts.some(attempt => 
        new Date(attempt.completed_at).toDateString() === dateStr
      );
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getGradeInfo = (accuracy) => {
    if (accuracy >= 90) return { grade: 'A+', purpose: 'Exceptional Mastery' };
    if (accuracy >= 80) return { grade: 'A', purpose: 'Advanced Proficiency' };
    if (accuracy >= 70) return { grade: 'B', purpose: 'Solid Foundation' };
    if (accuracy >= 60) return { grade: 'C', purpose: 'Developing Skills' };
    if (accuracy >= 50) return { grade: 'D', purpose: 'Needs Focused Review' };
    return { grade: 'F', purpose: 'Critical Gap' };
  };
  
  const getFallbackPerformanceData = () => {
    const data = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay(); // 0 is Sun, 1 is Mon...
    
    // Sort days so today is the last one
    const sortedDays = [...days.slice(today), ...days.slice(0, today)];
    
    return sortedDays.map(day => ({
      date: day,
      score: 0
    }));
  };
  if (loading) {
    return (
      <Layout>
        <div className="font-body selection:bg-primary selection:text-on-primary bg-[#0b1326] min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm font-black text-primary uppercase tracking-widest">Loading Neural Analytics</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="font-body selection:bg-primary selection:text-on-primary bg-[#0b1326] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0b1326]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 py-4 border-b border-outline-variant/10">
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
            <h2 className="font-headline text-base sm:text-lg font-bold tracking-tight text-[#dae2fd] truncate">Learning Progress</h2>
            <div className="hidden sm:block h-4 w-px bg-outline-variant/30 mx-2"></div>
            <p className="hidden md:block text-sm text-on-surface-variant line-clamp-1">Track your neural learning journey</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 pb-12">
          {/* Overview Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Neural Attempts Card */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 hover:bg-surface-container transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">target</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">Neural Attempts</p>
              <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">{progressData?.total_attempts || 0}</h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">Total quizzes completed</p>
            </div>

            {/* Neural Accuracy Card */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 hover:bg-surface-container transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">bolt</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">Neural Accuracy</p>
              <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">{(progressData?.overall_accuracy || 0).toFixed(1)}%</h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">Average performance</p>
            </div>

            {/* Questions Processed Card */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 hover:bg-surface-container transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">local_fire_department</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">Knowledge Points</p>
              <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">{progressData?.knowledge_points || 0}</h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">Total correct answers</p>
            </div>

            {/* Neural Streak Card */}
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 hover:bg-surface-container transition-colors shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">notification_important</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">Neural Streak</p>
              <h3 className="text-3xl font-headline font-bold text-on-surface mt-1">{progressData?.study_streak || 0}d</h3>
              <p className="text-xs text-on-surface-variant/60 mt-1">Current streak</p>
            </div>
          </section>

          {/* AI ML Insights Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">psychology_alt</span>
                </div>
                <h4 className="font-headline font-bold text-on-surface">AI Learning Persona</h4>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-secondary tracking-tight">{progressData?.persona?.persona || "Steady Learner"}</p>
                <p className="text-sm text-on-surface-variant mt-2 font-medium">{progressData?.persona?.description || "You are making steady progress."}</p>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">online_prediction</span>
                </div>
                <h4 className="font-headline font-bold text-on-surface">Predicted Next Score</h4>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="flex items-end gap-1">
                    <p className="text-3xl font-black text-tertiary tracking-tight">{progressData?.prediction?.prediction || "N/A"}</p>
                    {progressData?.prediction?.prediction !== "N/A" && <span className="text-xl font-bold text-tertiary mb-1">%</span>}
                  </div>
                  <p className="text-sm text-on-surface-variant mt-2 font-medium">{progressData?.prediction?.message || "Take more quizzes to unlock predictions."}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Timeline */}
          <section className="mb-8">
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-headline text-xl font-bold text-on-surface">Neural Performance Timeline</h4>
                  <p className="text-on-surface-variant text-sm mt-1">Last 7 days activity</p>
                </div>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="relative h-[300px] w-full mt-4 flex items-end justify-between px-4 pb-8">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-10 py-8">
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                  <div className="border-t border-on-surface w-full"></div>
                </div>
                
                {/* Axis Labels */}
                <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter py-8">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0</span>
                </div>
                
                {/* Bars */}
                <div className="flex justify-between w-full h-full items-end px-8 pb-8">
                  {(progressData?.performanceData || []).map((day, index) => {
                    const heightPercent = Math.max(day.score || 0, 2);
                    const heightPixels = (heightPercent / 100) * 272; // 272px is the available height (300px - 28px padding)
                    
                    return (
                      <div key={index} className="group flex flex-col items-center justify-center flex-1 mx-1 relative">
                        {/* Score Label (Visible on hover) */}
                        <div className="absolute -top-8 text-[10px] font-bold text-on-surface bg-surface-container-highest border border-outline-variant/20 px-2 py-1 rounded-md shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {Math.round(day.score || 0)}%
                        </div>
                        
                        <div 
                          className="w-full bg-primary rounded-t-lg transition-all duration-300 hover:bg-primary/80"
                          style={{ 
                            height: `${heightPixels}px`,
                            minHeight: '2px',
                            opacity: day.score > 0 ? 1 : 0.3
                          }}
                        ></div>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                          {day.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Topic Performance & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Topic Performance */}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5">
              <h4 className="font-headline text-lg font-bold text-on-surface mb-6">Topic Neural Strength</h4>
              <p className="text-on-surface-variant text-sm mb-6">Performance by subject</p>
              
              <div className="space-y-4">
                {(progressData?.topicPerformance || []).slice(0, 6).map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span>{topic.topic}</span>
                      <span className="text-primary">{topic.accuracy.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${topic.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accuracy Distribution */}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5">
              <h4 className="font-headline text-lg font-bold text-on-surface mb-6">Accuracy Distribution</h4>
              <p className="text-on-surface-variant text-sm mb-6">Performance ranges</p>
              
              <div className="flex items-center gap-8">
                {/* Pie Chart */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  {/* Custom SVG Donut Chart */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {(progressData?.accuracyDistribution || []).map((item, index) => {
                      const total = (progressData?.accuracyDistribution || []).reduce((sum, item) => sum + item.value, 0);
                      const percentage = total > 0 ? (item.value / total) * 100 : 0;
                      const offset = index === 0 ? 0 : 
                        (progressData?.accuracyDistribution || [])
                          .slice(0, index)
                          .reduce((sum, prev) => sum + (total > 0 ? (prev.value / total) * 100 : 0), 0) * 2.51; // 2.51 ≈ 251.2/100
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={`${percentage * 2.51} 251.2`}
                          strokeDashoffset={-offset}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute flex flex-col items-center text-center px-4">
                    <span className="text-3xl font-bold text-on-surface">
                      {getGradeInfo(progressData?.overall_accuracy || 0).grade}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Tier</span>
                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-tighter leading-none max-w-[80px]">
                      {getGradeInfo(progressData?.overall_accuracy || 0).purpose}
                    </span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="space-y-4 flex-1">
                  {(progressData?.accuracyDistribution || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weak Topics & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weak Topics */}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-headline text-lg font-bold text-on-surface">Neural Weakness Areas</h4>
                <span className="text-xs text-error font-bold flex items-center">
                  <span className="material-symbols-outlined text-sm mr-1">warning</span>
                  Topics needing focus
                </span>
              </div>
              
              <div className="space-y-4">
                {(recommendations?.weak_topics || []).slice(0, 4).map((topic, index) => (
                  <div key={index} className="bg-surface-container p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error">functions</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{topic._id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-error font-medium">Accuracy: {topic.avg_accuracy?.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate('/quiz', { state: { topic: topic._id } })}
                      className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-primary/80 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">model_training</span>
                      Train
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/5">
              <h4 className="font-headline text-lg font-bold text-on-surface mb-6">Recent Neural Activity</h4>
              <p className="text-on-surface-variant text-sm mb-6">Latest quiz attempts</p>
              
              <div className="space-y-4">
                {(attempts || []).slice(0, 4).map((attempt, index) => (
                  <div key={index} className="bg-surface-container p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">assignment</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{attempt.topic || 'Neural Quiz'}</p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(attempt.completed_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-on-surface">{attempt.score}</span>
                        <span className="text-xs text-on-surface-variant">/</span>
                        <span className="text-sm text-on-surface-variant">{attempt.total_questions}</span>
                      </div>
                      <p className="text-xs font-bold text-primary">{attempt.accuracy?.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Neural Training Recommendations */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus Areas */}
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary">psychology</span>
              </div>
              <h5 className="font-headline font-bold text-on-surface mb-2">Focus Areas</h5>
              <p className="text-sm text-on-surface-variant mb-4">AI suggests these areas for today's session based on memory decay.</p>
              <div className="flex flex-wrap gap-2">
                {(recommendations?.suggested_focus || []).slice(0, 3).map((topic, index) => (
                  <span key={index} className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-bold text-on-surface border border-outline-variant/10">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Daily Goals */}
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary">flag</span>
              </div>
              <h5 className="font-headline font-bold text-on-surface mb-2">Daily Neural Goals</h5>
              <p className="text-sm text-on-surface-variant mb-4">Complete 1 neural quiz, Review weak topics, Practice spaced repetition</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-tertiary rounded-full"></div>
                  <span className="text-on-surface-variant">Complete 1 neural quiz</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-tertiary rounded-full"></div>
                  <span className="text-on-surface-variant">Review weak topics</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-tertiary rounded-full"></div>
                  <span className="text-on-surface-variant">Practice spaced repetition</span>
                </div>
              </div>
            </div>

            {/* Next Milestone */}
            <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary">military_tech</span>
              </div>
              <h5 className="font-headline font-bold text-on-surface mb-2">Next Neural Milestone</h5>
              <p className="text-sm text-on-surface-variant mb-4">Achieve 85% accuracy</p>
              <p className="text-xs text-on-surface-variant mb-4">Target: Next 7 days</p>
              
              <div className="relative">
                <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-tertiary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((progressData?.overall_accuracy || 0) / 85 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-on-surface-variant">Progress</span>
                  <span className="text-xs font-bold">{Math.round((progressData?.overall_accuracy || 0) / 85 * 100)}%</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate('/quiz')}
                  className="flex-1 bg-primary text-on-primary px-3 py-2 rounded-xl text-xs font-bold hover:bg-primary/80 transition-colors"
                >
                  Start Neural Training
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-surface-container text-on-surface px-3 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-colors border border-outline-variant/10"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
};

export default Progress;
