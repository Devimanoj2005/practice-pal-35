import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, TrendingUp, MessageSquare, Brain, Shield, Lightbulb } from "lucide-react";
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

const radarData = [
  { skill: "Technical", value: 82 },
  { skill: "Communication", value: 75 },
  { skill: "Confidence", value: 68 },
  { skill: "Problem Solving", value: 85 },
  { skill: "Clarity", value: 78 },
  { skill: "Depth", value: 72 },
];

const barData = [
  { question: "Q1", score: 85 },
  { question: "Q2", score: 72 },
  { question: "Q3", score: 90 },
  { question: "Q4", score: 65 },
  { question: "Q5", score: 78 },
];

const scores = [
  { label: "Overall Score", value: 78, icon: TrendingUp, color: "text-primary" },
  { label: "Technical Knowledge", value: 82, icon: Brain, color: "text-primary" },
  { label: "Communication", value: 75, icon: MessageSquare, color: "text-accent" },
  { label: "Confidence", value: 68, icon: Shield, color: "text-warning" },
];

const strengths = [
  "Strong understanding of React component lifecycle",
  "Clear explanation of state management concepts",
  "Good use of technical terminology",
];

const weaknesses = [
  "Could elaborate more on system design decisions",
  "Need deeper knowledge of database optimization",
  "Should practice concise answers under pressure",
];

const suggestions = [
  "Practice explaining complex concepts in simple terms",
  "Review system design fundamentals (load balancing, caching)",
  "Work on time management during responses",
  "Study common behavioral interview frameworks (STAR method)",
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const config = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" /> Export PDF
        </Button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-1">Interview Feedback</h1>
          <p className="text-muted-foreground mb-8">
            {config.role || "Frontend Developer"} · {config.level || "Mid-Level"} · {config.questionCount || 5} questions
          </p>
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
              {strengths.map((s, i) => (
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
              {weaknesses.map((w, i) => (
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
              {suggestions.map((s, i) => (
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
