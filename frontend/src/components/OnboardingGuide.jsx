import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';

const OnboardingGuide = ({ totalAttempts = 0 }) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if user has already seen the tour OR if they have activity
    // A user with quiz attempts is not "new"
    const hasSeenTour = localStorage.getItem('intelli-tutor-onboarding-seen');
    
    // Only run if they haven't seen it AND they have 0 attempts (truly new)
    if (!hasSeenTour && totalAttempts === 0) {
      setRun(true);
      // Mark as "started" so refresh during tour doesn't restart it if preferred, 
      // but usually we set it on finish/skip.
    }
  }, [totalAttempts]);

  const steps = [
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold mb-2 text-primary">Beyond Traditional Learning 🧠</h2>
          <p className="text-slate-300">
            Welcome to a <strong>proactive</strong> study partner. Unlike static video platforms, 
            IntelliTutor uses Machine Learning to adapt to YOUR brain. We don't just give you content; 
            we build your <strong>Mastery Path</strong>.
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '#dashboard-stats',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-primary mb-1">Your Neural Learning Profile</h3>
          <p className="text-sm text-slate-300">
            We track <strong>formative assessments</strong> and <strong>response patterns</strong>. 
            This isn't just a score; it's a real-time map of your mastery, used to predict your 
            performance before you even start a quiz.
          </p>
        </div>
      ),
    },
    {
      target: '#dashboard-objectives',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-primary mb-1">Dynamic Adaptive Pathways</h3>
          <p className="text-sm text-slate-300">
            I proactively select <strong>micro-lessons</strong> and <strong>practice exercises</strong> 
            based on your current mastery. If you're struggling, I'll scaffold your learning with 
            hints to prevent frustration.
          </p>
        </div>
      ),
    },
    {
      target: '#sidebar-concept-maps',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-primary mb-1">Visualize Prerequisite Knowledge</h3>
          <p className="text-sm text-slate-300">
            Before jumping into new topics, use <strong>Concept Maps</strong> to see how 
            prerequisites connect. It ensures you never feel lost when encountering 
            "zero knowledge" areas.
          </p>
        </div>
      ),
    },
    {
      target: '#sidebar-spaced-review',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-primary mb-1">Stop the Forgetting Curve</h3>
          <p className="text-sm text-slate-300">
            Our <strong>AI Spaced Repetition Scheduler</strong> mathematically tunes your 
            review intervals. You'll gain long-term retention with 50% less study time 
            compared to manual review.
          </p>
        </div>
      ),
    },
    {
      target: '#dashboard-launch-ai',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-primary mb-1">Explainable Feedback 24/7</h3>
          <p className="text-sm text-slate-300">
            When you're stuck, our AI doesn't just give answers. It provides 
            <strong>explainable feedback</strong> that clarifies misconceptions and 
            points you to specifically relevant micro-lessons.
          </p>
        </div>
      ),
    },
    {
      target: 'body',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold mb-2 text-primary">Your Success, Predicted.</h2>
          <p className="text-slate-300">
            By combining learning science with cutting-edge AI, we democratize elite tutoring. 
            Ready to experience the <strong>IntelliTutor Difference</strong>?
          </p>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('intelli-tutor-onboarding-seen', 'true');
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#1e293b',
          backgroundColor: '#1e293b',
          overlayColor: 'rgba(2, 6, 23, 0.85)',
          primaryColor: '#8083ff',
          textColor: '#f8fafc',
          width: 400,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '24px',
          padding: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(128, 131, 255, 0.3)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5), 0 0 20px rgba(128, 131, 255, 0.1)',
        },
        tooltipContainer: {
          textAlign: 'left',
          lineHeight: 1.6,
        },
        tooltipTitle: {
          fontSize: '20px',
          fontWeight: '800',
          marginBottom: '10px',
          color: '#8083ff',
        },
        tooltipContent: {
          padding: '0',
          fontSize: '15px',
          color: '#cbd5e1',
        },
        buttonNext: {
          backgroundColor: '#8083ff',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(128, 131, 255, 0.3)',
        },
        buttonBack: {
          color: '#94a3b8',
          marginRight: '15px',
          fontSize: '14px',
          fontWeight: '600',
        },
        buttonSkip: {
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '500',
        },
        progress: {
          height: '4px',
          borderRadius: '2px',
          backgroundColor: 'rgba(128, 131, 255, 0.2)',
        }
      }}
    />
  );
};

export default OnboardingGuide;
