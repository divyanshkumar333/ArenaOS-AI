'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useMotionValue, useSpring, animate } from 'framer-motion'
import {
  ShieldAlert, Cpu, Activity, ArrowRight, Eye, Radar,
  ChevronDown, XCircle, CheckCircle2, Bot, Network,
  Code, Briefcase, Mail, Globe, Server, Database, Zap
} from 'lucide-react'
import { ArenaLogo } from '@/components/ArenaLogo'
import { useIsMobile } from '@/hooks/useMediaQuery'

// ==========================================
// CREATOR CONFIGURATION
const CREATOR_CONFIG = {
  name: "Divyansh Kumar",
  title1: "B.Tech Artificial Intelligence & Data Science",
  title2: "MITS Gwalior",
  roles: "AI Developer • Full Stack Developer • UI/UX Enthusiast",
  github: "https://github.com/divyanshkumar333",
  linkedin: "https://www.linkedin.com/in/divyanshkumar333",
  portfolio: "#",
  email: "https://mail.google.com/mail/?view=cm&fs=1&to=divyanshkumar027@gmail.com"
}
// ==========================================

// Typed bezier so Framer Motion's Variants constraint is satisfied
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Shared reveal variant — blur + fade + lift
const revealVariant = {
  hidden:  { opacity: 0, y: 28, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.65, ease: EASE } }
}

const staggerContainer = (staggerChildren = 0.09) => ({
  hidden:  {},
  visible: { transition: { staggerChildren } }
})

// Child variant for stagger lists
const childVariant = {
  hidden:  { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.55, ease: EASE } }
}

// Floating blob component (replaces animate-blob)
function FloatingBlob({ className, duration = 8, xRange = 20, yRange = 15 }: {
  className: string; duration?: number; xRange?: number; yRange?: number
}) {
  return (
    <motion.div
      className={className}
      animate={{
        x:       [0, xRange, -xRange * 0.6, 0],
        y:       [0, -yRange, yRange * 0.8, 0],
        opacity: [0.18, 0.28, 0.20, 0.18],
        scale:   [1, 1.08, 0.96, 1],
      }}
      transition={{ duration, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
    />
  )
}

function HeroSection() {
  const { scrollY } = useScroll()
  // Parallax: content drifts up, background image drifts slower
  const contentY  = useTransform(scrollY, [0, 700], [0, 140])
  const bgY       = useTransform(scrollY, [0, 700], [0, 60])
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0])
  
  const isMobile = useIsMobile()

  // Mouse parallax
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      mouseX.set((e.clientX - cx) / cx * 10)
      mouseY.set((e.clientY - cy) / cy * 8)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [mouseX, mouseY])

  const TECH = ['Next.js', 'React Three Fiber', 'Three.js', 'FastAPI', 'OpenCV', 'NVIDIA NIM']

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y: bgY,
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/25 z-[1]" />
      <motion.div
        className="absolute inset-0 z-[1]"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,132,255,0.13), transparent)' }}
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
      />

      {/* Floating ambient blobs (reduce count on mobile) */}
      <FloatingBlob
        className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-accent/20 blur-[90px] md:blur-[130px] mix-blend-screen z-[1] pointer-events-none"
        duration={9} xRange={25} yRange={18}
      />
      {!isMobile && (
        <FloatingBlob
          className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-blue-500/15 blur-[120px] mix-blend-screen z-[1] pointer-events-none"
          duration={11} xRange={-18} yRange={22}
        />
      )}
      <FloatingBlob
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px] z-[1] pointer-events-none"
        duration={7} xRange={12} yRange={10}
      />

      {/* AI twin SVG overlay — breathes in opacity */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ opacity: [0.055, 0.085, 0.055] }}
        transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 5}%`} x2="100%" y2={`${(i + 1) * 5}%`} stroke="#0a84ff" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 7}%`} y1="0" x2={`${(i + 1) * 7}%`} y2="100%" stroke="#0a84ff" strokeWidth="0.5" />
        ))}
        {[[22,38],[45,55],[68,32],[78,65],[33,70],[55,25],[85,45],[15,60]].map(([cx,cy],i) => (
          <g key={`n${i}`}>
            <circle cx={`${cx}%`} cy={`${cy}%`} r="3" fill="#0a84ff" opacity="0.9" />
            <circle cx={`${cx}%`} cy={`${cy}%`} r="8" fill="none" stroke="#0a84ff" strokeWidth="0.8" opacity="0.5" />
          </g>
        ))}
        <line x1="22%" y1="38%" x2="45%" y2="55%" stroke="#0a84ff" strokeWidth="0.6" strokeDasharray="4 4" />
        <line x1="45%" y1="55%" x2="68%" y2="32%" stroke="#0a84ff" strokeWidth="0.6" strokeDasharray="4 4" />
        <line x1="68%" y1="32%" x2="78%" y2="65%" stroke="#0a84ff" strokeWidth="0.6" strokeDasharray="4 4" />
        <ellipse cx="40%" cy="52%" rx="8%" ry="5%" fill="rgba(255,69,58,0.07)" />
        <ellipse cx="70%" cy="38%" rx="6%" ry="4%" fill="rgba(255,159,10,0.05)" />
      </motion.svg>

      {/* Nav */}
      <motion.nav
        className="absolute top-0 w-full px-8 py-6 flex items-center justify-between z-20"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 rounded-lg bg-accent/[0.04] border border-accent/[0.12] flex items-center justify-center group-hover:bg-accent/[0.08] group-hover:border-accent/[0.2] transition-colors">
            <ArenaLogo size={18} className="text-accent" animate />
          </div>
          <span className="font-bold tracking-widest text-base text-white">ARENA<span className="text-accent">OS</span></span>
        </div>
        <Link href="/dashboard">
          <motion.span
            whileHover={{ color: '#fff', x: 2 }}
            className="text-xs font-mono text-gray-400 uppercase tracking-widest cursor-pointer transition-colors"
          >
            Launch App →
          </motion.span>
        </Link>
      </motion.nav>

      {/* Hero content — mouse parallax container */}
      <motion.div
        style={{ y: contentY, opacity: heroOpacity, x: springX, rotateY: springX, rotateX: springY }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.09] text-white/70 font-mono text-[11px] uppercase tracking-widest mb-10 backdrop-blur-sm"
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ boxShadow: ['0 0 4px #0a84ff', '0 0 10px #0a84ff', '0 0 4px #0a84ff'] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
          />
          V2.0 Core Intelligence Online
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-7 leading-[1.08]"
          style={{
            background: 'linear-gradient(180deg, #fff 40%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          The Operating System<br />
          <span style={{ WebkitTextFillColor: '#fff' }}>for Smart Venues.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          ArenaOS AI unifies Digital Twins, Computer Vision, AI copilots, and live telemetry
          into one intelligent command center — helping operators detect, predict, and resolve
          incidents before they escalate.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-3 mb-14"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(10,132,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-accent text-white text-sm font-semibold rounded-lg"
            >
              Launch Command Center
              <motion.span
                className="inline-block"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </motion.button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.07)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/[0.04] border border-white/[0.09] text-white/80 text-sm font-medium rounded-lg"
            >
              See How It Works
            </motion.button>
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 1.0 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Built with</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {TECH.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.06 }}
                whileHover={{ color: '#e5e7eb' }}
                className="text-[11px] font-mono text-gray-600 cursor-default transition-colors"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 z-10"
      >
        <span className="text-[9px] font-mono uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section id="problem" className="py-28 px-6 relative bg-black">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-20"
        >
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">The Problem</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-white tracking-tight">Traditional operations are fragmented</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
            Venues today run on dozens of disconnected screens. When an incident happens, operators piece together the situation manually — losing critical seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          <motion.div
            variants={revealVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="p-7 rounded-2xl bg-red-950/[0.08] border border-red-500/[0.12]"
          >
            <div className="text-red-400/80 font-mono text-[10px] uppercase tracking-widest mb-7 border-b border-red-500/[0.12] pb-4">
              Legacy Systems
            </div>
            <motion.ul
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {[
                "Siloed CCTV grids with no spatial context",
                "Radio communication causing response lag",
                "Fragmented BMS, access control, fire dashboards",
                "Reactive decision-making under pressure",
              ].map((item, i) => (
                <motion.li key={i} variants={childVariant} className="flex items-start gap-3.5 text-gray-400 text-sm leading-relaxed">
                  <XCircle className="w-4 h-4 text-red-500/70 shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            variants={revealVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.1 }}
            className="p-7 rounded-2xl bg-accent/[0.04] border border-accent/[0.12] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,132,255,0.07),transparent_55%)]" />
            <div className="text-accent/80 font-mono text-[10px] uppercase tracking-widest mb-7 border-b border-accent/[0.12] pb-4 relative">
              The ArenaOS Paradigm
            </div>
            <motion.ul
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5 relative"
            >
              {[
                "One unified 3D command center for all systems",
                "AI copilot with numbers-driven incident analysis",
                "Live interactive digital twin synced to reality",
                "Proactive, predictive situational awareness",
              ].map((item, i) => (
                <motion.li key={i} variants={childVariant} className="flex items-start gap-3.5 text-white text-sm leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: Radar,       title: "Live Digital Twin",     desc: "A physically accurate 3D stadium mapped to real-time sensor telemetry. Every occupancy change, every zone alert, rendered live." },
    { icon: Bot,         title: "AI Copilot",            desc: "The copilot doesn't guess. It cites specific numbers: crowd density, ingress rate, bottleneck probability, and estimated time to critical." },
    { icon: Eye,         title: "Computer Vision",       desc: "OpenCV integration tracks crowd flow from CCTV feeds and converts physical density into structured spatial data." },
    { icon: Activity,    title: "Predictive Analytics",  desc: "Forecast anomalies before they escalate. AI models flag risk zones up to 4 minutes before congestion becomes critical." },
    { icon: Network,     title: "Autonomous Agents",     desc: "A drone swarm dispatches automatically to incident zones, casting volumetric scanning beams and streaming telemetry." },
    { icon: ShieldAlert, title: "Incident Response",     desc: "From detection to resolution in seconds. The operator approves — ArenaOS executes, logs, and summarizes the impact." },
  ]

  return (
    <section id="features" className="py-28 px-6 relative bg-black border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Platform</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Everything in one system</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">Every subsystem is intrinsically linked to the core intelligence engine.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={childVariant}
              whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.10)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] group cursor-default"
            >
              <motion.div whileHover={{ color: '#0a84ff' }} transition={{ duration: 0.2 }}>
                <f.icon className="w-7 h-7 text-gray-600 group-hover:text-accent transition-colors mb-5" />
              </motion.div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function PipelineSection() {
  const nodes = [
    { label: "IoT Sensors",          icon: Zap },
    { label: "Computer Vision",      icon: Eye },
    { label: "Telemetry Aggregator", icon: Activity },
    { label: "AI Agents",            icon: Bot },
    { label: "Decision Engine",      icon: ShieldAlert },
    { label: "Digital Twin",         icon: Radar },
    { label: "Operator UI",          icon: Globe },
  ]

  return (
    <section id="how-it-works" className="py-28 px-6 relative bg-black overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-20"
        >
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">How It Works</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">From physical reality to digital command</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base">A seamless, real-time pipeline: sensors feed AI, AI drives the twin, the twin empowers decisions.</p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-5 left-0 w-full h-px bg-white/[0.06] hidden lg:block" />
          <motion.div
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col lg:flex-row justify-between gap-6 relative z-10"
          >
            {nodes.map((node, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, y: 16, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="flex lg:flex-col items-center gap-4 group cursor-default"
              >
                <div className="w-10 h-10 rounded-full bg-[#07080a] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:border-accent/40 group-hover:bg-accent/[0.06] transition-all duration-300">
                  <node.icon className="w-4 h-4 text-gray-600 group-hover:text-accent transition-colors duration-300" />
                </div>
                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest text-left lg:text-center group-hover:text-gray-300 transition-colors max-w-[90px] leading-relaxed">
                  {node.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Animated counter hook
function useCounter(to: number, inView: boolean, duration = 1.5) {
  const [val, setVal] = useState(0)
  const ref = useRef(false)
  useEffect(() => {
    if (!inView || ref.current) return
    ref.current = true
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, duration])
  return val
}

function MetricCard({ value, label, prefix = '', suffix = '' }: { value: string; label: string; prefix?: string; suffix?: string }) {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      variants={childVariant}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-light text-white mb-2 tracking-tight tabular-nums">
        {prefix}{value}{suffix}
      </div>
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider leading-relaxed">{label}</div>
    </motion.div>
  )
}

function MetricsSection() {
  const metrics = [
    { value: "<1s",  label: "Incident Detection Latency" },
    { value: "92%",  label: "AI Confidence on Anomaly Detection" },
    { value: "42%",  label: "Avg. Wait Time Reduction" },
    { value: "24/7", label: "Autonomous System Monitoring" },
  ]
  return (
    <section className="py-24 px-6 relative bg-black border-y border-white/[0.04]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {metrics.map((s, i) => (
            <MetricCard key={i} value={s.value} label={s.label} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function ArchitectureSection() {
  const layers = [
    { icon: Eye,      label: "Perception",   detail: "OpenCV • Haar Cascades • Live Webcams",       delay: 0 },
    { icon: Server,   label: "Backend",      detail: "Python • FastAPI • WebSockets",               delay: 0.1 },
    { icon: Database, label: "Intelligence", detail: "NVIDIA NIM • Llama-3.3-70B • Zustand State", delay: 0.2 },
    { icon: Globe,    label: "Interface",    detail: "Next.js • React Three Fiber • Framer Motion", delay: 0.3, accent: true },
  ]

  return (
    <section id="architecture" className="py-28 px-6 relative bg-black">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">Technical Architecture</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white tracking-tight">Built on a modern intelligence stack</h2>
          <p className="text-gray-400 text-base">Four layers. One coherent operating system.</p>
        </motion.div>

        <div className="space-y-2">
          {layers.map((l, i) => (
            <React.Fragment key={i}>
              <motion.div
                variants={revealVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: l.delay }}
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-default ${
                  l.accent
                    ? 'bg-accent/[0.04] border-accent/[0.15]'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.09]'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${l.accent ? 'bg-accent/10' : 'bg-white/[0.04]'}`}>
                  <l.icon className={`w-4 h-4 ${l.accent ? 'text-accent' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold mb-0.5 ${l.accent ? 'text-accent' : 'text-white'}`}>{l.label} Layer</div>
                  <div className="text-xs text-gray-500 font-mono truncate">{l.detail}</div>
                </div>
                <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest hidden sm:block">L{i + 1}</span>
              </motion.div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <div className="w-px h-4 bg-white/[0.06]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

function CreatorSection() {
  return (
    <section className="py-28 px-6 relative bg-black overflow-hidden border-t border-white/[0.04]">
      <FloatingBlob
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent/[0.04] blur-[120px] pointer-events-none"
        duration={12} xRange={30} yRange={20}
      />

      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-14 items-center relative z-10">
        {/* Portrait */}
        <motion.div
          variants={revealVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="lg:col-span-4 relative"
        >
          <motion.div
            whileHover={{ scale: 1.015 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="aspect-[4/5] rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
            <motion.div
              className="absolute inset-0 bg-accent/10 blur-[80px]"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/portrait.png"
                alt={CREATOR_CONFIG.name}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
            </div>
            <div className="absolute bottom-5 left-5 z-20">
              <h3 className="text-lg font-bold text-white">{CREATOR_CONFIG.name}</h3>
              <p className="text-accent font-mono text-[10px] uppercase tracking-widest mt-0.5">{CREATOR_CONFIG.title1}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Story */}
        <div className="lg:col-span-8">
          <motion.div
            variants={revealVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mb-10"
          >
            <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-4">The Builder</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Why I built ArenaOS AI</h2>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                ArenaOS AI started from a simple question: <strong className="text-white font-medium">why are operators still forced to monitor dozens of disconnected screens during critical incidents?</strong>
              </p>
              <p>
                Modern venues generate enormous data from CCTV, sensors, access control, and building systems — but that information is scattered across silos. When a crowd surge or medical event occurs, there is no unified picture of reality.
              </p>
              <p>
                I built ArenaOS AI to demonstrate how Digital Twins, Computer Vision, and AI agents can collapse that complexity into a single spatial command center — where the software explains the situation and the operator makes the call.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-3 mb-8"
          >
            {[
              { icon: Cpu,     label: "Role",      value: "AI & Full Stack Developer" },
              { icon: Globe,   label: "University", value: CREATOR_CONFIG.title2 },
              { icon: Network, label: "Interests",  value: "AI Agents, Digital Twins" },
              { icon: Eye,     label: "Focus",      value: "Computer Vision, System Design" },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={childVariant}
                whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.09)' }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/[0.08] flex items-center justify-center text-accent shrink-0">
                  <card.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">{card.label}</div>
                  <div className="text-xs font-medium text-gray-200 mt-0.5">{card.value}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={staggerContainer(0.07)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3"
          >
            {[
              { href: CREATOR_CONFIG.github,   icon: Code,     label: 'GitHub' },
              { href: CREATOR_CONFIG.linkedin,  icon: Briefcase,label: 'LinkedIn', blue: true },
              { href: CREATOR_CONFIG.email,     icon: Mail,     label: 'Contact' },
            ].map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                variants={childVariant}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-white/80 text-xs transition-colors ${
                  link.blue
                    ? 'bg-[#0077b5]/[0.08] border-[#0077b5]/[0.20] hover:bg-[#0077b5]/[0.15]'
                    : 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <link.icon className={`w-3.5 h-3.5 ${link.blue ? 'text-[#0077b5]' : ''}`} />
                <span className="font-mono tracking-wider uppercase">{link.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function FooterCTA() {
  return (
    <footer className="py-28 px-6 relative bg-black overflow-hidden text-center flex flex-col items-center border-t border-white/[0.04]">
      <FloatingBlob
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-accent/[0.07] blur-[140px] pointer-events-none"
        duration={10} xRange={0} yRange={12}
      />

      <motion.div
        variants={revealVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="relative z-10 max-w-xl mx-auto mb-10"
      >
        <div className="text-[10px] font-mono text-accent uppercase tracking-widest mb-5">Ready?</div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
          Experience ArenaOS AI.
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          The full platform runs locally. Press{' '}
          <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-white/70 font-mono text-[11px]">1</kbd>,{' '}
          <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-white/70 font-mono text-[11px]">2</kbd>, or{' '}
          <kbd className="px-1.5 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded text-white/70 font-mono text-[11px]">3</kbd>{' '}
          inside the command center to trigger a live incident simulation.
        </p>
      </motion.div>

      <motion.div
        variants={revealVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 mb-20"
      >
        <Link href="/dashboard">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(10,132,255,0.38)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-semibold rounded-lg"
          >
            Launch Command Center
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
              className="inline-block"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </Link>
      </motion.div>

      <div className="w-full max-w-4xl border-t border-white/[0.05] pt-7 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-700 font-mono relative z-10">
        <div>© 2026 ArenaOS AI · Built for Smart Venues</div>
        <div className="flex gap-5 mt-4 md:mt-0">
          <a href={CREATOR_CONFIG.github}  className="hover:text-gray-400 transition-colors">GitHub</a>
          <a href={CREATOR_CONFIG.linkedin} className="hover:text-gray-400 transition-colors">LinkedIn</a>
          <a href={CREATOR_CONFIG.email} target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}

export default function PremiumLandingPage() {
  return (
    <div className="bg-black min-h-screen selection:bg-accent/20 selection:text-white">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <PipelineSection />
      <MetricsSection />
      <ArchitectureSection />
      <CreatorSection />
      <FooterCTA />
    </div>
  )
}
