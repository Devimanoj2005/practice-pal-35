import { motion } from "framer-motion";
import { Mic, ArrowRight, BarChart3, Brain, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
{
  icon: Mic,
  title: "Voice-Powered AI",
  description: "Real-time voice conversations with an AI interviewer that adapts to your responses."
},
{
  icon: Brain,
  title: "Smart Questions",
  description: "AI-generated questions tailored to your role, experience level, and tech stack."
},
{
  icon: BarChart3,
  title: "Deep Analytics",
  description: "Comprehensive scoring on technical knowledge, communication, and confidence."
},
{
  icon: Clock,
  title: "Session History",
  description: "Track your progress over time with detailed session recordings and transcripts."
},
{
  icon: Shield,
  title: "Industry-Ready",
  description: "Practice for real interviews with questions from top tech companies."
}];


const stats = [
{ value: "10K+", label: "Interviews Completed" },
{ value: "95%", label: "Success Rate" },
{ value: "50+", label: "Tech Roles" },
{ value: "4.9/5", label: "User Rating" }];


export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">VoxPrep</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</button>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Sign In</Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/setup")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-muted-foreground mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            AI-Powered Mock Interviews
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          
          Ace Your Next Interview
          <br />
          <span className="text-gradient">With AI Voice Practice</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          
          Practice real-time voice interviews with an AI that adapts to your role.
          Get instant feedback on technical skills, communication, and confidence.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}>
          
          <Button variant="hero" size="xl" onClick={() => navigate("/setup")}>
            Start Free Interview
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="hero-outline" size="xl" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
        </motion.div>

        {/* Voice waveform visual */}
        <motion.div
          className="flex items-center justify-center gap-1 mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}>
          
          {Array.from({ length: 20 }).map((_, i) =>
          <div
            key={i}
            className="w-1 rounded-full bg-primary/40"
            style={{
              animation: `waveform ${1 + Math.random() * 0.5}s ease-in-out ${i * 0.05}s infinite`,
              height: "8px"
            }} />

          )}
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}>
          
          {stats.map((stat) =>
          <div key={stat.label} className="text-center glass rounded-xl p-6">
              <div className="text-3xl font-display font-bold text-gradient">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need to <span className="text-gradient">Succeed</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete platform designed to prepare you for any technical interview.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) =>
          <motion.div
            key={feature.title}
            className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}>
            
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
        <motion.div
          className="glass-strong rounded-2xl p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Ready to Start Practicing?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join thousands of developers who improved their interview skills with VoxPrep.
          </p>
          <Button variant="glow" size="xl" onClick={() => navigate("/setup")}>
            Begin Your First Interview
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <Mic className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold">VoxPrep</span>
          </div>
          
        </div>
      </footer>
    </div>);

}