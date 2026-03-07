import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Mic, MicOff, Phone, Clock, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/use-speech";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DisplayMessage = {
  speaker: "AI" | "User";
  text: string;
  timestamp: Date;
};

export default function InterviewSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const config = location.state || {
    role: "Frontend Developer",
    level: "Mid-Level",
    techStack: ["React"],
    questionCount: 5,
  };

  const { user } = useAuth();

  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const { isListening, transcript, start: startListening, stop: stopListening, supported: sttSupported } = useSpeechRecognition();
  const { isSpeaking, speak, cancel: cancelSpeech } = useSpeechSynthesis();

  // Timer
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [displayMessages, transcript]);

  const callAI = useCallback(async (msgs: Message[]): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("ai-interview", {
      body: {
        action: "interview",
        messages: msgs,
        config: {
          role: config.role,
          level: config.level,
          techStack: config.techStack,
          questionCount: config.questionCount,
        },
      },
    });

    if (error) throw new Error(error.message || "AI request failed");
    if (data?.error) throw new Error(data.error);
    return data.response;
  }, [config]);

  const addDisplayMessage = useCallback((speaker: "AI" | "User", text: string) => {
    setDisplayMessages((prev) => [...prev, { speaker, text, timestamp: new Date() }]);
  }, []);

  const handleAIResponse = useCallback(async (updatedMessages: Message[]) => {
    setIsAIThinking(true);
    setIsUserTurn(false);

    try {
      const response = await callAI(updatedMessages);
      const aiMsg: Message = { role: "assistant", content: response };
      const newMsgs = [...updatedMessages, aiMsg];
      setMessages(newMsgs);
      addDisplayMessage("AI", response);
      setCurrentQuestion((q) => q + 1);

      // Speak the response
      await speak(response);

      // After speaking, it's user's turn
      setIsUserTurn(true);
      if (sttSupported) {
        startListening();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: err.message || "Failed to get AI response",
      });
      setIsUserTurn(true);
    } finally {
      setIsAIThinking(false);
    }
  }, [callAI, speak, startListening, sttSupported, addDisplayMessage, toast]);

  const startInterview = useCallback(async () => {
    setIsActive(true);
    setMessages([]);
    setDisplayMessages([]);
    setCurrentQuestion(0);

    // Send initial empty message to get AI greeting + first question
    const initialMsg: Message = { role: "user", content: "Start the interview." };
    await handleAIResponse([initialMsg]);
  }, [handleAIResponse]);

  const submitAnswer = useCallback(async () => {
    const userText = stopListening();
    if (!userText.trim()) {
      toast({ description: "No speech detected. Please try again." });
      if (sttSupported) startListening();
      return;
    }

    const userMsg: Message = { role: "user", content: userText };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    addDisplayMessage("User", userText);

    await handleAIResponse(updatedMsgs);
  }, [stopListening, messages, handleAIResponse, addDisplayMessage, sttSupported, startListening, toast]);

  const endInterview = useCallback(() => {
    stopListening();
    cancelSpeech();
    setIsActive(false);
    navigate("/feedback", {
      state: {
        ...config,
        duration: elapsed,
        transcript: displayMessages,
        messages,
      },
    });
  }, [stopListening, cancelSpeech, navigate, config, elapsed, displayMessages, messages]);

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
          <span className="text-xs text-muted-foreground glass px-2 py-0.5 rounded-full">
            {config.level}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Q {currentQuestion}/{config.questionCount}
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
            <p className="text-muted-foreground mb-4">
              Your AI interviewer will ask you {config.questionCount} questions about{" "}
              {config.techStack?.join(", ")}.
            </p>
            {!sttSupported && (
              <p className="text-sm text-destructive mb-4">
                ⚠ Speech recognition not supported in this browser. You can type answers instead.
              </p>
            )}
            <Button variant="glow" size="xl" onClick={startInterview}>
              <Mic className="w-5 h-5" />
              Start Interview
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Voice indicator */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                  isSpeaking || isAIThinking ? "bg-primary/20" : isListening ? "bg-accent/20" : "bg-secondary"
                }`}
                animate={isSpeaking ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
                )}
                {isAIThinking ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <MessageSquare
                    className={`w-8 h-8 ${isSpeaking ? "text-primary" : isListening ? "text-accent" : "text-muted-foreground"}`}
                  />
                )}
              </motion.div>
              <span className="text-xs text-muted-foreground mt-2">
                {isAIThinking
                  ? "AI is thinking..."
                  : isSpeaking
                  ? "AI is speaking..."
                  : isListening
                  ? "Listening... Speak your answer"
                  : "Waiting..."}
              </span>

              {/* Waveform */}
              <div className="flex items-center gap-0.5 mt-4 h-8">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all ${
                      isSpeaking ? "bg-primary" : isListening ? "bg-accent" : "bg-muted-foreground/30"
                    }`}
                    style={{
                      animation:
                        isSpeaking || isListening
                          ? `waveform ${0.8 + Math.random() * 0.8}s ease-in-out ${i * 0.04}s infinite`
                          : "none",
                      height: isSpeaking || isListening ? undefined : "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Live transcript of what user is saying */}
            {isListening && transcript && (
              <div className="w-full mb-4 glass rounded-xl px-4 py-3 border border-accent/20">
                <span className="text-xs text-accent block mb-1">You (live):</span>
                <span className="text-sm text-foreground">{transcript}</span>
              </div>
            )}

            {/* Transcript history */}
            <div
              ref={transcriptRef}
              className="w-full flex-1 overflow-y-auto max-h-[300px] space-y-3 mb-6 scrollbar-thin"
            >
              <AnimatePresence>
                {displayMessages.map((msg, i) => (
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
                      <span className="text-xs text-muted-foreground block mb-1">
                        {msg.speaker}
                      </span>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {isUserTurn && !isSpeaking && !isAIThinking && (
                <>
                  {isListening ? (
                    <Button variant="outline" size="lg" onClick={submitAnswer} className="px-6">
                      <MicOff className="w-5 h-5 mr-2" />
                      Submit Answer
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => sttSupported && startListening()}
                      className="px-6"
                      disabled={!sttSupported}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Speaking
                    </Button>
                  )}

                  {/* Text input fallback */}
                  {!sttSupported && <TextInputFallback onSubmit={async (text) => {
                    const userMsg: Message = { role: "user", content: text };
                    const updatedMsgs = [...messages, userMsg];
                    setMessages(updatedMsgs);
                    addDisplayMessage("User", text);
                    await handleAIResponse(updatedMsgs);
                  }} />}
                </>
              )}

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

function TextInputFallback({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className="glass rounded-lg px-3 py-2 text-sm text-foreground bg-transparent border border-border focus:outline-none focus:border-primary"
        placeholder="Type your answer..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && text.trim()) {
            onSubmit(text.trim());
            setText("");
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (text.trim()) {
            onSubmit(text.trim());
            setText("");
          }
        }}
      >
        Send
      </Button>
    </div>
  );
}
