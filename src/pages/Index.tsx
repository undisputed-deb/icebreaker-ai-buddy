import React, { useEffect, useRef, useState } from "react";
import { Heart, Sparkles, Brain, MessageCircle, Zap, Globe, Star } from "lucide-react";
import IcebreakerForm from "@/components/IcebreakerForm";

const FloatingParticle: React.FC<{ index: number }> = ({ index }) => (
  <div
    className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-70 animate-float-${index % 4}`}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${index * 0.2}s`,
    }}
  />
);

const Index: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const titleLetters = "IceBrAIker".split("");

  return (
    <div className="main-container min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Layers */}
      <div className="bg-layer-1 absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
        <div
          className="bg-layer-2 absolute inset-0 bg-gradient-to-l from-cyan-600/10 via-blue-600/10 to-purple-600/10 transition-transform duration-300 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`,
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="particles-container absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="shapes-container absolute inset-0 pointer-events-none">
        <div
          className="shape-1 absolute top-20 left-10 w-20 h-20 border border-purple-400/30 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        />
        <div
          className="shape-2 absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-lg transform rotate-45 animate-bounce"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="shape-3 absolute bottom-40 left-20 w-12 h-12 border-2 border-cyan-400/40 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="shape-4 absolute top-1/2 right-10 w-8 h-8 bg-gradient-to-r from-pink-400/30 to-yellow-400/30 rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="nav-bar relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="logo-section flex items-center gap-2 transform transition-all duration-300 hover:scale-110 cursor-pointer"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 2}deg)`,
            }}
          >
            <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              IceBrAIker
            </h1>
          </div>
          <div className="nav-actions flex items-center gap-4">
            <button className="nav-btn bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 text-white transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              Favorites
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className="hero-section text-center mb-16"
          style={{
            transform: `perspective(1000px) translate3d(${mousePos.x * 15}px, ${mousePos.y * 15}px, 0) rotateX(${mousePos.y * 3}deg) rotateY(${mousePos.x * 3}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className="hero-icons flex items-center justify-center gap-3 mb-6">
            <MessageCircle className="w-12 h-12 text-cyan-400 animate-bounce icon-1" />
            <Sparkles className="w-10 h-10 text-purple-400 animate-pulse icon-2" />
            <Zap className="w-8 h-8 text-pink-400 animate-bounce icon-3" />
          </div>

          <h1 className="hero-title text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transform transition-all duration-500 hover:scale-105">
            {titleLetters.map((letter, index) => (
              <span
                key={index}
                className={`inline-block animate-bounce letter-${index}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </h1>

          <p className="hero-description text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed opacity-90 mb-8">
            🚀 AI-powered conversation starters that help you connect meaningfully.
            ✨ Just enter a profile URL or keywords, and get personalized icebreakers in seconds.
          </p>

          <div className="hero-badges flex justify-center gap-4 flex-wrap">
            <div className="badge-1 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5 text-yellow-400 inline mr-2" />
              <span className="text-gray-200">Powered by AI</span>
            </div>
            <div className="badge-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <Globe className="w-5 h-5 text-green-400 inline mr-2" />
              <span className="text-gray-200">Global Network</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="features-grid grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Brain,
              title: "Smart Context",
              description: "Analyzes public info to find interesting conversation topics",
              gradient: "from-cyan-400 to-blue-500",
              className: "feature-card-1",
            },
            {
              icon: MessageCircle,
              title: "Personalized",
              description: "Generates warm, specific icebreakers matching your tone",
              gradient: "from-purple-400 to-pink-500",
              className: "feature-card-2",
            },
            {
              icon: Heart,
              title: "Save & Reuse",
              description: "Build your collection of effective conversation starters",
              gradient: "from-pink-400 to-red-500",
              className: "feature-card-3",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`${feature.className} feature-card group relative`}
              style={{
                transform: `perspective(1000px) rotateX(${mousePos.y * 1.5}deg) rotateY(${mousePos.x * 1.5}deg)`,
                transition: "transform 0.3s ease-out",
              }}
            >
              <div className="feature-glow absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl from-cyan-400/20 via-purple-400/20 to-pink-400/20" />
              <div className="feature-content relative text-center p-8 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl group cursor-pointer">
                <feature.icon
                  className={`w-16 h-16 mx-auto bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent mb-6`}
                />
                <h3 className="font-bold text-xl mb-4 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Form */}
        <div
          className="form-section max-w-4xl mx-auto"
          style={{
            transform: `perspective(1000px) rotateX(${mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className="form-container relative">
            <div className="form-glow absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl blur-xl" />
            <div className="form-wrapper relative bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-500">
              <IcebreakerForm />
            </div>
          </div>
        </div>
      </main>

      {/* styles for tiny animations */}
      <style jsx>{`
        .animate-float-0 {
          animation: float-up 3s ease-in-out infinite;
        }
        .animate-float-1 {
          animation: float-down 3.5s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-left 4s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-right 3.2s ease-in-out infinite;
        }

        @keyframes float-up {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
        }
        @keyframes float-down {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(20px) rotate(-180deg); opacity: 1; }
        }
        @keyframes float-left {
          0%, 100% { transform: translateX(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateX(-15px) rotate(90deg); opacity: 1; }
        }
        @keyframes float-right {
          0%, 100% { transform: translateX(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateX(15px) rotate(-90deg); opacity: 1; }
        }

        .feature-card-1 { animation: slide-in-up 0.8s ease-out 0s both; }
        .feature-card-2 { animation: slide-in-up 0.8s ease-out 0.2s both; }
        .feature-card-3 { animation: slide-in-up 0.8s ease-out 0.4s both; }

        @keyframes slide-in-up {
          from { opacity: 0; transform: translate3d(0, 60px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }

        .result-card { animation: fade-in 0.5s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cyber-button::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s ease;
        }
        .cyber-button:hover::before { left: 100%; }

        .icon-1 { animation-delay: 0s; }
        .icon-2 { animation-delay: 0.5s; }
        .icon-3 { animation-delay: 1s; }

        @media (max-width: 768px) {
          .hero-title { font-size: 3rem; }
          .particles-container, .shapes-container { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Index;
