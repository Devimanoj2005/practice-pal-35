import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Phone, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleQuestions = [
  "Tell me about yourself and your experience.",
  "Can you explain the virtual DOM and how React uses it?",
  "How do you handle state management in large applications?",
  "Describe a challenging bug you've fixed recently.",
  "What's your approach to testing frontend applications?",
  "How do you optimize application performance?",
  "Explain the difference between SQL and NoSQL databases.",
  "How do you handle authentication in web applications?",
];

const sampleResponses = [
  "That's a great answer. Let me ask you about...",
  "Interesting perspective. Can you elaborate on...",
  "I see. Now let's move to the next topic...",
  "Good point. How would you handle...",
];

type Message = {
  speaker: "AI" | "User";
  text: string;
  timestamp: Date;
};

export default function InterviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state || { role: "Frontend Developer", level: "Mid-Level", techStack: ["React"], questionCount: 5 };

  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Timer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Simulate interview flow
  const startInterview = useCallback(() => {
    setIsActive(true);
    setIsAISpeaking(true);
    const greeting = `Hello! Welcome to your ${config.role} interview. I'm your AI interviewer today. Let's begin with the first question.`;
    setMessages([{ speaker: "AI", text: greeting, timestamp: new Date() }]);

    setTimeout(() => {
      const q = sampleQuestions[0];
      setMessages((prev) => [...prev, { speaker: "AI", text: q, timestamp: new Date() }]);
      setIsAISpeaking(false);
    }, 2000);
  }, [config.role]);

  // Simulate user response cycle
  const simulateResponse = useCallback(() => {
    if (currentQuestion >= config.questionCount - 1) return;

    // User "responds"
    setMessages((prev) => [
      ...prev,
      { speaker: "User", text: "I would approach this by considering the trade-offs and best practices...", timestamp: new Date() },
    ]);

    // AI follows up
    setTimeout(() => {
      setIsAISpeaking(true);
      const responseIdx = currentQuestion % sampleResponses.length;
      setMessages((prev) => [
        ...prev,
        { speaker: "AI", text: sampleResponses[responseIdx], timestamp: new Date() },
      ]);

      setTimeout(() => {
        const nextQ = currentQuestion + 1;
        setCurrentQuestion(nextQ);
        const questionIdx = nextQ % sampleQuestions.length;
        setMessages((prev) => [
          ...prev,
          { speaker: "AI", text: sampleQuestions[questionIdx], timestamp: new Date() },
        ]);
        setIsAISpeaking(false);
      }, 1500);
    }, 1000);
  }, [currentQuestion, config.questionCount]);

  const endInterview = () => {
    setIsActive(false);
    navigate("/feedback", {
      state: { ...config, duration: elapsed, messages, questionCount: currentQuestion + 1 },
    });
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Mic className="w-5 h-5 text-primary" />
          <span className="font-display font-semibold">{config.role} Interview</span>
          <span className="text-xs text-muted-foreground glass px-2 py-0.5 rounded-full">{config.level}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Q {currentQuestion + 1}/{config.questionCount}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-3xl mx-auto w-full">
        {!isActive ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Ready to Begin?</h2>
            <p className="text-muted-foreground mb-8">
              Your AI interviewer will ask you {config.questionCount} questions about {config.techStack?.join(", ")}.
            </p>
            <Button variant="glow" size="xl" onClick={startInterview}>
              <Mic className="w-5 h-5" />
              Start Interview
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Voice indicator */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                  isAISpeaking ? "bg-primary/20" : "bg-secondary"
                }`}
                animate={isAISpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {isAISpeaking && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
                )}
                <MessageSquare className={`w-8 h-8 ${isAISpeaking ? "text-primary" : "text-muted-foreground"}`} />
              </motion.div>
              <span className="text-xs text-muted-foreground mt-2">
                {isAISpeaking ? "AI is speaking..." : "Your turn to answer"}
              </span>

              {/* Waveform */}
              <div className="flex items-center gap-0.5 mt-4 h-8">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isAISpeaking ? "bg-primary" : isMuted ? "bg-muted-foreground/30" : "bg-accent"
                    }`}
                    style={{
                      animation: isActive && !isMuted
                        ? `waveform ${0.8 + Math.random() * 0.8}s ease-in-out ${i * 0.04}s infinite`
                        : "none",
                      height: isActive && !isMuted ? undefined : "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Transcript */}
            <div className="w-full flex-1 overflow-y-auto max-h-[300px] space-y-3 mb-6 scrollbar-thin">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.speaker === "User" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                        msg.speaker === "User"
                          ? "bg-primary/10 text-foreground border border-primary/20"
                          : "glass"
                      }`}
                    >
                      <span className="text-xs text-muted-foreground block mb-1">{msg.speaker}</span>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={simulateResponse}
                className="px-6"
              >
                Simulate Response
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={endInterview}
              >
                <Phone className="w-5 h-5 rotate-[135deg]" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
