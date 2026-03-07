import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Search, ArrowRight, BarChart3, Clock, TrendingUp, Plus, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Session = {
  id: string;
  role: string;
  level: string;
  tech_stack: string[];
  duration_seconds: number | null;
  status: string;
  created_at: string;
  overall_score: number | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!user) return;
      // Load sessions with their feedback scores
      const { data: sessionsData } = await supabase
        .from("interview_sessions")
        .select("id, role, level, tech_stack, duration_seconds, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!sessionsData) { setLoading(false); return; }

      // Load feedback for these sessions
      const sessionIds = sessionsData.map(s => s.id);
      const { data: feedbackData } = await supabase
        .from("interview_feedback")
        .select("session_id, overall_score")
        .in("session_id", sessionIds.length > 0 ? sessionIds : ["none"]);

      const feedbackMap = new Map(feedbackData?.map(f => [f.session_id, f.overall_score]) || []);

      setSessions(sessionsData.map(s => ({
        ...s,
        overall_score: feedbackMap.get(s.id) ?? null,
      })));
      setLoading(false);
    }
    loadSessions();
  }, [user]);

  const filtered = sessions.filter(
    (s) =>
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.tech_stack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const completedSessions = sessions.filter(s => s.status === "completed" && s.overall_score != null);
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((a, s) => a + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;
  const bestScore = completedSessions.length > 0
    ? Math.max(...completedSessions.map(s => s.overall_score || 0))
    : 0;
  const totalSeconds = sessions.reduce((a, s) => a + (s.duration_seconds || 0), 0);
  const totalTime = totalSeconds >= 3600
    ? `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m`
    : `${Math.floor(totalSeconds / 60)}m`;

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">VoxPrep</span>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="hero" size="sm" onClick={() => navigate("/setup")}>
            <Plus className="w-4 h-4" /> New Interview
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-4 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Track your interview progress</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Sessions", value: sessions.length, icon: BarChart3 },
            { label: "Avg Score", value: avgScore || "—", icon: TrendingUp },
            { label: "Best Score", value: bestScore || "—", icon: TrendingUp },
            { label: "Total Time", value: totalTime, icon: Clock },
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

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session, i) => (
              <motion.div
                key={session.id}
                className="glass rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/feedback`, {
                  state: {
                    role: session.role,
                    level: session.level,
                    sessionId: session.id,
                    fromDashboard: true,
                  },
                })}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className={`text-lg font-display font-bold ${getScoreColor(session.overall_score)}`}>
                    {session.overall_score ?? "—"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-sm">{session.role}</span>
                    <span className="text-xs text-muted-foreground glass px-2 py-0.5 rounded-full">{session.level}</span>
                    {session.status === "in_progress" && (
                      <span className="text-xs text-warning glass px-2 py-0.5 rounded-full">In Progress</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{formatDuration(session.duration_seconds)}</span>
                    <span>·</span>
                    <span>{session.tech_stack.join(", ")}</span>
                  </div>
                  {session.overall_score != null && <Progress value={session.overall_score} className="h-1 mt-2" />}
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No sessions found. Start your first interview!
          </div>
        )}
      </main>
    </div>
  );
}
