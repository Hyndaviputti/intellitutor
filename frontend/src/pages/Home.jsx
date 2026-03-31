import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load the external CSS and fonts
    const link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link1);

    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link2);

    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(link1);
      document.head.removeChild(link2);
      document.head.removeChild(script);
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleTryDemo = () => {
    navigate('/demo');
  };

  return (
    <div className="dark" style={{ backgroundColor: '#0c1324', color: '#dce1fb', fontFamily: "'Inter', sans-serif" }}>
      {/* Tailwind Config Script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "on-secondary-fixed": "#001a42",
                  "secondary-container": "#0566d9",
                  "on-primary": "#1000a9",
                  "on-surface": "#dce1fb",
                  "primary-container": "#8083ff",
                  "background": "#0c1324",
                  "outline-variant": "#464554",
                  "on-primary-fixed-variant": "#2f2ebe",
                  "outline": "#908fa0",
                  "primary": "#c0c1ff",
                  "on-secondary-fixed-variant": "#004395",
                  "on-tertiary": "#003824",
                  "surface-container-low": "#151b2d",
                  "on-error": "#690005",
                  "tertiary-fixed-dim": "#4edea3",
                  "on-primary-container": "#0d0096",
                  "inverse-on-surface": "#2a3043",
                  "inverse-surface": "#dce1fb",
                  "on-tertiary-fixed-variant": "#005236",
                  "tertiary-fixed": "#6ffbbe",
                  "on-tertiary-container": "#000703",
                  "on-tertiary-fixed": "#002113",
                  "on-primary-fixed": "#07006c",
                  "tertiary-container": "#00885d",
                  "secondary-fixed": "#d8e2ff",
                  "secondary-fixed-dim": "#adc6ff",
                  "on-background": "#dce1fb",
                  "primary-fixed-dim": "#c0c1ff",
                  "primary-fixed": "#e1e0ff",
                  "surface-container-lowest": "#070d1f",
                  "tertiary": "#4edea3",
                  "surface-variant": "#2e3447",
                  "error": "#ffb4ab",
                  "surface-container": "#191f31",
                  "error-container": "#93000a",
                  "inverse-primary": "#494bd6",
                  "secondary": "#adc6ff",
                  "on-secondary": "#002e6a",
                  "surface-container-highest": "#2e3447",
                  "surface-tint": "#c0c1ff",
                  "on-surface-variant": "#c7c4d7",
                  "surface-bright": "#33394c",
                  "surface-container-high": "#23293c",
                  "on-error-container": "#ffdad6",
                  "surface": "#0c1324",
                  "surface-dim": "#0c1324",
                  "on-secondary-container": "#e6ecff"
                },
                fontFamily: {
                  "headline": ["Manrope", "sans-serif"],
                  "body": ["Inter", "sans-serif"],
                  "label": ["Inter", "sans-serif"]
                },
                borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
              },
            },
          }
        `
      }} />

      <style dangerouslySetInnerHTML={{
        __html: `
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          body {
            background-color: #0c1324;
            color: #dce1fb;
            font-family: 'Inter', sans-serif;
          }
          .signature-gradient {
            background: linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%);
          }
        `
      }} />

      {/* Shared TopAppBar */}
      <div className="relative flex h-auto w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#0c1324' }}>
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-4 sm:px-6 md:px-20 lg:px-40 py-4" style={{ borderColor: 'rgba(198, 40, 40, 0.15)' }}>
          <div className="flex items-center gap-4 text-white">
            <div className="w-6 h-6" style={{ color: '#c0c1ff' }}>
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg sm:text-xl font-bold leading-tight tracking-[-0.015em]" style={{ fontFamily: "'Manrope', sans-serif" }}>IntelliTutor AI</h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-6 lg:gap-8">
            <nav className="hidden lg:flex items-center gap-6 lg:gap-9">
              <a className="hover:text-white transition-colors text-sm font-medium" style={{ color: '#c7c4d7' }} href="#features">Features</a>
              <a className="hover:text-white transition-colors text-sm font-medium" style={{ color: '#c7c4d7' }} href="#how-it-works">How it Works</a>
              <a className="hover:text-white transition-colors text-sm font-medium" style={{ color: '#c7c4d7' }} href="#testimonials">Testimonials</a>
              
            </nav>
            <div className="hidden sm:flex gap-3 lg:gap-4">
              <button 
                onClick={handleGetStarted}
                className="flex min-w-[80px] lg:min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-3 lg:px-5 text-sm font-bold tracking-[0.015em] signature-gradient"
                style={{ color: '#07006c' }}
              >
                Get Started
              </button>
              <button 
                onClick={handleLogin}
                className="flex min-w-[70px] lg:min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-3 lg:px-5 text-white text-sm font-bold tracking-[0.015em] border"
                style={{ backgroundColor: '#2e3447', borderColor: 'rgba(198, 40, 40, 0.2)' }}
              >
                Login
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-colors" 
            style={{ backgroundColor: 'rgba(46, 52, 71, 0.5)' }}
          >
            <span className="material-symbols-outlined text-white">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50" style={{ backgroundColor: 'rgba(12, 19, 36, 0.95)' }}>
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(198, 40, 40, 0.15)' }}>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6" style={{ color: '#c0c1ff' }}>
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]" style={{ fontFamily: "'Manrope', sans-serif" }}>IntelliTutor AI</h2>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors" 
                  style={{ backgroundColor: 'rgba(46, 52, 71, 0.5)' }}
                >
                  <span className="material-symbols-outlined text-white">close</span>
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 flex flex-col p-4 gap-2">
                <a 
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors text-white hover:bg-white/10"
                  style={{ color: '#c7c4d7' }} 
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    const element = document.querySelector('#features');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="material-symbols-outlined">star</span>
                  <span className="font-medium">Features</span>
                </a>
                <a 
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors text-white hover:bg-white/10"
                  style={{ color: '#c7c4d7' }} 
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    const element = document.querySelector('#how-it-works');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="material-symbols-outlined">psychology</span>
                  <span className="font-medium">How it Works</span>
                </a>
                <a 
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors text-white hover:bg-white/10"
                  style={{ color: '#c7c4d7' }} 
                  href="#testimonials"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    const element = document.querySelector('#testimonials');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="material-symbols-outlined">format_quote</span>
                  <span className="font-medium">Testimonials</span>
                </a>
                <a 
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors text-white hover:bg-white/10"
                  style={{ color: '#c7c4d7' }} 
                  href="#pricing"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    const element = document.querySelector('#pricing');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span className="font-medium">Pricing</span>
                </a>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t" style={{ borderColor: 'rgba(198, 40, 40, 0.15)' }}>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center rounded-lg h-12 px-6 text-sm font-bold tracking-[0.015em] signature-gradient transition-colors"
                    style={{ color: '#07006c' }}
                  >
                    Get Started
                  </button>
                  <button 
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center rounded-lg h-12 px-6 text-white text-sm font-bold tracking-[0.015em] border transition-colors"
                    style={{ backgroundColor: '#2e3447', borderColor: 'rgba(198, 40, 40, 0.2)' }}
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex flex-col">
          <section className="px-4 sm:px-6 md:px-20 lg:px-40 py-12 sm:py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4">
                <h1 className="text-white font-extrabold leading-[1.1] tracking-tight text-3xl sm:text-4xl lg:text-5xl xl:text-6xl" style={{ fontFamily: "'Manrope', sans-serif" }}>
                  Your AI-Powered <span style={{ color: '#c0c1ff' }}>Personalized</span> Learning Companion
                </h1>
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-lg" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>
                  Adaptive learning, spaced repetition, and intelligent tutoring — all in one sophisticated platform designed for the modern mind.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={handleGetStarted}
                  className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all signature-gradient hover:shadow-xl"
                  style={{ color: '#07006c', boxShadow: '0 10px 25px -5px rgba(192, 193, 255, 0.1)' }}
                >
                  Get Started
                </button>
                {/*  */}
              </div>
            </div>
            <div className="relative group order-first md:order-last">
              <div className="absolute -inset-1 opacity-10 blur-2xl transition duration-1000 group-hover:opacity-20" style={{ background: 'linear-gradient(to right, #c0c1ff, #4edea3)' }}></div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.2)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <div className="w-full h-full bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBoBqTu85kaGN1MzMkXZohPhTpwx_b-yHebq0057en7Ru9-IE-Rk196ksBnQwpR_qgYUUK_fooXGbRKmMd6LpoltYFXt7Y3esswBsr-YGkYqGb00T-c3j42Xm08rCjPoCYwmKvkTQhByHcV42Z1lrhOpHGRNV1RFkyYAAiGWqmt0BBvDT62MSOsGL-1chuel5QpPWImQqyTlkaaNNVRxc-e6QkUt1uyhUThgnn2SfubNz-3uRMkt64xWlTBJGCW6PqPowD2kvJP2J_')" }}></div>
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(255, 180, 171, 0.4)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(78, 222, 163, 0.4)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(192, 193, 255, 0.4)' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust / Stats Section */}
          <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-20 lg:px-40" style={{ backgroundColor: '#070d1f' }}>
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-12">
              <div className="flex flex-col gap-2 text-center lg:text-left">
                <h3 className="text-xs uppercase tracking-[0.2em]" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Trusted by the Best</h3>
                <div className="flex gap-4 sm:gap-6 lg:gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
                  <div className="h-6 sm:h-8 w-16 sm:w-20 lg:w-24 rounded-md flex items-center justify-center text-[8px] sm:text-[10px] font-bold" style={{ backgroundColor: 'rgba(220, 225, 251, 0.2)' }}>TECHCORP</div>
                  <div className="h-6 sm:h-8 w-16 sm:w-20 lg:w-24 rounded-md flex items-center justify-center text-[8px] sm:text-[10px] font-bold" style={{ backgroundColor: 'rgba(220, 225, 251, 0.2)' }}>EDULABS</div>
                  <div className="h-6 sm:h-8 w-16 sm:w-20 lg:w-24 rounded-md flex items-center justify-center text-[8px] sm:text-[10px] font-bold" style={{ backgroundColor: 'rgba(220, 225, 251, 0.2)' }}>INNOVATE</div>
                </div>
              </div>
              <div className="flex gap-8 sm:gap-12 lg:gap-16">
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#4edea3', fontFamily: "'Manrope', sans-serif" }}>10x faster</span>
                  <span className="text-xs sm:text-sm" style={{ color: '#c7c4d7' }}>Learning Speed</span>
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#c0c1ff', fontFamily: "'Manrope', sans-serif" }}>95%</span>
                  <span className="text-xs sm:text-sm" style={{ color: '#c7c4d7' }}>Retention Rate</span>
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 md:px-20 lg:px-40">
            <div className="flex flex-col gap-12 sm:gap-16">
              <div className="max-w-2xl">
                <span className="text-xs uppercase tracking-[0.2em] mb-4 block" style={{ color: '#4edea3', fontFamily: "'Inter', sans-serif" }}>Capabilities</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Manrope', sans-serif" }}>Intelligence at every stage of learning.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Feature 1 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">psychology</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Adaptive Learning Engine</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Our AI analyzes your unique learning style and difficulty threshold to curate content in real-time.</p>
                </div>

                {/* Feature 2 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">target</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Weak Topic Detection</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Automatically identifies knowledge gaps and prioritizes those concepts in your daily curriculum.</p>
                </div>

                {/* Feature 3 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">chat_bubble</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>AI Tutor Chat</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>24/7 access to an intelligent tutor that explains complex topics using analogies you understand.</p>
                </div>

                {/* Feature 4 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">update</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Spaced Repetition</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Scientifically-timed reviews ensure that information moves from short-term to long-term memory.</p>
                </div>

                {/* Feature 5 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">bar_chart</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Analytics Dashboard</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Visual intelligence reporting that shows exactly how your proficiency grows day by day.</p>
                </div>

                {/* Feature 6 */}
                <div className="p-6 sm:p-8 rounded-2xl transition-all group hover:shadow-xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)', color: '#c0c1ff' }}>
                    <span className="material-symbols-outlined text-[20px] sm:text-[24px]">route</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>Personalized Study Plans</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>Dynamically generated roadmaps tailored to your specific academic or professional goals.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className="py-24 px-6 md:px-20 lg:px-40" style={{ backgroundColor: '#070d1f' }}>
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: '#4edea3', fontFamily: "'Inter', sans-serif" }}>The Process</span>
              <h2 className="text-4xl font-bold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>How it works</h2>
            </div>
            <div className="relative flex flex-col lg:flex-row justify-center lg:justify-between items-start gap-12 lg:gap-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center flex-1 group z-10 mx-auto lg:mx-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all relative" style={{ backgroundColor: '#191f31', borderColor: 'rgba(198, 40, 40, 0.3)', borderWidth: '1px', borderStyle: 'solid', color: '#c0c1ff' }}>
                  <span className="material-symbols-outlined text-3xl">edit_note</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>Take quiz</h4>
                <p className="text-sm max-w-[200px]" style={{ color: '#c7c4d7' }}>Initial assessment of your current knowledge base.</p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[20%] right-[70%] h-px" style={{ backgroundColor: 'rgba(198, 40, 40, 0.2)' }}></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center flex-1 group z-10 mx-auto lg:mx-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all" style={{ backgroundColor: '#191f31', borderColor: 'rgba(198, 40, 40, 0.3)', borderWidth: '1px', borderStyle: 'solid', color: '#c0c1ff' }}>
                  <span className="material-symbols-outlined text-3xl">insights</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>AI Analyzes</h4>
                <p className="text-sm max-w-[200px]" style={{ color: '#c7c4d7' }}>Our engine maps your strengths and hidden weaknesses.</p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[45%] right-[45%] h-px" style={{ backgroundColor: 'rgba(198, 40, 40, 0.2)' }}></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center flex-1 group z-10 mx-auto lg:mx-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all" style={{ backgroundColor: '#191f31', borderColor: 'rgba(198, 40, 40, 0.3)', borderWidth: '1px', borderStyle: 'solid', color: '#c0c1ff' }}>
                  <span className="material-symbols-outlined text-3xl">settings_suggest</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>System Adapts</h4>
                <p className="text-sm max-w-[200px]" style={{ color: '#c7c4d7' }}>Curriculum recalibrates to fill your gaps efficiently.</p>
              </div>
              <div className="hidden lg:block absolute top-8 left-[70%] right-[20%] h-px" style={{ backgroundColor: 'rgba(198, 40, 40, 0.2)' }}></div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center flex-1 group z-10 mx-auto lg:mx-0">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all" style={{ backgroundColor: '#191f31', borderColor: 'rgba(198, 40, 40, 0.3)', borderWidth: '1px', borderStyle: 'solid', color: '#c0c1ff' }}>
                  <span className="material-symbols-outlined text-3xl">repeat</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>Review</h4>
                <p className="text-sm max-w-[200px]" style={{ color: '#c7c4d7' }}>Lock in knowledge with spaced repetition logic.</p>
              </div>
            </div>
          </section>

          {/* Product Showcase */}
          <section className="py-24 px-6 md:px-20 lg:px-40 overflow-hidden">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Manrope', sans-serif" }}>A Workspace for Growth</h2>
              <p className="max-w-xl" style={{ color: '#c7c4d7' }}>Deep focus comes from a distraction-free interface. We built IntelliTutor to be as quiet as a library, as smart as a professor.</p>
            </div>
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(192, 193, 255, 0.1)' }}></div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(78, 222, 163, 0.1)' }}></div>
              <div className="rounded-3xl shadow-3xl overflow-hidden" style={{ backgroundColor: '#2e3447', boxShadow: '0 35px 60px -15px rgba(0, 0, 0, 0.3)' }}>
                <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: "url('/intelitutor.png')" }}></div>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-24 px-6 md:px-20 lg:px-40" style={{ backgroundColor: '#0c1324' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-6">
                <div style={{ color: '#4edea3' }}>
                  <span className="material-symbols-outlined text-4xl">bolt</span>
                </div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>Learn faster</h3>
                <p style={{ color: '#c7c4d7' }}>Cut out the noise. Our AI ensures you spend 100% of your time on material you haven't mastered yet.</p>
              </div>
              <div className="flex flex-col gap-6">
                <div style={{ color: '#c0c1ff' }}>
                  <span className="material-symbols-outlined text-4xl">center_focus_strong</span>
                </div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>Focus on weak areas</h3>
                <p style={{ color: '#c7c4d7' }}>No more skimming. We double down on the concepts you struggle with until they become second nature.</p>
              </div>
              <div className="flex flex-col gap-6">
                <div style={{ color: '#adc6ff' }}>
                  <span className="material-symbols-outlined text-4xl">memory</span>
                </div>
                <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Manrope', sans-serif" }}>Retain knowledge longer</h3>
                <p style={{ color: '#c7c4d7' }}>Stop the forgetting curve. Our spaced repetition intervals are mathematically tuned to your memory cycle.</p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section id="testimonials" className="py-24 px-6 md:px-20 lg:px-40" style={{ backgroundColor: '#070d1f' }}>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="p-10 rounded-2xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex gap-1 mb-6" style={{ color: '#4edea3' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-lg text-white italic mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  "IntelliTutor transformed how I prepare for my certifications. The AI chat felt like having a mentor in the room at 2 AM."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cover bg-center" style={{ backgroundColor: 'rgba(192, 193, 255, 0.2)', backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEI7Ft31q-RoZahnImK7O80q4VDDHc7pkB7cQpmSWngXa704A3IGpANpeA0OCBrM8jJMXkSUiefsKsUlkAaEvqMbX61lmV8CrYvlLZLPKPQ7Y8nhWuYkIRd0ZYVzci2Geu-3hGz2eEPpbY6Y9-kyawri6d2zN5nUnp2lncqhKy27Az4aOHrFAVC16-OhTYO-wCS7avOdR3kWFiDt9eHcBeLfzVHYGJTDN6rayJXGni0egXNJH4tGdBwsx2eT8snTO3C8KAH8ghC4la')" }}></div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Marcus Chen</h5>
                    <p className="text-xs" style={{ color: '#c7c4d7' }}>Senior Cloud Engineer</p>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-2xl" style={{ backgroundColor: '#151b2d', borderColor: 'rgba(198, 40, 40, 0.1)', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="flex gap-1 mb-6" style={{ color: '#4edea3' }}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="text-lg text-white italic mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  "I used to spend hours making flashcards. Now, the system handles the schedule and the content. My grades have never been higher."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cover bg-center" style={{ backgroundColor: 'rgba(173, 198, 255, 0.2)', backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA_TuSsMApFcEtfPlB0_6RxAOdgFaNR6FX3cQhs--C4VdyaDtGOLltYt-GRhkhcnCps9XRFgH5C2tYK3bppa9OGcdndmwdu8dRiwzK0bIcZ6Ghga1Q1ymuqnAfCVfoi_uufG2RCCes6RDxDf5TgKVJP-OwthX2FkTtMzkxQyFXkH9dYgj2AjyXtgBdD8-tLyRsx0tMfHngk4PM7dyRmQ7vIOdkJPRyQoaQiIjR9WMWTf1FHzu4Z-TsE8EaM2VY-JR6mOhndp1ajapfa')" }}></div>
                  <div>
                    <h5 className="text-white font-bold text-sm">Sarah Jenkins</h5>
                    <p className="text-xs" style={{ color: '#c7c4d7' }}>Medical Student</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-32 px-6 text-center" style={{ backgroundColor: '#0c1324' }}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
                Start your intelligent learning journey today.
              </h2>
              <p className="text-xl mb-12 max-w-xl mx-auto" style={{ color: '#c7c4d7' }}>
                Join 50,000+ learners who are accelerating their knowledge with IntelliTutor AI.
              </p>
              <button 
                onClick={handleGetStarted}
                className="h-16 px-12 rounded-xl font-bold text-xl shadow-2xl transition-all hover:scale-105 signature-gradient"
                style={{ color: '#07006c', boxShadow: '0 25px 50px -12px rgba(192, 193, 255, 0.3)' }}
              >
                Get Started Free
              </button>
              <p className="mt-8 text-sm uppercase tracking-widest" style={{ color: '#c7c4d7', fontFamily: "'Inter', sans-serif" }}>No credit card required</p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 md:px-20 lg:px-40 flex flex-col md:flex-row justify-between items-center gap-8" style={{ borderTop: '1px solid rgba(198, 40, 40, 0.1)', color: '#c7c4d7' }}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5" style={{ color: '#c0c1ff' }}>
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <span className="text-white font-bold text-sm">IntelliTutor AI</span>
          </div>
          <div className="flex gap-8 text-xs font-medium uppercase tracking-widest">
            <a className="hover:text-white transition-colors" href="#privacy">Privacy</a>
            <a className="hover:text-white transition-colors" href="#terms">Terms</a>
            <a className="hover:text-white transition-colors" href="#contact">Contact</a>
          </div>
          <p className="text-[10px]" style={{ color: 'rgba(220, 225, 251, 0.5)', fontFamily: "'Inter', sans-serif" }}>© 2024 IntelliTutor AI Inc. Built for the future of learning.</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
