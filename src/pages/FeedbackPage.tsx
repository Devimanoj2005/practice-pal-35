import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  TrendingUp,
  MessageSquare,
  Brain,
  Shield,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

type Feedback = {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  problem_solving_score: number;
  clarity_score: number;
  depth_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  question_scores: { question: string; score: number }[];
  summary: string;
};

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const config = location.state || {};
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  const exportPDF = useCallback(() => {
    if (!feedback) return;
    const doc = new jsPDF();
    const role = config.role || "Frontend Developer";
    const level = config.level || "Mid-Level";
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;

    const checkPage = (yPos: number, needed = 20) => {
      if (yPos + needed > 280) { doc.addPage(); return 20; }
      return yPos;
    };

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Interview Feedback Report", margin, 22);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${role} · ${level}`, margin, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 36);

    // Summary
    doc.setTextColor(40);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(feedback.summary, contentW);
    doc.text(summaryLines, margin, 46);
    let y = 46 + summaryLines.length * 5 + 8;

    // Scores section
    const scoreRows = [
      ["Overall", feedback.overall_score],
      ["Technical", feedback.technical_score],
      ["Communication", feedback.communication_score],
      ["Confidence", feedback.confidence_score],
      ["Problem Solving", feedback.problem_solving_score],
      ["Clarity", feedback.clarity_score],
      ["Depth", feedback.depth_score],
    ] as const;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Scores", margin, y);
    y += 8;

    // Table header
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y - 5, contentW, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Category", margin + 4, y);
    doc.text("Score", margin + contentW - 30, y);
    y += 6;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40);
    for (const [label, score] of scoreRows) {
      doc.setDrawColor(200);
      doc.line(margin, y + 3, margin + contentW, y + 3);
      doc.text(label, margin + 4, y + 1);
      doc.text(`${score}/100`, margin + contentW - 30, y + 1);
      y += 8;
    }
    y += 6;

    // Question scores
    if (feedback.question_scores.length > 0) {
      y = checkPage(y, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Question Scores", margin, y);
      y += 8;

      for (let i = 0; i < feedback.question_scores.length; i++) {
        y = checkPage(y, 14);
        const q = feedback.question_scores[i];
        const qLines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, contentW - 40);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40);
        doc.text(qLines, margin + 4, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${q.score}/100`, margin + contentW - 30, y);
        y += qLines.length * 4 + 6;
      }
      y += 4;
    }

    // Strengths / Weaknesses / Suggestions
    const sections = [
      { title: "Strengths", items: feedback.strengths, color: [22, 163, 74] as [number, number, number] },
      { title: "Areas to Improve", items: feedback.weaknesses, color: [220, 38, 38] as [number, number, number] },
      { title: "Suggestions", items: feedback.suggestions, color: [234, 179, 8] as [number, number, number] },
    ];

    for (const section of sections) {
      y = checkPage(y, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...section.color);
      doc.text(section.title, margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40);
      for (const item of section.items) {
        y = checkPage(y, 12);
        const lines = doc.splitTextToSize(`• ${item}`, contentW - 4);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5 + 3;
      }
      y += 6;
    }

    doc.save(`interview-feedback-${role.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }, [feedback, config]);

  useEffect(() => {
    async function generateFeedback() {
      // If coming from dashboard, load saved feedback
      if (config.fromDashboard && config.sessionId) {
        const { data: savedFeedback } = await supabase
          .from("interview_feedback")
          .select("*")
          .eq("session_id", config.sessionId)
          .single();
        if (savedFeedback) {
          setFeedback({
            overall_score: savedFeedback.overall_score ?? 0,
            technical_score: savedFeedback.technical_score ?? 0,
            communication_score: savedFeedback.communication_score ?? 0,
            confidence_score: savedFeedback.confidence_score ?? 0,
            problem_solving_score: savedFeedback.problem_solving_score ?? 0,
            clarity_score: savedFeedback.clarity_score ?? 0,
            depth_score: savedFeedback.depth_score ?? 0,
            strengths: savedFeedback.strengths ?? [],
            weaknesses: savedFeedback.weaknesses ?? [],
            suggestions: savedFeedback.suggestions ?? [],
            question_scores: (savedFeedback.question_scores as any[]) ?? [],
            summary: savedFeedback.summary ?? "",
          });
          setLoading(false);
          return;
        }
      }

      const transcript = config.transcript;
      if (!transcript || transcript.length === 0) {
        setFeedback(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("ai-interview", {
          body: {
            action: "feedback",
            config: {
              role: config.role || "Frontend Developer",
              level: config.level || "Mid-Level",
            },
            transcript: transcript.map((m: any) => ({
              speaker: m.speaker,
              text: m.text,
            })),
          },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);
        if (data?.feedback) {
          setFeedback(data.feedback);
          // Save feedback to DB
          if (user && config.sessionId) {
            await supabase.from("interview_feedback").insert({
              session_id: config.sessionId,
              user_id: user.id,
              overall_score: data.feedback.overall_score,
              technical_score: data.feedback.technical_score,
              communication_score: data.feedback.communication_score,
              confidence_score: data.feedback.confidence_score,
              problem_solving_score: data.feedback.problem_solving_score,
              clarity_score: data.feedback.clarity_score,
              depth_score: data.feedback.depth_score,
              strengths: data.feedback.strengths,
              weaknesses: data.feedback.weaknesses,
              suggestions: data.feedback.suggestions,
              question_scores: data.feedback.question_scores,
              summary: data.feedback.summary,
            });
          }
        }
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Feedback Generation Failed",
          description: err.message || "Could not generate feedback",
        });
      } finally {
        setLoading(false);
      }
    }

    generateFeedback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-display font-bold mb-2">Analyzing Your Interview...</h2>
          <p className="text-muted-foreground">
            AI is reviewing your responses and generating detailed feedback
          </p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-display font-bold mb-2">No Interview Data</h2>
          <p className="text-muted-foreground mb-6">
            Start an interview first to receive feedback.
          </p>
          <Button variant="hero" onClick={() => navigate("/setup")}>
            Start Interview
          </Button>
        </div>
      </div>
    );
  }

  const radarData = [
    { skill: "Technical", value: feedback.technical_score },
    { skill: "Communication", value: feedback.communication_score },
    { skill: "Confidence", value: feedback.confidence_score },
    { skill: "Problem Solving", value: feedback.problem_solving_score },
    { skill: "Clarity", value: feedback.clarity_score },
    { skill: "Depth", value: feedback.depth_score },
  ];

  const barData = feedback.question_scores.map((q, i) => ({
    question: `Q${i + 1}`,
    score: q.score,
  }));

  const scores = [
    { label: "Overall Score", value: feedback.overall_score, icon: TrendingUp, color: "text-primary" },
    { label: "Technical Knowledge", value: feedback.technical_score, icon: Brain, color: "text-primary" },
    { label: "Communication", value: feedback.communication_score, icon: MessageSquare, color: "text-accent" },
    { label: "Confidence", value: feedback.confidence_score, icon: Shield, color: "text-warning" },
  ];


  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={exportPDF}>
          <Download className="w-4 h-4 mr-1" /> Export PDF
        </Button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-1">Interview Feedback</h1>
          <p className="text-muted-foreground mb-2">
            {config.role || "Frontend Developer"} · {config.level || "Mid-Level"}
          </p>
          <p className="text-sm text-muted-foreground mb-8">{feedback.summary}</p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {scores.map((score, i) => (
            <motion.div
              key={score.label}
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <score.icon className={`w-4 h-4 ${score.color}`} />
                <span className="text-xs text-muted-foreground">{score.label}</span>
              </div>
              <div className="text-3xl font-display font-bold mb-2">{score.value}</div>
              <Progress value={score.value} className="h-1.5" />
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-display font-semibold mb-4">Skills Radar</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222 20% 18%)" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <Radar
                  dataKey="value"
                  stroke="hsl(187 92% 55%)"
                  fill="hsl(187 92% 55%)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-display font-semibold mb-4">Score per Question</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid stroke="hsl(222 20% 18%)" strokeDasharray="3 3" />
                <XAxis dataKey="question" tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} />
                <YAxis tick={{ fill: "hsl(215 20% 55%)", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 44% 9%)",
                    border: "1px solid hsl(222 20% 18%)",
                    borderRadius: "8px",
                    color: "hsl(210 40% 96%)",
                  }}
                />
                <Bar dataKey="score" fill="hsl(187 92% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Strengths, Weaknesses, Suggestions */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-success" />
              <h3 className="font-display font-semibold text-sm">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-success mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-destructive" />
              <h3 className="font-display font-semibold text-sm">Areas to Improve</h3>
            </div>
            <ul className="space-y-3">
              {feedback.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-destructive mt-1">•</span> {w}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-warning" />
              <h3 className="font-display font-semibold text-sm">Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-warning mt-1">•</span> {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-10">
          <Button variant="hero-outline" size="lg" onClick={() => navigate("/setup")}>
            New Interview
          </Button>
          <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")}>
            View Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
