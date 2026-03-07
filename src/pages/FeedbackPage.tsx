import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
import "jspdf-autotable";

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
  const config = location.state || {};
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);

  const exportPDF = useCallback(() => {
    if (!feedback) return;
    const doc = new jsPDF();
    const role = config.role || "Frontend Developer";
    const level = config.level || "Mid-Level";

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Interview Feedback Report", 14, 22);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${role} · ${level}`, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setTextColor(40);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(feedback.summary, 180);
    doc.text(summaryLines, 14, 46);

    let y = 46 + summaryLines.length * 5 + 6;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Scores", 14, y);
    y += 4;
    (doc as any).autoTable({
      startY: y,
      head: [["Category", "Score"]],
      body: [
        ["Overall", `${feedback.overall_score}/100`],
        ["Technical", `${feedback.technical_score}/100`],
        ["Communication", `${feedback.communication_score}/100`],
        ["Confidence", `${feedback.confidence_score}/100`],
        ["Problem Solving", `${feedback.problem_solving_score}/100`],
        ["Clarity", `${feedback.clarity_score}/100`],
        ["Depth", `${feedback.depth_score}/100`],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 10 },
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    if (feedback.question_scores.length > 0) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Question Scores", 14, y);
      y += 4;
      (doc as any).autoTable({
        startY: y,
        head: [["Question", "Score"]],
        body: feedback.question_scores.map((q, i) => [`Q${i + 1}: ${q.question}`, `${q.score}/100`]),
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 9, cellWidth: "wrap" },
        columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 30 } },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    const sections = [
      { title: "Strengths", items: feedback.strengths },
      { title: "Areas to Improve", items: feedback.weaknesses },
      { title: "Suggestions", items: feedback.suggestions },
    ];

    for (const section of sections) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      for (const item of section.items) {
        if (y > 275) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`• ${item}`, 180);
        doc.text(lines, 16, y);
        y += lines.length * 5 + 2;
      }
      y += 4;
    }

    doc.save(`interview-feedback-${role.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }, [feedback, config]);

  useEffect(() => {
    async function generateFeedback() {
      const transcript = config.transcript;
      if (!transcript || transcript.length === 0) {
        // Fallback if no transcript
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
