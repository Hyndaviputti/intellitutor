import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { progressAPI, quizAPI, aiAPI } from '../services/api';
import Layout from '../components/Layout.jsx';
import OnboardingGuide from '../components/OnboardingGuide.jsx';

const Dashboard = () => {
  const { toggleSidebar } = useUI();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Format relative time dynamically
  const formatRelativeTime = (timestamp) => {
    const now = currentTime.getTime(); // Use timestamp in milliseconds
    
    // Parse the timestamp - ensure it's treated as UTC
    let activityTime;
    try {
      // If timestamp is in ISO format, create Date object and get UTC time
      const dateObj = new Date(timestamp);
      activityTime = dateObj.getTime(); // getTime() returns milliseconds since epoch (UTC)
      
      // Debug logging (minimal)
      console.log('Time calculation:', {
        timestamp,
        timeDiffMins: Math.round((now - activityTime) / (1000 * 60))
      });
    } catch (error) {
      console.error('Error parsing timestamp:', error);
      return 'Unknown time';
    }
    
    // Check if the date is valid
    if (isNaN(activityTime)) {
      return 'Unknown time';
    }
    
    const diffInMs = now - activityTime;
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return new Date(activityTime).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };
  
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    quizzesCompleted: 0,
    accuracyRate: '0%',
    studyStreak: '0'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [weakTopics, setWeakTopics] = useState({});
  const [adaptivePath, setAdaptivePath] = useState([]);
  const [proactiveInsights, setProactiveInsights] = useState([]);

  const [attempts, setAttempts] = useState(0);
  const [chatSessions, setChatSessions] = useState(0);
  const [weakTopicsCount, setWeakTopicsCount] = useState(0);
  const [adaptivePathCount, setAdaptivePathCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update current time every minute to refresh relative times
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Refresh dashboard data when page becomes visible (after navigation from quiz/chat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading) {
        loadDashboardData();
      }
    };

    const handleFocus = () => {
      if (!loading) {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get quiz attempts with proper error handling
      let attempts = [];
      try {
        const quizResponse = await quizAPI.getAttempts();
        attempts = quizResponse.data?.attempts || quizResponse.data || [];
        console.log('Loaded attempts:', attempts.length);
      } catch (error) {
        console.error('Failed to load quiz attempts:', error);
        attempts = [];
      }

      // Get chat sessions with proper error handling
      let chatStats = [];
      try {
        const chatResponse = await aiAPI.getChatSessions();
        chatStats = chatResponse.data?.sessions || chatResponse.data || [];
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
        chatStats = [];
      }

      // Get study streak with proper error handling
      let studyStreakValue = 0;
      try {
        const streakResponse = await progressAPI.getStudyStreak();
        studyStreakValue = streakResponse.data?.study_streak || 0;
      } catch (error) {
        console.error('Failed to load study streak:', error);
        studyStreakValue = 0;
      }

      // Get weak topics with proper error handling
      let weakTopicsData = { weak_topics: {} };
      try {
        const weakTopicsResponse = await progressAPI.getWeakTopics();
        weakTopicsData = weakTopicsResponse.data;
      } catch (error) {
        console.error('Failed to load weak topics:', error);
      }
      
      // Get adaptive path with proper error handling
      let adaptiveData = { learning_path: [] };
      try {
        const adaptiveResponse = await quizAPI.getAdaptivePath();
        adaptiveData = adaptiveResponse.data;
      } catch (error) {
        console.error('Failed to load adaptive path:', error);
      }
      
      // Get proactive insights with proper error handling
      try {
        const proactiveResponse = await progressAPI.getProactiveInsight();
        setProactiveInsights(proactiveResponse.data?.insights || []);
      } catch (error) {
        console.error('Failed to load proactive insights:', error);
        setProactiveInsights([]);
      }
      


      // Calculate accuracy summary
      const totalQuestions = attempts.reduce((acc, attempt) => acc + (attempt.total_questions || 0), 0);
      const correctAnswers = attempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
      const lifetimeAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;
      
      // Calculate RECENT accuracy (last 5 attempts) for better reactivity
      const recentAttempts = attempts.slice(0, 5);
      const recentQuestions = recentAttempts.reduce((acc, attempt) => acc + (attempt.total_questions || 0), 0);
      const recentCorrect = recentAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
      const recentAccuracy = recentQuestions > 0 ? (recentCorrect / recentQuestions * 100).toFixed(1) : lifetimeAccuracy;

      setStats({
        questionsAnswered: correctAnswers, // Only count correct questions
        quizzesCompleted: attempts.length,
        accuracyRate: `${recentAccuracy}%`, // Use recent accuracy for main display
        lifetimeAccuracy: `${lifetimeAccuracy}%`,
        studyStreak: studyStreakValue.toString(),
        lastUpdated: new Date()
      });

      setWeakTopics(weakTopicsData.weak_topics || {});
      setAdaptivePath(adaptiveData.learning_path || []);


      // Set additional metrics
      setAttempts(attempts.length);
      setChatSessions(chatStats.length);
      setWeakTopicsCount(Object.keys(weakTopicsData.weak_topics || {}).length);
      setAdaptivePathCount(adaptiveData.learning_path?.length || 0);

      // Create activity feed
      const activities = [
        ...attempts.slice(0, 3).map(attempt => {
          const timestamp = attempt.completed_at || new Date().toISOString();
          return {
            id: attempt._id || Math.random().toString(),
            type: 'quiz',
            title: `Completed ${attempt.topic || 'Quiz'}`,
            description: `Score: ${attempt.score || 0}/${attempt.total_questions || 0}`,
            timestamp: timestamp
          };
        }),
        ...chatStats.slice(0, 2).map(session => {
          const timestamp = session.timestamp || new Date().toISOString();
          return {
            id: session._id || Math.random().toString(),
            type: 'chat',
            title: 'Neural Chat Session',
            description: `${session.message_count || 0} messages`,
            timestamp: timestamp
          };
        })
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

      console.log('Final activities sorted:', activities.map(a => ({
        title: a.title,
        timestamp: a.timestamp,
        formattedTime: formatRelativeTime(a.timestamp)
      })));

      setRecentActivity(activities);
      
      console.log('Dashboard data loaded successfully:', {
        attempts: attempts.length,
        chatSessions: chatStats.length,
        adaptivePathCount: adaptiveData.learning_path?.length || 0
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values on error
      setStats({
        questionsAnswered: 0,
        quizzesCompleted: 0,
        accuracyRate: '0%',
        studyStreak: '0'
      });
      setWeakTopics({});
      setAdaptivePath([]);

      setRecentActivity([]);
      
      // Reset additional metrics on error
      setAttempts(0);
      setChatSessions(0);
      setWeakTopicsCount(0);
      setAdaptivePathCount(0);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      label: 'Neural Accuracy', 
      value: stats.accuracyRate, 
      icon: 'psychology', 
      trend: parseFloat(stats.accuracyRate) > parseFloat(stats.lifetimeAccuracy) ? 'Improving' : 'Analyzing', 
      trendColor: parseFloat(stats.accuracyRate) > parseFloat(stats.lifetimeAccuracy) ? 'text-secondary font-black' : 'text-tertiary' 
    },
    { label: 'Knowledge Points', value: stats.questionsAnswered.toLocaleString(), icon: 'military_tech', trend: stats.questionsAnswered > 0 ? 'Updating' : 'Starting', trendColor: 'text-tertiary' },
    { 
      label: 'Study Streak', 
      value: `${stats.studyStreak} days`, 
      icon: 'local_fire_department', 
      trend: parseInt(stats.studyStreak) > 0 ? `Active` : 'Start today', 
      trendColor: parseInt(stats.studyStreak) > 7 ? 'text-tertiary font-black' : parseInt(stats.studyStreak) > 0 ? 'text-secondary' : 'text-on-surface-variant' 
    },
    { label: 'Quiz Attempts', value: attempts, icon: 'quiz', trend: attempts > 0 ? 'Dynamic' : 'Get Started', trendColor: 'text-primary' },
    { label: 'Chat Sessions', value: chatSessions, icon: 'chat', trend: chatSessions > 0 ? 'Active' : 'Try AI', trendColor: 'text-secondary' },
    { label: 'Weak Topics', value: weakTopicsCount, icon: 'trending_down', trend: weakTopicsCount > 0 ? 'Focus Set' : 'Determined', trendColor: 'text-error' },
    { label: 'Learning Paths', value: adaptivePathCount, icon: 'route', trend: adaptivePathCount > 0 ? 'Boosted' : 'Not Set', trendColor: 'text-tertiary font-black' },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Layout>
      {!loading && <OnboardingGuide totalAttempts={attempts} />}
      <div className="flex min-h-screen overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-surface overflow-x-hidden">
          {/* Top Navigation */}
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 border-b border-outline-variant/15 glass-nav sticky top-0 z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors"
                aria-label="Toggle Menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">
                  menu
                </span>
              </button>
              
              <div className="flex items-center flex-1 max-w-xs sm:max-w-md">
                <div className="relative w-full group hidden xs:block">
                  <span className="material-symbols-outlined absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px] sm:text-[20px]">search</span>
                  <input className="w-full bg-surface-container-lowest border-none rounded-lg sm:rounded-xl pl-8 sm:pl-10 pr-12 sm:pr-16 text-xs sm:text-sm py-1.5 sm:py-2 focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50" placeholder="Search resources or ask AI..." type="text"/>
                  <kbd className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-1 sm:px-1.5 py-0.5 rounded border border-outline-variant/30 text-[8px] sm:text-[10px] text-on-surface-variant font-mono bg-surface-container hidden sm:block">CMD+K</kbd>
                </div>
                {/* Dashboard Title for Mobile */}
                <div className="xs:hidden flex items-center">
                  <h1 className="text-lg font-bold text-on-surface">Dashboard</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <button className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors relative">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">notifications</span>
                  <span className="absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-tertiary rounded-full border border-surface"></span>
                </button>
                <button className="hidden sm:flex w-8 h-8 sm:w-10 sm:h-10 items-center justify-center rounded-lg sm:rounded-xl bg-surface-container hover:bg-surface-bright transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] sm:text-[20px]">settings</span>
                </button>
              </div>
              <div className="hidden lg:block h-6 sm:h-8 w-[1px] bg-outline-variant/20 mx-2"></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-on-surface">{user?.name || 'Pro Learner'}</p>
                  <p className="text-[8px] text-on-surface-variant">Pro Scholar</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full border border-primary/20 p-0.5">
                  <img className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyJEFQcyZzGrR1bedSMcaRTD6WOS0C2ILFu4ldMGf51d6EJ3OLL_0I5l-W4sWW2wM0EN0F7KoIJZqyC6EPeywJMBZQh-nRD1R9bFfdLPWKySjF8O7qm3Wxy4dElKEEM_XCdNEHtreEKX_sumlOY3_X9J5f8JI1YZPkOnyfLXvnt7HcMxyW4Qp-rHIRHyowW3xKRLQVUBAs0fN_0y3aeWrPJpfXw6XReET0oOcKg8IHXKax8rPUuUM5ySDjhlsgNnM7ZmEPFyGbm2tw" alt="User profile avatar"/>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-surface to-surface-container/30">
            <div className="p-4 sm:p-4 lg:p-6 xl:p-8 flex flex-col gap-4 sm:gap-4 lg:gap-6 xl:gap-8 w-full">
            {/* Header Section */}
            <section className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-4">
                {/* Greeting Section */}
                <div className="flex flex-col gap-3">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-on-surface tracking-tight">
                    {getGreeting()}, <span className="text-primary">{user?.name || 'Student'}</span>
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-surface-container-high to-surface-container border border-outline-variant/20 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                      <p className="text-on-surface font-semibold text-sm">{currentDate}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-tertiary/20 to-tertiary/10 border border-tertiary/30 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-sm"></span>
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">System Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={loadDashboardData} 
                    id="dashboard-refresh"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-surface-container to-surface-container-high border border-outline-variant/20 text-on-surface text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    <span>Refresh</span>
                  </button>
                  <button 
                    onClick={() => navigate('/chat')} 
                    id="dashboard-launch-ai"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/90 text-on-primary text-sm font-bold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 shadow-lg"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Launch AI</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Neural Mastery Insights - Multi-dimensional proactive coaching */}
            <section className="mx-2 sm:mx-1 md:mx-0 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-xl">insights</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Proactive Mastery Engine</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-on-surface-variant font-medium italic">ML-Driven Competitive Analysis Platform</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/quiz')}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  <span>Start Mastery Session</span>
                  <span className="material-symbols-outlined text-sm">bolt</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                {proactiveInsights.length > 0 ? (
                  proactiveInsights.map((insight, idx) => (
                    <div 
                      key={idx} 
                      className={`relative bg-gradient-to-br border rounded-3xl p-6 overflow-hidden group hover:scale-[1.01] transition-all duration-300 shadow-sm hover:shadow-xl ${
                        insight.type === 'competitive' ? 'from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/20' :
                        insight.type === 'prediction' ? 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/20' :
                        insight.type === 'persona' ? 'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/20' :
                        'from-primary/15 via-primary/5 to-transparent border-primary/20'
                      }`}
                    >
                      {/* Decorative background element */}
                      <div className={`absolute -right-4 -bottom-4 size-32 opacity-10 group-hover:rotate-12 transition-transform duration-700 ${
                        insight.type === 'competitive' ? 'text-purple-500' :
                        insight.type === 'prediction' ? 'text-amber-500' :
                        insight.type === 'persona' ? 'text-emerald-500' :
                        'text-primary'
                      }`}>
                        <span className="material-symbols-outlined text-[120px]">
                        {insight.type === 'competitive' ? 'stars' :
                             insight.type === 'prediction' ? 'trending_up' :
                             insight.type === 'persona' ? 'face' : 'psychology'}
                        </span>
                      </div>

                      <div className="flex items-start gap-3 relative z-10">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 duration-500 ${
                          insight.type === 'competitive' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                          insight.type === 'prediction' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          insight.type === 'persona' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-primary/20 text-primary border-primary/30'
                        }`}>
                          <span className="material-symbols-outlined text-lg">
                            {insight.type === 'competitive' ? 'workspace_premium' :
                             insight.type === 'prediction' ? 'query_stats' :
                             insight.type === 'persona' ? 'psychology_alt' : 'auto_awesome'}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-white tracking-tight">{insight.title}</h4>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border ${
                              insight.type === 'competitive' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                              insight.type === 'prediction' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                              insight.type === 'persona' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                              'text-primary border-primary/30 bg-primary/10'
                            }`}>
                              {insight.type}
                            </span>
                          </div>
                          <p className="text-on-surface-variant text-[11px] leading-snug font-medium">
                            {insight.content}
                          </p>
                          <div className="pt-2 flex items-center gap-2 group/action pointer-events-none">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${
                              insight.type === 'competitive' ? 'text-purple-400' :
                              insight.type === 'prediction' ? 'text-amber-400' :
                              insight.type === 'persona' ? 'text-emerald-400' :
                              'text-primary'
                            }`}>Next:</span>
                            <span className="text-[10px] font-bold text-on-surface opacity-80">{insight.action_item}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-surface-container-low border border-outline-variant/10 rounded-3xl p-8 text-center relative overflow-hidden">
                    {/* Background decorative pulse */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="size-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10 shadow-inner">
                        <span className="material-symbols-outlined text-3xl text-outline animate-spin-slow">neurology</span>
                      </div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-lg font-bold text-white">Neural Analysis Initializing</h4>
                        <p className="text-on-surface-variant text-sm px-4">
                          Our Proactive AI is ready to map your knowledge gaps. Complete at least one adaptive quiz to unlock multi-dimensional mastery insights that traditional static platforms can't provide.
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate('/quiz')}
                        className="mt-4 px-8 py-3 rounded-2xl bg-primary text-on-primary font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span>Start Adaptive Quiz</span>
                        <span className="material-symbols-outlined">rocket_launch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Analytics Grid */}
            <section id="dashboard-stats" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-3 lg:gap-4 mx-2 sm:mx-1 md:mx-0">
              {statCards.map((stat, i) => (
                <div key={i} className="p-4 sm:p-4 lg:p-5 xl:p-6 rounded-2xl bg-gradient-to-br from-surface-container-low to-surface-container border border-outline-variant/10 flex flex-col gap-3 sm:gap-3 lg:gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 min-h-[100px] sm:min-h-[110px] lg:min-h-[130px] shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 sm:w-10 sm:h-12 lg:w-12 lg:h-14 xl:w-14 xl:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-primary text-[14px] sm:text-[16px] lg:text-[18px] xl:text-[20px]">{stat.icon}</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] lg:text-[11px] xl:text-[12px] font-bold ${stat.trendColor} hidden xs:block`}>{stat.trend}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-on-surface-variant text-[10px] sm:text-[11px] lg:text-xs xl:text-sm font-medium mb-1 line-clamp-1">{stat.label}</p>
                    <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-on-surface">{stat.value}</p>
                  </div>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mx-2 sm:mx-1 md:mx-0">
              {/* Objectives Section */}
              <div id="dashboard-objectives" className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-headline font-bold text-on-surface">Active Study Objectives</h3>
                  <button className="text-primary text-xs sm:text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/20 scrollbar-track-transparent pr-2">
                  {adaptivePath.length > 0 ? (
                    adaptivePath.map((item, idx) => (
                      <div key={idx} className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-surface-container hover:bg-surface-bright transition-colors cursor-pointer group">
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-12 lg:w-12 lg:h-14 rounded-lg sm:rounded-xl bg-surface-container-high flex items-center justify-center border border-outline-variant/10 shrink-0">
                              <span className={`material-symbols-outlined text-[14px] sm:text-[16px] lg:text-[18px] ${
                                item.priority === 'high' ? 'text-secondary' : 
                                item.priority === 'medium' ? 'text-primary' : 'text-tertiary'
                              }`}>
                                {item.difficulty === 'hard' ? 'fitness_center' : 
                                 item.difficulty === 'medium' ? 'school' : 'lightbulb'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm sm:text-base font-bold text-on-surface truncate">{item.topic}</p>
                              <p className="text-xs text-on-surface-variant line-clamp-2 sm:line-clamp-1">
                                {item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) + ' Difficulty' : 'Advanced Studies'} • 
                                {item.priority ? ' ' + item.priority.charAt(0).toUpperCase() + item.priority.slice(1) + ' Priority' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-tight ${
                                item.priority === 'high' ? 'bg-error/10 text-error' : 
                                item.priority === 'medium' ? 'bg-secondary/10 text-secondary' : 'bg-tertiary/10 text-tertiary'
                              }`}>
                                {item.priority === 'high' ? 'Focus' : item.priority === 'medium' ? 'Practice' : 'Review'}
                              </span>
                              <span className="text-xs sm:text-sm font-mono font-bold text-on-surface">{Math.round(item.current_accuracy || 0)}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-1 overflow-hidden mt-3">
                          <div className={`h-full rounded-full transition-all duration-700 ${
                            item.priority === 'high' ? 'bg-secondary' : 
                            item.priority === 'medium' ? 'bg-primary' : 'bg-tertiary'
                          }`} style={{width: `${item.current_accuracy || 0}%`}}></div>
                        </div>
                        {item.recommended_actions && item.recommended_actions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {item.recommended_actions.slice(0, 2).map((action, actionIdx) => (
                              <span key={actionIdx} className="text-[8px] sm:text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded">
                                • {action}
                              </span>
                            ))}
                            {item.recommended_actions.length > 2 && (
                              <span className="text-[8px] sm:text-[10px] text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded">
                                +{item.recommended_actions.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface-container text-center">
                      <span className="material-symbols-outlined text-tertiary text-3xl sm:text-4xl">psychology</span>
                      <p className="text-on-surface-variant font-medium mt-2 text-sm sm:text-base">
                        {adaptivePath.length === 0 ? 'No active study objectives. Take a quiz to generate your learning path!' : 'Loading study objectives...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {/* Activity Feed */}
              <div id="dashboard-activity" className="flex flex-col gap-4 sm:gap-6">
                <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-headline font-bold text-on-surface">Recent Activity</h3>
                <div className="relative flex flex-col gap-3 sm:gap-4 lg:gap-6 pl-3 sm:pl-4 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant/20 scrollbar-track-transparent pr-2">
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] sm:left-[19px] top-2 bottom-2 w-[1px] bg-outline-variant/20"></div>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <div key={activity.id} className="relative flex items-start gap-2 sm:gap-3 lg:gap-4">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 ring-3 sm:ring-4 shrink-0 z-10 ${
                          idx === 0 ? 'bg-primary ring-primary/10' : 
                          idx === 1 ? 'bg-secondary ring-secondary/10' : 
                          idx === 2 ? 'bg-tertiary ring-tertiary/10' : 
                          'bg-on-surface-variant/40 ring-on-surface-variant/5'
                        }`}></div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-on-surface font-bold truncate">{activity.title}</p>
                          <p className="text-[10px] sm:text-xs text-on-surface-variant line-clamp-2">{activity.description}</p>
                          <span className="text-[8px] sm:text-[10px] text-on-surface-variant/60 font-medium">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 sm:py-6">
                      <p className="text-on-surface-variant text-xs sm:text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
