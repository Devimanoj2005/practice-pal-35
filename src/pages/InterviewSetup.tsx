import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const roles = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "DevOps Engineer", "Mobile Developer",
  "ML Engineer", "QA Engineer", "Cloud Architect",
];

const levels = ["Intern", "Junior", "Mid-Level", "Senior", "Lead"];

const techOptions = [
  "React", "Node.js", "Python", "TypeScript", "Java", "Go",
  "AWS", "Docker", "PostgreSQL", "MongoDB", "Kubernetes", "GraphQL",
  "Next.js", "Django", "Spring Boot", "TensorFlow",
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(5);

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const isReady = role && level && techStack.length > 0;

  const handleStart = () => {
    navigate("/interview", {
      state: { role, level, techStack, questionCount },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <nav className="relative z-10 flex items-center gap-4 px-6 py-4 max-w-4xl mx-auto">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">VoxPrep</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Configure Your Interview</h1>
          <p className="text-muted-foreground mb-10">
            Tell us about the role and we'll generate tailored questions.
          </p>
        </motion.div>

        {/* Role */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-medium text-muted-foreground mb-3 block">Target Role</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === r
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Level */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-medium text-muted-foreground mb-3 block">Experience Level</label>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  level === l
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Tech Stack <span className="text-xs text-muted-foreground/60">(select multiple)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {techOptions.map((tech) => (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  techStack.includes(tech)
                    ? "bg-accent text-accent-foreground"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Question Count */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            Number of Questions
          </label>
          <div className="flex gap-2">
            {[3, 5, 8, 10].map((n) => (
              <button
                key={n}
                onClick={() => setQuestionCount(n)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  questionCount === n
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Summary & Start */}
        {isReady && (
          <motion.div
            className="glass-strong rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-sm">Interview Preview</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">{role}</Badge>
              <Badge variant="secondary">{level}</Badge>
              {techStack.map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
              <Badge variant="outline">{questionCount} questions</Badge>
            </div>
            <Button variant="glow" size="lg" className="w-full" onClick={handleStart}>
              <Mic className="w-4 h-4" />
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
