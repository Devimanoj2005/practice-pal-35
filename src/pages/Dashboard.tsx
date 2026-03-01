import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Search, ArrowRight, BarChart3, Clock, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const mockSessions = [
  { id: 1, role: "Frontend Developer", level: "Senior", score: 85, date: "2026-02-28", duration: "12:34", techStack: ["React", "TypeScript"] },
  { id: 2, role: "Backend Developer", level: "Mid-Level", score: 72, date: "2026-02-25", duration: "15:20", techStack: ["Node.js", "PostgreSQL"] },
  { id: 3, role: "Full Stack Developer", level: "Junior", score: 91, date: "2026-02-22", duration: "10:05", techStack: ["React", "Node.js", "MongoDB"] },
  { id: 4, role: "Data Scientist", level: "Mid-Level", score: 68, date: "2026-02-20", duration: "18:42", techStack: ["Python", "TensorFlow"] },
  { id: 5, role: "DevOps Engineer", level: "Senior", score: 78, date: "2026-02-18", duration: "14:10", techStack: ["AWS", "Docker", "Kubernetes"] },
  { id: 6, role: "Frontend Developer", level: "Intern", score: 55, date: "2026-02-15", duration: "08:30", techStack: ["React"] },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockSessions.filter(
    (s) =>
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const avgScore = Math.round(mockSessions.reduce((a, s) => a + s.score, 0) / mockSessions.length);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">VoxPrep</span>
        </button>
        <Button variant="hero" size="sm" onClick={() => navigate("/setup")}>
          <Plus className="w-4 h-4" /> New Interview
        </Button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Track your interview progress</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: mockSessions.length, icon: BarChart3 },
            { label: "Avg Score", value: avgScore, icon: TrendingUp },
            { label: "Best Score", value: Math.max(...mockSessions.map((s) => s.score)), icon: TrendingUp },
            { label: "Total Time", value: "1h 19m", icon: Clock },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-2xl font-display font-bold">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by role or tech..."
            className="pl-10 glass border-border"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sessions List */}
        <div className="space-y-3">
          {filtered.map((session, i) => (
            <motion.div
              key={session.id}
              className="glass rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate("/feedback", { state: { role: session.role, level: session.level } })}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className={`text-lg font-display font-bold ${getScoreColor(session.score)}`}>{session.score}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-display font-semibold text-sm">{session.role}</span>
                  <span className="text-xs text-muted-foreground glass px-2 py-0.5 rounded-full">{session.level}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{session.date}</span>
                  <span>·</span>
                  <span>{session.duration}</span>
                  <span>·</span>
                  <span>{session.techStack.join(", ")}</span>
                </div>
                <Progress value={session.score} className="h-1 mt-2" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No sessions found. Start your first interview!
          </div>
        )}
      </main>
    </div>
  );
}
