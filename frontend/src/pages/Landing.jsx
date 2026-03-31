import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleTryDemo = () => {
    navigate('/login');
  };

  return (
    <div className="font-body text-on-surface selection:bg-primary selection:text-on-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0c1324] no-border transition-colors duration-300">
        <div className="flex justify-between items-center px-16 py-6 max-w-[1440px] mx-auto">
          <div className="text-xl font-bold text-white tracking-tight font-headline">IntelliTutor AI</div>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-[#c7c4d7] hover:text-white transition-all duration-200 font-manrope text-base tracking-tight" href="#features">Features</a>
            <a className="text-[#c7c4d7] hover:text-white transition-all duration-200 font-manrope text-base tracking-tight" href="#how-it-works">How it Works</a>
            <a className="text-[#c7c4d7] hover:text-white transition-all duration-200 font-manrope text-base tracking-tight" href="#benefits">Benefits</a>
            <a className="text-[#c7c4d7] hover:text-white transition-all duration-200 font-manrope text-base tracking-tight" href="#pricing">Pricing</a>
          </div>
          <button 
            onClick={handleGetStarted}
            className="signature-gradient text-on-primary-fixed px-6 py-2.5 rounded-xl font-semibold active:scale-95 duration-150 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>
      
      <main className="pt-32">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
          <div className="flex flex-col gap-8">
            <h1 className="text-[3.5rem] leading-[1.1] font-extrabold font-headline text-white -tracking-[0.02em]">
              Your AI-Powered <span className="text-primary">Personalized</span> Learning Companion
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-lg">
              Adaptive learning, spaced repetition, and intelligent tutoring — all in one platform.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleGetStarted}
                className="signature-gradient text-on-primary-fixed px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                Get Started
              </button>
              <button 
                onClick={handleTryDemo}
                className="border border-outline-variant/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-all active:scale-95"
              >
                Try Demo
              </button>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-tertiary/20 rounded-2xl blur-2xl group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-surface-container-low rounded-2xl p-4 shadow-2xl border border-outline-variant/10 overflow-hidden">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-error/40"></div>
                <div className="w-3 h-3 rounded-full bg-primary/40"></div>
                <div className="w-3 h-3 rounded-full bg-tertiary/40"></div>
              </div>
              <img className="rounded-xl w-full h-auto object-cover border border-outline-variant/10" alt="Dark sophisticated AI tutoring dashboard interface" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpW-fdRdC-EsecRpraC6WJkTl6vBjaSj1tx5uxN0vOkwKkk_ffa4ta_qkbGgNu57RbHNE4-e3LWRufxqBAFhAEeixBXfkF6mBBuSjis8lnz_0ct0r-JtV_wpO3kzxfll4wcYt9ztvCuRD8fIkpI2Uzsyrw7pejfUobotvOill31nqEroveOiD5ttgD18qT-7S2xSobGzbRYhB6PzpXhbkSprISAWtniW1-puQZM2d6v_luGahJdL5B_2VgazwRJM8l1cNHJH8B-qIC"/>
            </div>
          </div>
        </section>

        {/* Trust & Stats */}
        <section className="bg-surface-container-lowest py-24 mb-40">
          <div className="max-w-[1440px] mx-auto px-16 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-[0.1em] uppercase text-on-surface-variant">Built for modern learners</span>
              <div className="flex gap-12 opacity-50 grayscale contrast-150">
                <span className="text-2xl font-bold text-white tracking-tighter">VERSITY</span>
                <span className="text-2xl font-bold text-white tracking-tighter">EDUTECH</span>
                <span className="text-2xl font-bold text-white tracking-tighter">LEARN.CO</span>
              </div>
            </div>
            <div className="flex gap-20">
              <div className="text-center">
                <div className="text-5xl font-extrabold font-headline text-tertiary mb-2">10x</div>
                <div className="text-sm text-on-surface-variant font-medium">Faster learning</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-extrabold font-headline text-primary mb-2">95%</div>
                <div className="text-sm text-on-surface-variant font-medium">Retention improvement</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-[1440px] mx-auto px-16 mb-40">
          <div className="mb-20">
            <h2 className="text-4xl font-extrabold font-headline text-white mb-4">Master any subject with AI</h2>
            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">psychology</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Adaptive Learning Engine</h3>
              <p className="text-on-surface-variant leading-relaxed">System dynamicly adjusts difficulty based on your real-time performance and cognitive load.</p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">track_changes</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Weak Topic Detection</h3>
              <p className="text-on-surface-variant leading-relaxed">Our AI pinpoints exactly where you struggle and builds custom exercises to bridge the gaps.</p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Tutor Chat</h3>
              <p className="text-on-surface-variant leading-relaxed">24/7 access to a personal tutor that explains complex concepts in simple, relatable terms.</p>
            </div>
            {/* Feature 4 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Spaced Repetition</h3>
              <p className="text-on-surface-variant leading-relaxed">Scientifically-backed review schedules ensure long-term retention of every fact you learn.</p>
            </div>
            {/* Feature 5 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">dashboard</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analytics Dashboard</h3>
              <p className="text-on-surface-variant leading-relaxed">Visualize your progress, mastery levels, and study time with intuitive, clean data visualizations.</p>
            </div>
            {/* Feature 6 */}
            <div className="p-8 bg-surface-container-low rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Personalized Study Plans</h3>
              <p className="text-on-surface-variant leading-relaxed">Automatically generated schedules that fit your goals and timeline perfectly.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-[1440px] mx-auto px-16 mb-40">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-extrabold font-headline text-white mb-4">Simple, Proven Process</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Mastering any subject has never been more systematic and intuitive.</p>
          </div>
          <div className="relative flex flex-col md:flex-row justify-between items-start gap-12">
            {/* Connectors for Desktop */}
            <div className="hidden md:block absolute top-10 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent -z-10"></div>
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-high border-4 border-surface border-t-primary flex items-center justify-center text-white font-bold text-xl mb-6 shadow-xl transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined">quiz</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Take quiz</h4>
              <p className="text-sm text-on-surface-variant">Assess your starting point with a smart diagnostic.</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-high border-4 border-surface border-t-tertiary flex items-center justify-center text-white font-bold text-xl mb-6 shadow-xl transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI analyzes</h4>
              <p className="text-sm text-on-surface-variant">The core engine identifies your unique neural footprint.</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-high border-4 border-surface border-t-primary flex items-center justify-center text-white font-bold text-xl mb-6 shadow-xl transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined">extension</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">System adapts</h4>
              <p className="text-sm text-on-surface-variant">Course content reshapes to prioritize your needs.</p>
            </div>
            <div className="flex-1 flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-surface-container-high border-4 border-surface border-t-tertiary flex items-center justify-center text-white font-bold text-xl mb-6 shadow-xl transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined">update</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Spaced repetition</h4>
              <p className="text-sm text-on-surface-variant">Review at the exact moment before you forget.</p>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="max-w-[1440px] mx-auto px-16 mb-40">
          <div className="relative rounded-[2rem] bg-surface-container-low p-2 md:p-12 overflow-hidden border border-outline-variant/10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <img className="rounded-xl w-full h-auto object-cover shadow-2xl" alt="Complete AI tutor platform dashboard visualization" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABFVwO2IPspjHU9wvchkI6EDY2Ze-AAyoVpS0IKN3YpWLMcbdO0NwGJf4kOEKpyvpNUafIHjQLpbVwqb2V7pC1CyZ0EEIVu3576UCpHhG9Kcs34Mh6SDoO98IGFsv0ux-BRVdSHY-hEbmoyAq4yUjWcLgC2ykznlJJ1ZMujCz08b6hlIcx8lZapDLhwYUx8VsRmXHIbqTLqznQvsRpcs6AGZfFxh5CCUlFz8-C2O4tczOaGKResS1mT8amIQAgRPGHrBMPbU5hjrO_"/>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="flex flex-col gap-4">
                <div className="text-primary font-bold tracking-widest text-[0.6875rem] uppercase">Interface</div>
                <h5 className="text-xl font-bold text-white">Intuitive Workspace</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">Designed for focus, our workspace removes distractions and keeps your learning goals front and center.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-tertiary font-bold tracking-widest text-[0.6875rem] uppercase">AI Interaction</div>
                <h5 className="text-xl font-bold text-white">Natural Conversation</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">Ask questions in plain English and get step-by-step explanations, diagrams, and examples.</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="text-primary font-bold tracking-widest text-[0.6875rem] uppercase">Progress</div>
                <h5 className="text-xl font-bold text-white">Real-time Feedback</h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">Every action you take informs your learning profile, showing you exactly how close you are to mastery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="max-w-[1440px] mx-auto px-16 mb-40 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="bg-surface-container p-10 rounded-2xl flex flex-col gap-6 items-start">
            <div className="text-tertiary text-4xl"><span className="material-symbols-outlined" style={{fontSize: "48px"}}>bolt</span></div>
            <h4 className="text-2xl font-extrabold font-headline text-white leading-tight">Learn faster than traditional methods</h4>
            <p className="text-on-surface-variant">Cut out the fluff. Our AI identifies what you already know and skips it, focusing only on the new skills you need to acquire.</p>
          </div>
          <div className="bg-surface-container p-10 rounded-2xl flex flex-col gap-6 items-start">
            <div className="text-primary text-4xl"><span className="material-symbols-outlined" style={{fontSize: "48px"}}>center_focus_strong</span></div>
            <h4 className="text-2xl font-extrabold font-headline text-white leading-tight">Laser focus on your weak areas</h4>
            <p className="text-on-surface-variant">Don't waste time on repetitive drills. We generate targeted challenges that force growth in the exact concepts you find difficult.</p>
          </div>
          <div className="bg-surface-container p-10 rounded-2xl flex flex-col gap-6 items-start">
            <div className="text-tertiary text-4xl"><span className="material-symbols-outlined" style={{fontSize: "48px"}}>neurology</span></div>
            <h4 className="text-2xl font-extrabold font-headline text-white leading-tight">Retain knowledge for the long term</h4>
            <p className="text-on-surface-variant">Using cognitive science principles, we prompt you to recall information at the optimal psychological moment to cement it in memory.</p>
          </div>
        </section>

        {/* The IntelliTutor Difference (Unique Selling Prop) */}
        <section className="bg-surface-container-lowest py-24 mb-40 border-y border-outline-variant/10">
          <div className="max-w-[1440px] mx-auto px-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold font-headline text-white mb-4">The IntelliTutor Difference</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Why we aren't just another video repository or question bank.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-surface/50 p-8 rounded-[2rem] border border-outline-variant/10">
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-error/20 text-error flex items-center justify-center text-sm">X</span>
                  Traditional Platforms (Byju's/Coursera)
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">close</span>
                    <span>Static video libraries which follow a "one-size-fits-all" path.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">close</span>
                    <span>Passive learning through watching/reading with minimal adaptation.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">close</span>
                    <span>Forget-prone cycles with no scientific review scheduling.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-error">close</span>
                    <span>Generic feedback that doesn't explain "Why" you missed it.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/20 transition-all"></div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm">✓</span>
                  IntelliTutor AI (Proactive Tutoring)
                </h4>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
                    <span><strong>Proactive Adaptation:</strong> ML models curate your lessons in real-time based on mastery.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
                    <span><strong>Scaffolded Learning:</strong> Hints and prerequisite mapping (Concept Maps) ensure zero frustration.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
                    <span><strong>Neural Retention:</strong> Spaced repetition scheduler Tuned to YOUR memory cycle.</span>
                  </li>
                  <li className="flex items-start gap-3 text-on-surface text-sm font-medium">
                    <span className="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
                    <span><strong>Explainable AI:</strong> Feedback that targets misconceptions, not just errors.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="max-w-[1440px] mx-auto px-16 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container-low p-12 rounded-2xl border border-outline-variant/10 flex flex-col gap-8">
              <div className="flex text-tertiary gap-1">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              </div>
              <p className="text-2xl font-medium font-body leading-relaxed text-white italic">"IntelliTutor AI completely transformed how I prepared for my exams. The spaced repetition felt like magic — I actually remembered everything on test day."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Portrait of a male student" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD06tZbbrqyVd-J-lEfo5TyKLP64DTSCNJ6oPd5pROMHVQIQAGCUgr3dpHxwcicEXnCAkb4H8Ye5CBQMAxp-4Dz4wQaC11Nr6CCC0oThtJVkE3CVUGsDggCDF5phRqMIEfqVNuBJhVQfxner3RJs4xgwyoshoQti--BQDC3EEsKQseXF-gjNTRtfovdfLyzqgD80busPrLKjtC3td2-M4ZfGhbngXIbJ4UvLBuUwf7FvsADBfol4DUBOSzYBdxdOJgdKsfQDVULTm5s"/>
                </div>
                <div>
                  <div className="font-bold text-white">Alex Chen</div>
                  <div className="text-sm text-on-surface-variant">Graduate Student, MIT</div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-12 rounded-2xl border border-outline-variant/10 flex flex-col gap-8">
              <div className="flex text-tertiary gap-1">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              </div>
              <p className="text-2xl font-medium font-body leading-relaxed text-white italic">"As a professional learning a new language, I don't have hours to waste. This system identifies my errors instantly and focuses my limited time where it matters."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden">
                  <img className="w-full h-full object-cover" alt="Portrait of a female professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjH91lxk_C5iCb9FUvO-k3QeSowDQkupbWDP7wbPrDdR1Y3Nn4Hc4FvibXWdfEEW03IpxcfaAUEg6Ylli_yooAK1OdwWBG0zQQ2JbNfyk4oEW8a2TKCyQfdhpeD37yDaUi5LFgT6ra6L0GmyWm6IcrOE2Gp9xPDx233NTGPqN5eD8JugRg7N1SDQaRPMxPH2EThXzlpdTyOM4KswgBYi0vRjhMdBtTo5SKeWFoIdFHhKglXSy_ltnh0KHBbO3k7yu1_7UxsProUuLM"/>
                </div>
                <div>
                  <div className="font-bold text-white">Sarah Jenkins</div>
                  <div className="text-sm text-on-surface-variant">Senior Engineer</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-[1440px] mx-auto px-16 mb-40 text-center">
          <div className="relative py-24 rounded-[3rem] bg-surface-container-lowest overflow-hidden border border-outline-variant/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
            <h2 className="text-5xl font-extrabold font-headline text-white mb-8 relative z-10">Start your intelligent learning journey today</h2>
            <button 
              onClick={handleGetStarted}
              className="signature-gradient text-on-primary-fixed px-12 py-5 rounded-xl font-bold text-xl relative z-10 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#070d1f] w-full py-20 px-16 tonal-shift-bg-surface-lowest">
        <div className="grid grid-cols-4 gap-20 max-w-[1440px] mx-auto">
          <div className="flex flex-col gap-6 col-span-4 md:col-span-1">
            <div className="text-lg font-bold text-white font-headline">IntelliTutor AI</div>
            <p className="text-sm text-[#c7c4d7] leading-relaxed">Pioneering the future of education with advanced neural learning models and personalized cognitive mapping.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-white font-bold font-inter text-sm leading-6">Product</div>
            <div className="flex flex-col gap-4 text-[#c7c4d7] text-sm font-inter">
              <a className="hover:text-[#4edea3] transition-colors" href="#features">Platform Overview</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#pricing">Pricing Plans</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#features">AI Engine</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#features">Study Tools</a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-white font-bold font-inter text-sm leading-6">Company</div>
            <div className="flex flex-col gap-4 text-[#c7c4d7] text-sm font-inter">
              <a className="hover:text-[#4edea3] transition-colors" href="#about">About Us</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#careers">Careers</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#blog">Blog</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#contact">Contact</a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-white font-bold font-inter text-sm leading-6">Legal</div>
            <div className="flex flex-col gap-4 text-[#c7c4d7] text-sm font-inter">
              <a className="hover:text-[#4edea3] transition-colors" href="#privacy">Privacy Policy</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#terms">Terms of Service</a>
              <a className="hover:text-[#4edea3] transition-colors" href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-16 mt-20 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-[#c7c4d7] text-sm font-inter">© 2026 IntelliTutor AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
